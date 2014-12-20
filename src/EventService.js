/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';

//------------------------------------------------------------------------------------
/**
 * The EventService implements the observer pattern.
 * Each event registered in the Event Registry has a name, callback, priority and channel.
 * It can later be triggered or removed based on these same criteria.
 *
 * - **name** is the way to identify one event from another.
 * - **callBack** is the action to perform.
 * - **priority** allows to rank the events in the order you want prior execution or as a criteria for removal.
 * - **channel** allows for clusterization of the events.
 * Events in a separate channel won't be affected by any trigger/removal occurring in a different channel.
 *
 * It extends the class Registry that abstract most of the event storage and management.
 *
 * @class EventService
 * @extends Registry
 */
//------------------------------------------------------------------------------------

var
    Registry = require('./registry/Registry.js'),
    Event = require('./Event.js'),
    checkType = require('./utils/checkType.js'),
//------------------------------------------
    eventPrioritySort = function (a, b) {
        // sort by priority descending order
        return b.priority - a.priority;
    },
//------------------------------------------
    /**
     * @method on
     * @for EventService
     *
     * @description Subscribe to the event identified by "name", to be executed with the given priority or default (1) on the given channel.
     * If the channel is not provided/undefined, the default channel is used.
     * Returns an object Event allowing for (priority change, pause/resume/stop) see Event API.
     *
     * @param {object} options                                              <br/>
     *  - name: {string} name of the event,                                 <br/>
     *  - callBack: {function} function to execute when event is triggered, <br/>
     *  - channel: (optional) {string},                                     <br/>
     *  - priority: (optional) {number}
     *
     * @param  {object} [context] Context to execute the callback on.
     * @return {Event} event
     *
     * @example
     *   var evtService = new EventService(),
     *   var evt = evtService.on({
     *     name: 'eventNameFoo',
     *     callBack: function(){  // Do stuff },
     *     channel: 'channelFoo', // Optional
     *     priority: 1            // Optional default is 1
     *   });
     *   // Register event named 'eventNameFoo' on the channel 'channelFoo' with a priority of 1
     */
    _on = function (options, context) {

        // strict check on option, throw if not a defined object
        checkType(options, 'object', 'options', true);

        // add the context before passing to register
        options.context = context;

        // call to the super class register
        var evt = this.register(options);

        // sort the registry space where the new event was added
        this.getRegistryChannel(options.channel)[options.name].sort(eventPrioritySort);

        return evt;
    },
//------------------------------------------
    /**
     * @method _itemFactory
     * @for EventService
     * @private
     *
     * @description
     * Overrides the original factory to allow using Event class in the Registry.
     *
     * @param options
     * @return {Event}
     */
    _itemFactory = function (options) {
        // create a new Event with unique id from the super class
        var event = new Event({
            id: this._getNextId(),
            name: options.name,
            channel: options.channel,
            priority: options.priority,
            callBack: options.callBack,
            context: options.context
        });

        event._onStop = this.off.bind(this, event);

        return  event;
    },
//------------------------------------------
    /**
     * @method off
     * @for EventService
     *
     * @description
     * Un-subscribe one / many event(s) from the service within the same channel based on the selector passed in parameters.<br>
     * If the channel is not provided, the default channel is used.
     *
     * @param {Event|object} options. The event returned or an object describing criteria:<br>
     *  - channel: (optional) {string},                                     <br/>
     *  - name: {string} name of the event to remove,                       <br/>
     *  - selector: {function} It provides the events belonging to the channel, and name if specified; in a one by one basis to allow fine selection.
     *
     * @example
     *   evtService.off(evt);
     *   // will remove only the event evt
     *
     *   evtService.off({
     *     name: 'nameFoo',
     *     channel: 'channelFoo'
     *   });
     *   // will remove all events named 'nameFoo' in the channel 'channelFoo'
     *
     *   evtService.off({
     *     channel: 'channelFoo',
     *     selector: function(e){ // will provide only events from the channel 'channelFoo'.
     *       return (e.name === 'fooA' || e.name === 'fooB') && e.priority < 10;
     *     }
     *   });
     *   // will clear all events named 'fooA' or 'fooB' in the channel 'channelFoo' with a priority lower than 10.
     */
    _off = function (options) {
        var eventsToRemove = this.remove(options);

        eventsToRemove.forEach(function (evt) {
            evt.stop();
        });
    },
//------------------------------------------
    /**
     * @method trigger
     * @for EventService
     *
     * @description
     * Trigger events based on the event name or an object describing selectors.<br>
     * If the channel is not provided, the default channel is used.
     *
     * @param {object} options object describing criteria:<br/>
     *  - channel: (optional) {string},                   <br/>
     *  - name: {string} name of the event to trigger,    <br/>
     *  - selector: {function} It provides the events belonging to the channel, and name if specified; in a one by one basis to allow fine selection.
     *
     * @param {...any} arguments parameters of the triggered callback
     *
     * @example
     *   evtService.trigger({
     *     name: 'nameFoo'
     *   }, 'foo', 'bar', 123);
     *   // triggers all events named 'nameFoo' on default channel passing arguments 'foo', 'bar', 123
     *
     *   var options = {
     *     channel: 'channelFoo',
     *     selector: function(event){
     *       return e.priority > 10 && name ==='nameFoo';
     *     }
     *   };
     *   evtService.trigger(options, 'foo', 'bar', 123);
     *   // triggers all events on channel 'channelFoo' with a priority greater than 10 and named 'nameFoo'
     *   // passing arguments 'foo', 'bar', 123
     */
    _trigger = function (options) {
        var eventsToTrigger = this.filter(options),
            args = Array.prototype.slice.call(arguments, 1);

        eventsToTrigger.sort(eventPrioritySort);

        eventsToTrigger.forEach(function (evt) {
            evt.trigger.apply(evt, args);
        });
    };

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

var EventService = Registry.prototype.extends({
    on: _on,
    off: _off,
    trigger: _trigger,

    _itemFactory: _itemFactory
});

//------------------------------------------

module.exports = EventService;