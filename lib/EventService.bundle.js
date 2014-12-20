!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.EventService=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';

//------------------------------------------------------------------------------------
/**
 * The EventService implements the observer pattern.
 * Each event registered in the Event Registry has a name, callback, data, priority and channel.
 * It can later be triggered or removed based on these same criteria.
 *
 * - **name** is the way to identify one event from another.
 * - **callBack** is the action to perform.
 * - **data** is the additional information related to the event.
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
    Registry = _dereq_('./registry/Registry.js'),
    Event = _dereq_('./Event.js'),
    checkType = _dereq_('./utils/checkType.js'),
//------------------------------------------
    eventPrioritySort = function (a, b) {
        // sort by priority descending order
        return b.getPriority() - a.getPriority();
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
     *  - context: (optional) {any},                                        <br/>
     *  - data:    (optional) {any},                                        <br/>
     *  - priority: (optional) {number}
     *
     * @param  {object} [context] Context to execute the callback on.
     * @return {Event} event
     *
     * @example
     *   var evtService = new EventService();
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
            data: options.data,
            callBack: options.callBack,
            context: options.context
        });

        event._onStop = this.off.bind(this, event);

        return event;
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
     *       return (e.getName() === 'fooA' || e.getName() === 'fooB') && e.getPriority() < 10;
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
     *     selector: function(e){
     *       return e.getPriority() > 10 && e.getName() === 'nameFoo';
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
},{"./Event.js":2,"./registry/Registry.js":3,"./utils/checkType.js":5}],2:[function(_dereq_,module,exports){
/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';

//------------------------------------------------------------------------------------
/**
 * The class Event holds all information (name, callback, priority and channel) about the event registered.
 *
 * Extends the class RegistryItem abstracting basic concepts.
 *
 * @class Event
 * @extends RegistryItem
 */
//------------------------------------------------------------------------------------

var
    RegistryItem = _dereq_('./registry/RegistryItem.js'),
    checkType = _dereq_('./utils/checkType.js'),

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
    _checkIfStopped = function () {
        if (this.isStopped()) {
            throw new Error('Stopped event');
        }
    },
//---------------------------------------------------------
    /**
     * @method init
     * @for Event
     * @private
     *
     * @description
     * Event constructor, sets the values for priority, callback, context.
     * Throws TypeError if type mismatch.
     *
     * @param {object} options                                              <br/>
     *  - name: {string} name of the event,                                 <br/>
     *  - callBack: {function} function to execute when event is triggered, <br/>
     *  - channel: (optional) {string},                                     <br/>
     *  - context: (optional) {any},                                        <br/>
     *  - data:    (optional) {any},                                        <br/>
     *  - priority: (optional) {number}
     *
     * @throws TypeError
     */
    _init = function (options) {
        var _priority = checkType(options.priority, 'number', 'priority') || 1,
            _paused = false;

        checkType(options.name, 'string', 'name', true);
        checkType(options.channel, 'string', 'channel');

        Object.defineProperties(this, {
            // priority is writable, can be increased through the API
            priority: {
                get: function () {
                    return _priority;
                },
                set: function (priority) {
                    _priority = checkType(priority, 'number', 'priority');
                }
            },
            // read only
            callBack: {
                value: checkType(options.callBack, 'function', 'callBack', true)
            },
            // read only
            context: {
                value: options.context
            },
            // read only
            data: {
                value: options.data
            },
            // priority is writable, can be changed through the API
            paused: {
                get: function () {
                    return _paused;
                },
                set: function (paused) {
                    _paused = checkType(paused, 'boolean', 'paused', true);
                }
            }
        });
    },
//------------------------------------------
    /**
     * @method getId
     * @for Event
     *
     * @description
     * Returns the event id
     *
     * @return {integer}
     */
    _getId = function () {
        return this.id;
    },
//-----------------------------
    /**
     * @method getChannel
     * @for Event
     *
     * @description
     * Returns the event channel
     *
     * @return {string}
     */
    _getChannel = function () {
        return this.channel;
    },
//-----------------------------
    /**
     * @method getCallback
     * @for Event
     *
     * @description
     * Returns the event callBack
     *
     * @return {function}
     */
    _getCallback = function () {
        return this.callBack;
    },
//-----------------------------
    /**
     * @method getContext
     * @for Event
     *
     * @description
     * Returns the event context
     *
     * @return {any}
     */
    _getContext = function () {
        return this.context;
    },
//-----------------------------
    /**
     * @method getData
     * @for Event
     *
     * @description
     * Returns the event specific data
     *
     * @return {any}
     */
    _getData = function () {
        return this.data;
    },
//-----------------------------
    /**
     * @method getName
     * @for Event
     *
     * @description
     * Returns the event name
     *
     * @return {string}
     */
    _getName = function () {
        return this.name;
    },
//-----------------------------
    /**
     * @method getPriority
     * @for Event
     *
     * @description
     * Returns the event priority
     *
     * @return {integer}
     */
    _getPriority = function () {
        return this.priority;
    },
//------------------------------------------
    /**
     * @method incrementPriority
     * @for Event
     *
     * @description
     * Increments the original priority by 1 (default) or number provided.<br>
     * Throws Error if the event has been stopped before.                 <br>
     * Throws TypeError if type mismatch.
     *
     * @param {number} [step] (optional) Specific value to increment the priority by.
     *
     * @throws Error
     */
    _incrementPriority = function (step) {
        _checkIfStopped.call(this);
        this.priority += checkType(step, 'number', 'step') || 1;
    },
//------------------------------------------
    /**
     * @method decrementPriority
     * @for Event
     *
     * @description
     * Decrements the original priority by 1 (default) or number provided.<br>
     * Throws Error if the event has been stopped before.                 <br>
     * Throws TypeError if type mismatch.
     *
     * @param {number} [step] (optional) Specific value to decrement the priority by.
     *
     * @throws TypeError
     */
    _decrementPriority = function (step) {
        _checkIfStopped.call(this);
        this.priority -= checkType(step, 'number', 'step') || 1;
    },
//------------------------------------------
    /**
     * @method trigger
     * @for Event
     *
     * @param {...any} arguments applied to the callback
     *
     * @description
     * Calls the event callback providing the arguments which executes under the registered context.<br>
     * Throws Error if the event has been stopped before.
     *
     * @throws Error
     */
    _trigger = function () {
        _checkIfStopped.call(this);

        if (!this.isPaused()) {
            this.callBack.apply(this.context, arguments);
        }
    },
//------------------------------------------
    /**
     * @method isPaused
     * @for Event
     *
     * @description
     * Gives the 'paused' status of the event.
     *
     * @return {boolean}
     */
    _isPaused = function () {
        return this.paused === true;
    },
//------------------------------------------
    /**
     * @method pause
     * @for Event
     *
     * @description
     * Prevents the event callback to be called.         <br>
     * Throws Error if the event has been stopped before.
     *
     * @throws Error
     */
    _pause = function () {
        _checkIfStopped.call(this);
        this.paused = true;
    },
//------------------------------------------
    /**
     * @method resume
     * @for Event
     *
     * @description
     * Allows the event callback to be called again.<br>
     * Throws Error if the event has been stopped before.
     *
     * @throws Error
     */
    _resume = function () {
        _checkIfStopped.call(this);
        this.paused = false;
    },
//------------------------------------------
    /**
     * @method stop
     * @for Event
     *
     * @description
     * Prevents the event callback to be called or altered.
     * Removes it from the Event Service.
     */
    _stop = function () {
        Object.defineProperty(this, 'stopped', {
            value: true
        });
        // TODO maybe better (simple) way
        if (this._onStop !== undefined) {
            this._onStop();
        }
    },
//------------------------------------------
    /**
     * @method isStopped
     * @for Event
     *
     * @description
     * Returns the 'stopped' status of the event.
     *
     * @return {boolean}
     */
    _isStopped = function () {
        return this.stopped === true;
    };

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

var Event = RegistryItem.prototype.extends({
    init: _init,
    getId: _getId,
    getCallback: _getCallback,
    getChannel: _getChannel,
    getContext: _getContext,
    getData: _getData,
    getName: _getName,
    getPriority: _getPriority,
    incrementPriority: _incrementPriority,
    decrementPriority: _decrementPriority,
    trigger: _trigger,
    isPaused: _isPaused,
    pause: _pause,
    resume: _resume,
    stop: _stop,
    isStopped: _isStopped
});

//------------------------------------------

module.exports = Event;
},{"./registry/RegistryItem.js":4,"./utils/checkType.js":5}],3:[function(_dereq_,module,exports){
/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';

//------------------------------------------------------------------------------------
/**
 * The Registry is used for storage and management of items.
 *
 * @class Registry
 */
//------------------------------------------------------------------------------------

var
    RegistryItem = _dereq_('./RegistryItem.js'),
    checkType = _dereq_('../utils/checkType.js'),
    extendsFactory = _dereq_('../utils/extendsFactory.js'),
//------------------------------------------
    globalItemIdTracker = 0,
    _findItems = function (options, remove) {
        var
        // get the itemId if available through getter
            itemId = options.getId !== undefined ? options.getId() : options.id,
        // get the name if available through getter
            name = options.getName !== undefined ? options.getName() : options.name,
        // Identify from which channel; if not defined, target the default
            channelName = options.getChannel !== undefined ? options.getChannel() : options.channel,
        // get the channel from the registry
            registryChannel = this.getRegistryChannel(channelName),
            checkItemNameDefinedAndNonEmpty = function (itemNameArr) {
                return itemNameArr !== undefined && itemNameArr.length > 0;
            };

        // if the channel is empty
        if (Object.keys(registryChannel).length === 0) {
            // return empty, nothing matching found
            return [];
        }

        //-----------------------
        // single removal
        //-----------------------
        // if itemId is defined, only one item is targeted
        if (itemId !== undefined) {

            var nameArr = registryChannel[name];

            // if the name is not registered on the channel or empty
            if (!checkItemNameDefinedAndNonEmpty(nameArr)) {
                return [];
            }

            for (var i = 0; i < nameArr.length; i++) {
                var tmpId = nameArr[i].getId !== undefined ? nameArr[i].getId() : nameArr[i].id;
                // loop through to find the element matching the ID
                if (tmpId === itemId) {
                    // keep the index before removal
                    var item = nameArr[i];

                    if (remove === true) {
                        nameArr.splice(i, 1);
                    }
                    // return the removed element
                    return [item];
                }
            }
            // returns empty if not found
            return [];
        }

        //-----------------------
        // multi removal
        //-----------------------
        var removeItemFromList = function (targetedNameArr) {
            var matchingItems = [];

            // If the list is defined and has registered items
            if (checkItemNameDefinedAndNonEmpty(targetedNameArr)) {

                // browse the array in reverse order as we alter it
                for (var i = targetedNameArr.length - 1; i >= 0; i--) {

                    // for each item, call the selector function if provided
                    var tmpItem = targetedNameArr[i];
                    if (options.selector !== undefined ? options.selector.call(tmpItem, tmpItem) : true) {
                        matchingItems.push(tmpItem);
                        if (remove === true) {
                            targetedNameArr.splice(i, 1);
                        }
                    }
                }
            }

            return matchingItems;
        };

        if (name !== undefined) {
            // If an item name is specified
            // get the item list and apply the removeItemFromList
            return removeItemFromList(registryChannel[name]);
        }
        else {
            var matchingItems = [];
            // go through the list of registered item names
            Object.keys(registryChannel).forEach(function (name) {
                matchingItems = matchingItems.concat(removeItemFromList(registryChannel[name]));
            });
            return matchingItems;
        }
    };

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------


var
    /**
     * @description
     * Initializes the Registry properties.
     *
     * @constructor
     * @method constructor
     * @function
     * @for Registry
     */
    Registry = function () {
        this._channelRegistry = {
            defaultChannel: {}
        };

        this.init.apply(this, arguments);
    },
    /**
     * @method init
     * @for Registry
     * @private
     *
     * @description
     * Registry constructor, blank, should be overridden.
     */
    _init = function () {
    },
    /**
     * @method register
     * @for Registry
     *
     * @description
     * Registers a new item to the Registry on the given channel and name.
     * If the channel is not provided/undefined, the default channel is used.
     *
     * @param {object} options            <br/>
     *  - name: {string} name of the item,<br/>
     *  - channel: (optional) {string}
     *
     * @return {RegistryItem}
     */
    _register = function (options) {
        var
        // name should be a string
            name = checkType(options.name, 'string', 'name', true),

        // channel should be a string or undefined
            channel = checkType(options.channel, 'string', 'channel'),

        // get the channel corresponding to that name or a new one
            destRegistryChannel = this.getRegistryChannel(channel),

            item = this._itemFactory(options);

        // if no item is registered yet, initialize
        if (destRegistryChannel[name] === undefined) {
            destRegistryChannel[name] = [];
        }

        // add to the item list
        destRegistryChannel[name].push(item);

        return item;
    },
//------------------------------------------
    /**
     * @method _itemFactory
     * @for Registry
     * @private
     *
     * @description
     * This method creates the item to be added to the Registry. <br>
     * It is called by Registry register to create the item providing the arguments it received.<br>
     * Override when using a subclass of RegistryItem
     *
     * @param options
     * @return {RegistryItem}
     */
    _itemFactory = function (options) {
        // create a new Item with unique id
        return new RegistryItem({
            id: this._getNextId(),
            name: options.name,
            channel: options.channel
        });
    },
//------------------------------------------
    /**
     * @method _getNextId
     * @for Registry
     * @private
     *
     * @description
     * Returns the next unique Registry ID available.
     *
     * @return {number} available registry ID
     */
    _getNextId = function () {
        return globalItemIdTracker++;
    },
//------------------------------------------
    /**
     * @method remove
     * @for Registry
     *
     * @description
     * Removes item(s) from the specified channel based on the criteria and selector passed in parameters.<br>
     * If the channel is not provided, the default channel is used.
     *
     * @param {RegistryItem|object} options. The item returned by register or an object describing criteria:<br>
     *  - channel: (optional) {string},                                     <br/>
     *  - name: {string} name of the item(s) to remove,                     <br/>
     *  - selector: {function} It provides the items belonging to the channel, and name if specified; in a one by one basis to allow fine selection.
     *
     *  @return {array} Items removed from the Registry
     */
    _remove = function (options) {
        return _findItems.call(this, options, true);
    },
//------------------------------------------
    /**
     * @method filter
     * @for Registry
     *
     * @description
     * Selects and returns item(s) from the specified channel based on the criteria and selector passed in parameters.<br>
     * If the channel is not provided, the default channel is used.
     *
     * @param {object} options.                         <br/>
     *  - channel: (optional) {string},                 <br/>
     *  - name: {string} name of the item(s) to remove, <br/>
     *  - selector: {function} It provides the items belonging to the channel, and name if specified; in a one by one basis to allow fine selection.
     */
    _filter = function (options) {
        return _findItems.call(this, options);
    },
//------------------------------------------
    _getRegistryChannel = function (channelId) {
        // if the channelId is undefined, return the default channel
        if (channelId === undefined) {
            return this._channelRegistry.defaultChannel;
        }

        // initialize the channel if undefined
        if (this._channelRegistry[channelId] === undefined) {
            this._channelRegistry[channelId] = {};
        }
        return this._channelRegistry[channelId];
    },
//------------------------------------------
    _emptyRegistryChannel = function (channelId) {
        this._channelRegistry[channelId !== undefined ? channelId : 'defaultChannel'] = {};
    };

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

Registry.prototype.extends = extendsFactory(Registry);
Registry.prototype.init = _init;

Registry.prototype._itemFactory = _itemFactory;
Registry.prototype._getNextId = _getNextId;

Registry.prototype.filter = _filter;
Registry.prototype.register = _register;
Registry.prototype.remove = _remove;

Registry.prototype.emptyRegistryChannel = _emptyRegistryChannel;
Registry.prototype.getRegistryChannel = _getRegistryChannel;

//------------------------------------------

module.exports = Registry;
},{"../utils/checkType.js":5,"../utils/extendsFactory.js":6,"./RegistryItem.js":4}],4:[function(_dereq_,module,exports){
/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';

//------------------------------------------------------------------------------------
/**
 * The class RegistryItem holds generic information (id, name, channel) about the item registered.
 *
 * @class RegistryItem
 */
//------------------------------------------------------------------------------------

var
    extendsFactory = _dereq_('../utils/extendsFactory.js'),

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

    /**
     * @description
     * Initializes the RegistryItem properties.
     * Throws TypeError if missing argument.
     *
     * @param {object} options            <br/>
     *  - id: {any} id of the item,    <br/>
     *  - name: {any} name of the item,<br/>
     *  - channel: {any} (optional)
     *
     * @throws TypeError
     *
     * @constructor
     * @method constructor
     * @function
     * @for RegistryItem
     */
    RegistryItem = function (options) {

        if (!options) {
            throw new TypeError('RegistryItem arguments should be defined');
        }
        if (options.id === undefined) {
            throw new TypeError('RegistryItem (id) should be defined');
        }
        if (options.name === undefined) {
            throw new TypeError('RegistryItem (name) should be defined');
        }

        // Define the properties as READ ONLY, not enumerable
        Object.defineProperties(this, {
            id: {
                value: options.id
            },
            channel: {
                value: options.channel
            },
            name: {
                value: options.name
            }
        });

        // init to be overridden in child classes
        this.init.apply(this, arguments);
    },
    /**
     * @method init
     * @for RegistryItem
     * @private
     *
     * @description
     * Function called by the constructor, blank, should be overridden.
     */
    _init = function () {
    };

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

RegistryItem.prototype.extends = extendsFactory(RegistryItem);
RegistryItem.prototype.init = _init;

//------------------------------------------

module.exports = RegistryItem;

},{"../utils/extendsFactory.js":6}],5:[function(_dereq_,module,exports){
/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';
//------------------------------------------

/**
 * @method checkType
 * @private
 *
 * @param {any} value
 * @param {string} type
 * @param {string} varName
 * @param {Boolean} [strict]
 * @return {any} value
 *
 * @description
 * Validate the value against the type provided, if strict is "true" then undefined value will not be allowed
 */
var _checkType = function (value, type, varName, strict) {
    if (value === undefined && strict !== true) {
        return value;
    }

    if (typeof value !== type) {
        throw new TypeError('Invalid type' + (varName !== undefined ? ' for ' + varName : ''));
    }
    return value;
};

//------------------------------------------

module.exports = _checkType;
},{}],6:[function(_dereq_,module,exports){
/*global require, module, exports*/
/*jslint node: true */
'use strict';
//------------------------------------------

/**
 * @method extendsFactory
 *
 * @param SuperKlass
 * @param methodName
 * @return {Function}
 *
 * @description
 * Returns a function taking an object describing new class methods and properties, and the method name used for extends.
 * Call to the return function allows to extend SuperKlass adding/overriding properties.
 * The resulting child class will also have the same extends method name but defined for itself.
 *
 * @example
 *
 *     SuperKlass.prototype.extends = extendsFactory(SuperKlass,'extends');
 *     SuperKlass.prototype.foo = function () {};
 *     SuperKlass.prototype.bar = function () {};
 *
 *     var Klass = SuperKlass.prototype.extends({
 *         FOO_CST: 123,
 *         bar: function () {
 *             // override SuperKlass definition
 *         },
 *         baz: function () {}
 *     });
 *
 *     var k = new Klass();
 *     k.foo(); // inherited
 *     k.bar(); // overridden
 *
 */
var _extendsFactory = function (SuperKlass, methodName) {
    var extendMethodName = methodName || 'extends';
    return function (options) {
        options = options || {};

        var Klass = function () {
            SuperKlass.apply(this, arguments);
        };

        Klass.prototype = Object.create(SuperKlass.prototype);
        Klass.prototype.constructor = Klass;

        // redefine the extends for the
        Klass.prototype[extendMethodName] = _extendsFactory(Klass);

        Object.keys(options).forEach(function (attr) {
            Klass.prototype[attr] = options[attr];
        });

        return Klass;
    };
};

//------------------------------------------

module.exports = _extendsFactory;
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRXZlbnRTZXJ2aWNlLmpzIiwic3JjL0V2ZW50LmpzIiwic3JjL3JlZ2lzdHJ5L1JlZ2lzdHJ5LmpzIiwic3JjL3JlZ2lzdHJ5L1JlZ2lzdHJ5SXRlbS5qcyIsInNyYy91dGlscy9jaGVja1R5cGUuanMiLCJzcmMvdXRpbHMvZXh0ZW5kc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCBtb2R1bGUsIGV4cG9ydHMsIFR5cGVFcnJvciovXHJcbi8qanNsaW50IG5vZGU6IHRydWUgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLyoqXHJcbiAqIFRoZSBFdmVudFNlcnZpY2UgaW1wbGVtZW50cyB0aGUgb2JzZXJ2ZXIgcGF0dGVybi5cclxuICogRWFjaCBldmVudCByZWdpc3RlcmVkIGluIHRoZSBFdmVudCBSZWdpc3RyeSBoYXMgYSBuYW1lLCBjYWxsYmFjaywgZGF0YSwgcHJpb3JpdHkgYW5kIGNoYW5uZWwuXHJcbiAqIEl0IGNhbiBsYXRlciBiZSB0cmlnZ2VyZWQgb3IgcmVtb3ZlZCBiYXNlZCBvbiB0aGVzZSBzYW1lIGNyaXRlcmlhLlxyXG4gKlxyXG4gKiAtICoqbmFtZSoqIGlzIHRoZSB3YXkgdG8gaWRlbnRpZnkgb25lIGV2ZW50IGZyb20gYW5vdGhlci5cclxuICogLSAqKmNhbGxCYWNrKiogaXMgdGhlIGFjdGlvbiB0byBwZXJmb3JtLlxyXG4gKiAtICoqZGF0YSoqIGlzIHRoZSBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHJlbGF0ZWQgdG8gdGhlIGV2ZW50LlxyXG4gKiAtICoqcHJpb3JpdHkqKiBhbGxvd3MgdG8gcmFuayB0aGUgZXZlbnRzIGluIHRoZSBvcmRlciB5b3Ugd2FudCBwcmlvciBleGVjdXRpb24gb3IgYXMgYSBjcml0ZXJpYSBmb3IgcmVtb3ZhbC5cclxuICogLSAqKmNoYW5uZWwqKiBhbGxvd3MgZm9yIGNsdXN0ZXJpemF0aW9uIG9mIHRoZSBldmVudHMuXHJcbiAqIEV2ZW50cyBpbiBhIHNlcGFyYXRlIGNoYW5uZWwgd29uJ3QgYmUgYWZmZWN0ZWQgYnkgYW55IHRyaWdnZXIvcmVtb3ZhbCBvY2N1cnJpbmcgaW4gYSBkaWZmZXJlbnQgY2hhbm5lbC5cclxuICpcclxuICogSXQgZXh0ZW5kcyB0aGUgY2xhc3MgUmVnaXN0cnkgdGhhdCBhYnN0cmFjdCBtb3N0IG9mIHRoZSBldmVudCBzdG9yYWdlIGFuZCBtYW5hZ2VtZW50LlxyXG4gKlxyXG4gKiBAY2xhc3MgRXZlbnRTZXJ2aWNlXHJcbiAqIEBleHRlbmRzIFJlZ2lzdHJ5XHJcbiAqL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxudmFyXHJcbiAgICBSZWdpc3RyeSA9IHJlcXVpcmUoJy4vcmVnaXN0cnkvUmVnaXN0cnkuanMnKSxcclxuICAgIEV2ZW50ID0gcmVxdWlyZSgnLi9FdmVudC5qcycpLFxyXG4gICAgY2hlY2tUeXBlID0gcmVxdWlyZSgnLi91dGlscy9jaGVja1R5cGUuanMnKSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIGV2ZW50UHJpb3JpdHlTb3J0ID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAvLyBzb3J0IGJ5IHByaW9yaXR5IGRlc2NlbmRpbmcgb3JkZXJcclxuICAgICAgICByZXR1cm4gYi5nZXRQcmlvcml0eSgpIC0gYS5nZXRQcmlvcml0eSgpO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBvblxyXG4gICAgICogQGZvciBFdmVudFNlcnZpY2VcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gU3Vic2NyaWJlIHRvIHRoZSBldmVudCBpZGVudGlmaWVkIGJ5IFwibmFtZVwiLCB0byBiZSBleGVjdXRlZCB3aXRoIHRoZSBnaXZlbiBwcmlvcml0eSBvciBkZWZhdWx0ICgxKSBvbiB0aGUgZ2l2ZW4gY2hhbm5lbC5cclxuICAgICAqIElmIHRoZSBjaGFubmVsIGlzIG5vdCBwcm92aWRlZC91bmRlZmluZWQsIHRoZSBkZWZhdWx0IGNoYW5uZWwgaXMgdXNlZC5cclxuICAgICAqIFJldHVybnMgYW4gb2JqZWN0IEV2ZW50IGFsbG93aW5nIGZvciAocHJpb3JpdHkgY2hhbmdlLCBwYXVzZS9yZXN1bWUvc3RvcCkgc2VlIEV2ZW50IEFQSS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gbmFtZToge3N0cmluZ30gbmFtZSBvZiB0aGUgZXZlbnQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIGNhbGxCYWNrOiB7ZnVuY3Rpb259IGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBldmVudCBpcyB0cmlnZ2VyZWQsIDxici8+XHJcbiAgICAgKiAgLSBjaGFubmVsOiAob3B0aW9uYWwpIHtzdHJpbmd9LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gY29udGV4dDogKG9wdGlvbmFsKSB7YW55fSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIGRhdGE6ICAgIChvcHRpb25hbCkge2FueX0sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBwcmlvcml0eTogKG9wdGlvbmFsKSB7bnVtYmVyfVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge29iamVjdH0gW2NvbnRleHRdIENvbnRleHQgdG8gZXhlY3V0ZSB0aGUgY2FsbGJhY2sgb24uXHJcbiAgICAgKiBAcmV0dXJuIHtFdmVudH0gZXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogICB2YXIgZXZ0U2VydmljZSA9IG5ldyBFdmVudFNlcnZpY2UoKTtcclxuICAgICAqICAgdmFyIGV2dCA9IGV2dFNlcnZpY2Uub24oe1xyXG4gICAgICogICAgIG5hbWU6ICdldmVudE5hbWVGb28nLFxyXG4gICAgICogICAgIGNhbGxCYWNrOiBmdW5jdGlvbigpeyAgLy8gRG8gc3R1ZmYgfSxcclxuICAgICAqICAgICBjaGFubmVsOiAnY2hhbm5lbEZvbycsIC8vIE9wdGlvbmFsXHJcbiAgICAgKiAgICAgcHJpb3JpdHk6IDEgICAgICAgICAgICAvLyBPcHRpb25hbCBkZWZhdWx0IGlzIDFcclxuICAgICAqICAgfSk7XHJcbiAgICAgKiAgIC8vIFJlZ2lzdGVyIGV2ZW50IG5hbWVkICdldmVudE5hbWVGb28nIG9uIHRoZSBjaGFubmVsICdjaGFubmVsRm9vJyB3aXRoIGEgcHJpb3JpdHkgb2YgMVxyXG4gICAgICovXHJcbiAgICBfb24gPSBmdW5jdGlvbiAob3B0aW9ucywgY29udGV4dCkge1xyXG5cclxuICAgICAgICAvLyBzdHJpY3QgY2hlY2sgb24gb3B0aW9uLCB0aHJvdyBpZiBub3QgYSBkZWZpbmVkIG9iamVjdFxyXG4gICAgICAgIGNoZWNrVHlwZShvcHRpb25zLCAnb2JqZWN0JywgJ29wdGlvbnMnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZSBjb250ZXh0IGJlZm9yZSBwYXNzaW5nIHRvIHJlZ2lzdGVyXHJcbiAgICAgICAgb3B0aW9ucy5jb250ZXh0ID0gY29udGV4dDtcclxuXHJcbiAgICAgICAgLy8gY2FsbCB0byB0aGUgc3VwZXIgY2xhc3MgcmVnaXN0ZXJcclxuICAgICAgICB2YXIgZXZ0ID0gdGhpcy5yZWdpc3RlcihvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gc29ydCB0aGUgcmVnaXN0cnkgc3BhY2Ugd2hlcmUgdGhlIG5ldyBldmVudCB3YXMgYWRkZWRcclxuICAgICAgICB0aGlzLmdldFJlZ2lzdHJ5Q2hhbm5lbChvcHRpb25zLmNoYW5uZWwpW29wdGlvbnMubmFtZV0uc29ydChldmVudFByaW9yaXR5U29ydCk7XHJcblxyXG4gICAgICAgIHJldHVybiBldnQ7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIF9pdGVtRmFjdG9yeVxyXG4gICAgICogQGZvciBFdmVudFNlcnZpY2VcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBPdmVycmlkZXMgdGhlIG9yaWdpbmFsIGZhY3RvcnkgdG8gYWxsb3cgdXNpbmcgRXZlbnQgY2xhc3MgaW4gdGhlIFJlZ2lzdHJ5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtFdmVudH1cclxuICAgICAqL1xyXG4gICAgX2l0ZW1GYWN0b3J5ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBjcmVhdGUgYSBuZXcgRXZlbnQgd2l0aCB1bmlxdWUgaWQgZnJvbSB0aGUgc3VwZXIgY2xhc3NcclxuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoe1xyXG4gICAgICAgICAgICBpZDogdGhpcy5fZ2V0TmV4dElkKCksXHJcbiAgICAgICAgICAgIG5hbWU6IG9wdGlvbnMubmFtZSxcclxuICAgICAgICAgICAgY2hhbm5lbDogb3B0aW9ucy5jaGFubmVsLFxyXG4gICAgICAgICAgICBwcmlvcml0eTogb3B0aW9ucy5wcmlvcml0eSxcclxuICAgICAgICAgICAgZGF0YTogb3B0aW9ucy5kYXRhLFxyXG4gICAgICAgICAgICBjYWxsQmFjazogb3B0aW9ucy5jYWxsQmFjayxcclxuICAgICAgICAgICAgY29udGV4dDogb3B0aW9ucy5jb250ZXh0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV2ZW50Ll9vblN0b3AgPSB0aGlzLm9mZi5iaW5kKHRoaXMsIGV2ZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBvZmZcclxuICAgICAqIEBmb3IgRXZlbnRTZXJ2aWNlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBVbi1zdWJzY3JpYmUgb25lIC8gbWFueSBldmVudChzKSBmcm9tIHRoZSBzZXJ2aWNlIHdpdGhpbiB0aGUgc2FtZSBjaGFubmVsIGJhc2VkIG9uIHRoZSBzZWxlY3RvciBwYXNzZWQgaW4gcGFyYW1ldGVycy48YnI+XHJcbiAgICAgKiBJZiB0aGUgY2hhbm5lbCBpcyBub3QgcHJvdmlkZWQsIHRoZSBkZWZhdWx0IGNoYW5uZWwgaXMgdXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fG9iamVjdH0gb3B0aW9ucy4gVGhlIGV2ZW50IHJldHVybmVkIG9yIGFuIG9iamVjdCBkZXNjcmliaW5nIGNyaXRlcmlhOjxicj5cclxuICAgICAqICAtIGNoYW5uZWw6IChvcHRpb25hbCkge3N0cmluZ30sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBuYW1lOiB7c3RyaW5nfSBuYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUsICAgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gc2VsZWN0b3I6IHtmdW5jdGlvbn0gSXQgcHJvdmlkZXMgdGhlIGV2ZW50cyBiZWxvbmdpbmcgdG8gdGhlIGNoYW5uZWwsIGFuZCBuYW1lIGlmIHNwZWNpZmllZDsgaW4gYSBvbmUgYnkgb25lIGJhc2lzIHRvIGFsbG93IGZpbmUgc2VsZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiAgIGV2dFNlcnZpY2Uub2ZmKGV2dCk7XHJcbiAgICAgKiAgIC8vIHdpbGwgcmVtb3ZlIG9ubHkgdGhlIGV2ZW50IGV2dFxyXG4gICAgICpcclxuICAgICAqICAgZXZ0U2VydmljZS5vZmYoe1xyXG4gICAgICogICAgIG5hbWU6ICduYW1lRm9vJyxcclxuICAgICAqICAgICBjaGFubmVsOiAnY2hhbm5lbEZvbydcclxuICAgICAqICAgfSk7XHJcbiAgICAgKiAgIC8vIHdpbGwgcmVtb3ZlIGFsbCBldmVudHMgbmFtZWQgJ25hbWVGb28nIGluIHRoZSBjaGFubmVsICdjaGFubmVsRm9vJ1xyXG4gICAgICpcclxuICAgICAqICAgZXZ0U2VydmljZS5vZmYoe1xyXG4gICAgICogICAgIGNoYW5uZWw6ICdjaGFubmVsRm9vJyxcclxuICAgICAqICAgICBzZWxlY3RvcjogZnVuY3Rpb24oZSl7IC8vIHdpbGwgcHJvdmlkZSBvbmx5IGV2ZW50cyBmcm9tIHRoZSBjaGFubmVsICdjaGFubmVsRm9vJy5cclxuICAgICAqICAgICAgIHJldHVybiAoZS5nZXROYW1lKCkgPT09ICdmb29BJyB8fCBlLmdldE5hbWUoKSA9PT0gJ2Zvb0InKSAmJiBlLmdldFByaW9yaXR5KCkgPCAxMDtcclxuICAgICAqICAgICB9XHJcbiAgICAgKiAgIH0pO1xyXG4gICAgICogICAvLyB3aWxsIGNsZWFyIGFsbCBldmVudHMgbmFtZWQgJ2Zvb0EnIG9yICdmb29CJyBpbiB0aGUgY2hhbm5lbCAnY2hhbm5lbEZvbycgd2l0aCBhIHByaW9yaXR5IGxvd2VyIHRoYW4gMTAuXHJcbiAgICAgKi9cclxuICAgIF9vZmYgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBldmVudHNUb1JlbW92ZSA9IHRoaXMucmVtb3ZlKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBldmVudHNUb1JlbW92ZS5mb3JFYWNoKGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgICAgZXZ0LnN0b3AoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgdHJpZ2dlclxyXG4gICAgICogQGZvciBFdmVudFNlcnZpY2VcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFRyaWdnZXIgZXZlbnRzIGJhc2VkIG9uIHRoZSBldmVudCBuYW1lIG9yIGFuIG9iamVjdCBkZXNjcmliaW5nIHNlbGVjdG9ycy48YnI+XHJcbiAgICAgKiBJZiB0aGUgY2hhbm5lbCBpcyBub3QgcHJvdmlkZWQsIHRoZSBkZWZhdWx0IGNoYW5uZWwgaXMgdXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBvYmplY3QgZGVzY3JpYmluZyBjcml0ZXJpYTo8YnIvPlxyXG4gICAgICogIC0gY2hhbm5lbDogKG9wdGlvbmFsKSB7c3RyaW5nfSwgICAgICAgICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIG5hbWU6IHtzdHJpbmd9IG5hbWUgb2YgdGhlIGV2ZW50IHRvIHRyaWdnZXIsICAgIDxici8+XHJcbiAgICAgKiAgLSBzZWxlY3Rvcjoge2Z1bmN0aW9ufSBJdCBwcm92aWRlcyB0aGUgZXZlbnRzIGJlbG9uZ2luZyB0byB0aGUgY2hhbm5lbCwgYW5kIG5hbWUgaWYgc3BlY2lmaWVkOyBpbiBhIG9uZSBieSBvbmUgYmFzaXMgdG8gYWxsb3cgZmluZSBzZWxlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsuLi5hbnl9IGFyZ3VtZW50cyBwYXJhbWV0ZXJzIG9mIHRoZSB0cmlnZ2VyZWQgY2FsbGJhY2tcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogICBldnRTZXJ2aWNlLnRyaWdnZXIoe1xyXG4gICAgICogICAgIG5hbWU6ICduYW1lRm9vJ1xyXG4gICAgICogICB9LCAnZm9vJywgJ2JhcicsIDEyMyk7XHJcbiAgICAgKiAgIC8vIHRyaWdnZXJzIGFsbCBldmVudHMgbmFtZWQgJ25hbWVGb28nIG9uIGRlZmF1bHQgY2hhbm5lbCBwYXNzaW5nIGFyZ3VtZW50cyAnZm9vJywgJ2JhcicsIDEyM1xyXG4gICAgICpcclxuICAgICAqICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgKiAgICAgY2hhbm5lbDogJ2NoYW5uZWxGb28nLFxyXG4gICAgICogICAgIHNlbGVjdG9yOiBmdW5jdGlvbihlKXtcclxuICAgICAqICAgICAgIHJldHVybiBlLmdldFByaW9yaXR5KCkgPiAxMCAmJiBlLmdldE5hbWUoKSA9PT0gJ25hbWVGb28nO1xyXG4gICAgICogICAgIH1cclxuICAgICAqICAgfTtcclxuICAgICAqICAgZXZ0U2VydmljZS50cmlnZ2VyKG9wdGlvbnMsICdmb28nLCAnYmFyJywgMTIzKTtcclxuICAgICAqICAgLy8gdHJpZ2dlcnMgYWxsIGV2ZW50cyBvbiBjaGFubmVsICdjaGFubmVsRm9vJyB3aXRoIGEgcHJpb3JpdHkgZ3JlYXRlciB0aGFuIDEwIGFuZCBuYW1lZCAnbmFtZUZvbydcclxuICAgICAqICAgLy8gcGFzc2luZyBhcmd1bWVudHMgJ2ZvbycsICdiYXInLCAxMjNcclxuICAgICAqL1xyXG4gICAgX3RyaWdnZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBldmVudHNUb1RyaWdnZXIgPSB0aGlzLmZpbHRlcihvcHRpb25zKSxcclxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcblxyXG4gICAgICAgIGV2ZW50c1RvVHJpZ2dlci5zb3J0KGV2ZW50UHJpb3JpdHlTb3J0KTtcclxuXHJcbiAgICAgICAgZXZlbnRzVG9UcmlnZ2VyLmZvckVhY2goZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICBldnQudHJpZ2dlci5hcHBseShldnQsIGFyZ3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG52YXIgRXZlbnRTZXJ2aWNlID0gUmVnaXN0cnkucHJvdG90eXBlLmV4dGVuZHMoe1xyXG4gICAgb246IF9vbixcclxuICAgIG9mZjogX29mZixcclxuICAgIHRyaWdnZXI6IF90cmlnZ2VyLFxyXG5cclxuICAgIF9pdGVtRmFjdG9yeTogX2l0ZW1GYWN0b3J5XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXZlbnRTZXJ2aWNlOyIsIi8qZ2xvYmFsIG1vZHVsZSwgZXhwb3J0cywgVHlwZUVycm9yKi9cclxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogVGhlIGNsYXNzIEV2ZW50IGhvbGRzIGFsbCBpbmZvcm1hdGlvbiAobmFtZSwgY2FsbGJhY2ssIHByaW9yaXR5IGFuZCBjaGFubmVsKSBhYm91dCB0aGUgZXZlbnQgcmVnaXN0ZXJlZC5cclxuICpcclxuICogRXh0ZW5kcyB0aGUgY2xhc3MgUmVnaXN0cnlJdGVtIGFic3RyYWN0aW5nIGJhc2ljIGNvbmNlcHRzLlxyXG4gKlxyXG4gKiBAY2xhc3MgRXZlbnRcclxuICogQGV4dGVuZHMgUmVnaXN0cnlJdGVtXHJcbiAqL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxudmFyXHJcbiAgICBSZWdpc3RyeUl0ZW0gPSByZXF1aXJlKCcuL3JlZ2lzdHJ5L1JlZ2lzdHJ5SXRlbS5qcycpLFxyXG4gICAgY2hlY2tUeXBlID0gcmVxdWlyZSgnLi91dGlscy9jaGVja1R5cGUuanMnKSxcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBfY2hlY2tJZlN0b3BwZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9wcGVkIGV2ZW50Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBpbml0XHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogRXZlbnQgY29uc3RydWN0b3IsIHNldHMgdGhlIHZhbHVlcyBmb3IgcHJpb3JpdHksIGNhbGxiYWNrLCBjb250ZXh0LlxyXG4gICAgICogVGhyb3dzIFR5cGVFcnJvciBpZiB0eXBlIG1pc21hdGNoLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBuYW1lOiB7c3RyaW5nfSBuYW1lIG9mIHRoZSBldmVudCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gY2FsbEJhY2s6IHtmdW5jdGlvbn0gZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV2ZW50IGlzIHRyaWdnZXJlZCwgPGJyLz5cclxuICAgICAqICAtIGNoYW5uZWw6IChvcHRpb25hbCkge3N0cmluZ30sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBjb250ZXh0OiAob3B0aW9uYWwpIHthbnl9LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gZGF0YTogICAgKG9wdGlvbmFsKSB7YW55fSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIHByaW9yaXR5OiAob3B0aW9uYWwpIHtudW1iZXJ9XHJcbiAgICAgKlxyXG4gICAgICogQHRocm93cyBUeXBlRXJyb3JcclxuICAgICAqL1xyXG4gICAgX2luaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBfcHJpb3JpdHkgPSBjaGVja1R5cGUob3B0aW9ucy5wcmlvcml0eSwgJ251bWJlcicsICdwcmlvcml0eScpIHx8IDEsXHJcbiAgICAgICAgICAgIF9wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY2hlY2tUeXBlKG9wdGlvbnMubmFtZSwgJ3N0cmluZycsICduYW1lJywgdHJ1ZSk7XHJcbiAgICAgICAgY2hlY2tUeXBlKG9wdGlvbnMuY2hhbm5lbCwgJ3N0cmluZycsICdjaGFubmVsJyk7XHJcblxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcclxuICAgICAgICAgICAgLy8gcHJpb3JpdHkgaXMgd3JpdGFibGUsIGNhbiBiZSBpbmNyZWFzZWQgdGhyb3VnaCB0aGUgQVBJXHJcbiAgICAgICAgICAgIHByaW9yaXR5OiB7XHJcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3ByaW9yaXR5O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHByaW9yaXR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3ByaW9yaXR5ID0gY2hlY2tUeXBlKHByaW9yaXR5LCAnbnVtYmVyJywgJ3ByaW9yaXR5Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIHJlYWQgb25seVxyXG4gICAgICAgICAgICBjYWxsQmFjazoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNoZWNrVHlwZShvcHRpb25zLmNhbGxCYWNrLCAnZnVuY3Rpb24nLCAnY2FsbEJhY2snLCB0cnVlKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyByZWFkIG9ubHlcclxuICAgICAgICAgICAgY29udGV4dDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMuY29udGV4dFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyByZWFkIG9ubHlcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMuZGF0YVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBwcmlvcml0eSBpcyB3cml0YWJsZSwgY2FuIGJlIGNoYW5nZWQgdGhyb3VnaCB0aGUgQVBJXHJcbiAgICAgICAgICAgIHBhdXNlZDoge1xyXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9wYXVzZWQ7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAocGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3BhdXNlZCA9IGNoZWNrVHlwZShwYXVzZWQsICdib29sZWFuJywgJ3BhdXNlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGdldElkXHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCBpZFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2ludGVnZXJ9XHJcbiAgICAgKi9cclxuICAgIF9nZXRJZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH0sXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBnZXRDaGFubmVsXHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCBjaGFubmVsXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hhbm5lbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGFubmVsO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGdldENhbGxiYWNrXHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCBjYWxsQmFja1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbEJhY2s7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgZ2V0Q29udGV4dFxyXG4gICAgICogQGZvciBFdmVudFxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogUmV0dXJucyB0aGUgZXZlbnQgY29udGV4dFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2FueX1cclxuICAgICAqL1xyXG4gICAgX2dldENvbnRleHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dDtcclxuICAgIH0sXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBnZXREYXRhXHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCBzcGVjaWZpYyBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7YW55fVxyXG4gICAgICovXHJcbiAgICBfZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFJldHVybnMgdGhlIGV2ZW50IG5hbWVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIF9nZXROYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgZ2V0UHJpb3JpdHlcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFJldHVybnMgdGhlIGV2ZW50IHByaW9yaXR5XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7aW50ZWdlcn1cclxuICAgICAqL1xyXG4gICAgX2dldFByaW9yaXR5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByaW9yaXR5O1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBpbmNyZW1lbnRQcmlvcml0eVxyXG4gICAgICogQGZvciBFdmVudFxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogSW5jcmVtZW50cyB0aGUgb3JpZ2luYWwgcHJpb3JpdHkgYnkgMSAoZGVmYXVsdCkgb3IgbnVtYmVyIHByb3ZpZGVkLjxicj5cclxuICAgICAqIFRocm93cyBFcnJvciBpZiB0aGUgZXZlbnQgaGFzIGJlZW4gc3RvcHBlZCBiZWZvcmUuICAgICAgICAgICAgICAgICA8YnI+XHJcbiAgICAgKiBUaHJvd3MgVHlwZUVycm9yIGlmIHR5cGUgbWlzbWF0Y2guXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGVwXSAob3B0aW9uYWwpIFNwZWNpZmljIHZhbHVlIHRvIGluY3JlbWVudCB0aGUgcHJpb3JpdHkgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHRocm93cyBFcnJvclxyXG4gICAgICovXHJcbiAgICBfaW5jcmVtZW50UHJpb3JpdHkgPSBmdW5jdGlvbiAoc3RlcCkge1xyXG4gICAgICAgIF9jaGVja0lmU3RvcHBlZC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJpb3JpdHkgKz0gY2hlY2tUeXBlKHN0ZXAsICdudW1iZXInLCAnc3RlcCcpIHx8IDE7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGRlY3JlbWVudFByaW9yaXR5XHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBEZWNyZW1lbnRzIHRoZSBvcmlnaW5hbCBwcmlvcml0eSBieSAxIChkZWZhdWx0KSBvciBudW1iZXIgcHJvdmlkZWQuPGJyPlxyXG4gICAgICogVGhyb3dzIEVycm9yIGlmIHRoZSBldmVudCBoYXMgYmVlbiBzdG9wcGVkIGJlZm9yZS4gICAgICAgICAgICAgICAgIDxicj5cclxuICAgICAqIFRocm93cyBUeXBlRXJyb3IgaWYgdHlwZSBtaXNtYXRjaC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0ZXBdIChvcHRpb25hbCkgU3BlY2lmaWMgdmFsdWUgdG8gZGVjcmVtZW50IHRoZSBwcmlvcml0eSBieS5cclxuICAgICAqXHJcbiAgICAgKiBAdGhyb3dzIFR5cGVFcnJvclxyXG4gICAgICovXHJcbiAgICBfZGVjcmVtZW50UHJpb3JpdHkgPSBmdW5jdGlvbiAoc3RlcCkge1xyXG4gICAgICAgIF9jaGVja0lmU3RvcHBlZC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJpb3JpdHkgLT0gY2hlY2tUeXBlKHN0ZXAsICdudW1iZXInLCAnc3RlcCcpIHx8IDE7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIHRyaWdnZXJcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gey4uLmFueX0gYXJndW1lbnRzIGFwcGxpZWQgdG8gdGhlIGNhbGxiYWNrXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBDYWxscyB0aGUgZXZlbnQgY2FsbGJhY2sgcHJvdmlkaW5nIHRoZSBhcmd1bWVudHMgd2hpY2ggZXhlY3V0ZXMgdW5kZXIgdGhlIHJlZ2lzdGVyZWQgY29udGV4dC48YnI+XHJcbiAgICAgKiBUaHJvd3MgRXJyb3IgaWYgdGhlIGV2ZW50IGhhcyBiZWVuIHN0b3BwZWQgYmVmb3JlLlxyXG4gICAgICpcclxuICAgICAqIEB0aHJvd3MgRXJyb3JcclxuICAgICAqL1xyXG4gICAgX3RyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgX2NoZWNrSWZTdG9wcGVkLmNhbGwodGhpcyk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5pc1BhdXNlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbEJhY2suYXBwbHkodGhpcy5jb250ZXh0LCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgaXNQYXVzZWRcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEdpdmVzIHRoZSAncGF1c2VkJyBzdGF0dXMgb2YgdGhlIGV2ZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIF9pc1BhdXNlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXVzZWQgPT09IHRydWU7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIHBhdXNlXHJcbiAgICAgKiBAZm9yIEV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBQcmV2ZW50cyB0aGUgZXZlbnQgY2FsbGJhY2sgdG8gYmUgY2FsbGVkLiAgICAgICAgIDxicj5cclxuICAgICAqIFRocm93cyBFcnJvciBpZiB0aGUgZXZlbnQgaGFzIGJlZW4gc3RvcHBlZCBiZWZvcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHRocm93cyBFcnJvclxyXG4gICAgICovXHJcbiAgICBfcGF1c2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgX2NoZWNrSWZTdG9wcGVkLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCByZXN1bWVcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEFsbG93cyB0aGUgZXZlbnQgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFnYWluLjxicj5cclxuICAgICAqIFRocm93cyBFcnJvciBpZiB0aGUgZXZlbnQgaGFzIGJlZW4gc3RvcHBlZCBiZWZvcmUuXHJcbiAgICAgKlxyXG4gICAgICogQHRocm93cyBFcnJvclxyXG4gICAgICovXHJcbiAgICBfcmVzdW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIF9jaGVja0lmU3RvcHBlZC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIHN0b3BcclxuICAgICAqIEBmb3IgRXZlbnRcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFByZXZlbnRzIHRoZSBldmVudCBjYWxsYmFjayB0byBiZSBjYWxsZWQgb3IgYWx0ZXJlZC5cclxuICAgICAqIFJlbW92ZXMgaXQgZnJvbSB0aGUgRXZlbnQgU2VydmljZS5cclxuICAgICAqL1xyXG4gICAgX3N0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzdG9wcGVkJywge1xyXG4gICAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFRPRE8gbWF5YmUgYmV0dGVyIChzaW1wbGUpIHdheVxyXG4gICAgICAgIGlmICh0aGlzLl9vblN0b3AgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9vblN0b3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGlzU3RvcHBlZFxyXG4gICAgICogQGZvciBFdmVudFxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogUmV0dXJucyB0aGUgJ3N0b3BwZWQnIHN0YXR1cyBvZiB0aGUgZXZlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgX2lzU3RvcHBlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdG9wcGVkID09PSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG52YXIgRXZlbnQgPSBSZWdpc3RyeUl0ZW0ucHJvdG90eXBlLmV4dGVuZHMoe1xyXG4gICAgaW5pdDogX2luaXQsXHJcbiAgICBnZXRJZDogX2dldElkLFxyXG4gICAgZ2V0Q2FsbGJhY2s6IF9nZXRDYWxsYmFjayxcclxuICAgIGdldENoYW5uZWw6IF9nZXRDaGFubmVsLFxyXG4gICAgZ2V0Q29udGV4dDogX2dldENvbnRleHQsXHJcbiAgICBnZXREYXRhOiBfZ2V0RGF0YSxcclxuICAgIGdldE5hbWU6IF9nZXROYW1lLFxyXG4gICAgZ2V0UHJpb3JpdHk6IF9nZXRQcmlvcml0eSxcclxuICAgIGluY3JlbWVudFByaW9yaXR5OiBfaW5jcmVtZW50UHJpb3JpdHksXHJcbiAgICBkZWNyZW1lbnRQcmlvcml0eTogX2RlY3JlbWVudFByaW9yaXR5LFxyXG4gICAgdHJpZ2dlcjogX3RyaWdnZXIsXHJcbiAgICBpc1BhdXNlZDogX2lzUGF1c2VkLFxyXG4gICAgcGF1c2U6IF9wYXVzZSxcclxuICAgIHJlc3VtZTogX3Jlc3VtZSxcclxuICAgIHN0b3A6IF9zdG9wLFxyXG4gICAgaXNTdG9wcGVkOiBfaXNTdG9wcGVkXHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXZlbnQ7IiwiLypnbG9iYWwgbW9kdWxlLCBleHBvcnRzLCBUeXBlRXJyb3IqL1xyXG4vKmpzbGludCBub2RlOiB0cnVlICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8qKlxyXG4gKiBUaGUgUmVnaXN0cnkgaXMgdXNlZCBmb3Igc3RvcmFnZSBhbmQgbWFuYWdlbWVudCBvZiBpdGVtcy5cclxuICpcclxuICogQGNsYXNzIFJlZ2lzdHJ5XHJcbiAqL1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxudmFyXHJcbiAgICBSZWdpc3RyeUl0ZW0gPSByZXF1aXJlKCcuL1JlZ2lzdHJ5SXRlbS5qcycpLFxyXG4gICAgY2hlY2tUeXBlID0gcmVxdWlyZSgnLi4vdXRpbHMvY2hlY2tUeXBlLmpzJyksXHJcbiAgICBleHRlbmRzRmFjdG9yeSA9IHJlcXVpcmUoJy4uL3V0aWxzL2V4dGVuZHNGYWN0b3J5LmpzJyksXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBnbG9iYWxJdGVtSWRUcmFja2VyID0gMCxcclxuICAgIF9maW5kSXRlbXMgPSBmdW5jdGlvbiAob3B0aW9ucywgcmVtb3ZlKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBpdGVtSWQgaWYgYXZhaWxhYmxlIHRocm91Z2ggZ2V0dGVyXHJcbiAgICAgICAgICAgIGl0ZW1JZCA9IG9wdGlvbnMuZ2V0SWQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZ2V0SWQoKSA6IG9wdGlvbnMuaWQsXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBuYW1lIGlmIGF2YWlsYWJsZSB0aHJvdWdoIGdldHRlclxyXG4gICAgICAgICAgICBuYW1lID0gb3B0aW9ucy5nZXROYW1lICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmdldE5hbWUoKSA6IG9wdGlvbnMubmFtZSxcclxuICAgICAgICAvLyBJZGVudGlmeSBmcm9tIHdoaWNoIGNoYW5uZWw7IGlmIG5vdCBkZWZpbmVkLCB0YXJnZXQgdGhlIGRlZmF1bHRcclxuICAgICAgICAgICAgY2hhbm5lbE5hbWUgPSBvcHRpb25zLmdldENoYW5uZWwgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZ2V0Q2hhbm5lbCgpIDogb3B0aW9ucy5jaGFubmVsLFxyXG4gICAgICAgIC8vIGdldCB0aGUgY2hhbm5lbCBmcm9tIHRoZSByZWdpc3RyeVxyXG4gICAgICAgICAgICByZWdpc3RyeUNoYW5uZWwgPSB0aGlzLmdldFJlZ2lzdHJ5Q2hhbm5lbChjaGFubmVsTmFtZSksXHJcbiAgICAgICAgICAgIGNoZWNrSXRlbU5hbWVEZWZpbmVkQW5kTm9uRW1wdHkgPSBmdW5jdGlvbiAoaXRlbU5hbWVBcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtTmFtZUFyciAhPT0gdW5kZWZpbmVkICYmIGl0ZW1OYW1lQXJyLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSBjaGFubmVsIGlzIGVtcHR5XHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHJlZ2lzdHJ5Q2hhbm5lbCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIHJldHVybiBlbXB0eSwgbm90aGluZyBtYXRjaGluZyBmb3VuZFxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gc2luZ2xlIHJlbW92YWxcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gaWYgaXRlbUlkIGlzIGRlZmluZWQsIG9ubHkgb25lIGl0ZW0gaXMgdGFyZ2V0ZWRcclxuICAgICAgICBpZiAoaXRlbUlkICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBuYW1lQXJyID0gcmVnaXN0cnlDaGFubmVsW25hbWVdO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIG5hbWUgaXMgbm90IHJlZ2lzdGVyZWQgb24gdGhlIGNoYW5uZWwgb3IgZW1wdHlcclxuICAgICAgICAgICAgaWYgKCFjaGVja0l0ZW1OYW1lRGVmaW5lZEFuZE5vbkVtcHR5KG5hbWVBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZUFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcElkID0gbmFtZUFycltpXS5nZXRJZCAhPT0gdW5kZWZpbmVkID8gbmFtZUFycltpXS5nZXRJZCgpIDogbmFtZUFycltpXS5pZDtcclxuICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0byBmaW5kIHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBJRFxyXG4gICAgICAgICAgICAgICAgaWYgKHRtcElkID09PSBpdGVtSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBrZWVwIHRoZSBpbmRleCBiZWZvcmUgcmVtb3ZhbFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbmFtZUFycltpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lQXJyLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZW1vdmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2l0ZW1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJldHVybnMgZW1wdHkgaWYgbm90IGZvdW5kXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyBtdWx0aSByZW1vdmFsXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciByZW1vdmVJdGVtRnJvbUxpc3QgPSBmdW5jdGlvbiAodGFyZ2V0ZWROYW1lQXJyKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXRjaGluZ0l0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgbGlzdCBpcyBkZWZpbmVkIGFuZCBoYXMgcmVnaXN0ZXJlZCBpdGVtc1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tJdGVtTmFtZURlZmluZWRBbmROb25FbXB0eSh0YXJnZXRlZE5hbWVBcnIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYnJvd3NlIHRoZSBhcnJheSBpbiByZXZlcnNlIG9yZGVyIGFzIHdlIGFsdGVyIGl0XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdGFyZ2V0ZWROYW1lQXJyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIGl0ZW0sIGNhbGwgdGhlIHNlbGVjdG9yIGZ1bmN0aW9uIGlmIHByb3ZpZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtcEl0ZW0gPSB0YXJnZXRlZE5hbWVBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2VsZWN0b3IgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuc2VsZWN0b3IuY2FsbCh0bXBJdGVtLCB0bXBJdGVtKSA6IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hpbmdJdGVtcy5wdXNoKHRtcEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRlZE5hbWVBcnIuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hpbmdJdGVtcztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAobmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGFuIGl0ZW0gbmFtZSBpcyBzcGVjaWZpZWRcclxuICAgICAgICAgICAgLy8gZ2V0IHRoZSBpdGVtIGxpc3QgYW5kIGFwcGx5IHRoZSByZW1vdmVJdGVtRnJvbUxpc3RcclxuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZUl0ZW1Gcm9tTGlzdChyZWdpc3RyeUNoYW5uZWxbbmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIG1hdGNoaW5nSXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCB0aGUgbGlzdCBvZiByZWdpc3RlcmVkIGl0ZW0gbmFtZXNcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVnaXN0cnlDaGFubmVsKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBtYXRjaGluZ0l0ZW1zID0gbWF0Y2hpbmdJdGVtcy5jb25jYXQocmVtb3ZlSXRlbUZyb21MaXN0KHJlZ2lzdHJ5Q2hhbm5lbFtuYW1lXSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoaW5nSXRlbXM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxudmFyXHJcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIFJlZ2lzdHJ5IHByb3BlcnRpZXMuXHJcbiAgICAgKlxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAZnVuY3Rpb25cclxuICAgICAqIEBmb3IgUmVnaXN0cnlcclxuICAgICAqL1xyXG4gICAgUmVnaXN0cnkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbm5lbFJlZ2lzdHJ5ID0ge1xyXG4gICAgICAgICAgICBkZWZhdWx0Q2hhbm5lbDoge31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgaW5pdFxyXG4gICAgICogQGZvciBSZWdpc3RyeVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFJlZ2lzdHJ5IGNvbnN0cnVjdG9yLCBibGFuaywgc2hvdWxkIGJlIG92ZXJyaWRkZW4uXHJcbiAgICAgKi9cclxuICAgIF9pbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCByZWdpc3RlclxyXG4gICAgICogQGZvciBSZWdpc3RyeVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogUmVnaXN0ZXJzIGEgbmV3IGl0ZW0gdG8gdGhlIFJlZ2lzdHJ5IG9uIHRoZSBnaXZlbiBjaGFubmVsIGFuZCBuYW1lLlxyXG4gICAgICogSWYgdGhlIGNoYW5uZWwgaXMgbm90IHByb3ZpZGVkL3VuZGVmaW5lZCwgdGhlIGRlZmF1bHQgY2hhbm5lbCBpcyB1c2VkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIG5hbWU6IHtzdHJpbmd9IG5hbWUgb2YgdGhlIGl0ZW0sPGJyLz5cclxuICAgICAqICAtIGNoYW5uZWw6IChvcHRpb25hbCkge3N0cmluZ31cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtSZWdpc3RyeUl0ZW19XHJcbiAgICAgKi9cclxuICAgIF9yZWdpc3RlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgLy8gbmFtZSBzaG91bGQgYmUgYSBzdHJpbmdcclxuICAgICAgICAgICAgbmFtZSA9IGNoZWNrVHlwZShvcHRpb25zLm5hbWUsICdzdHJpbmcnLCAnbmFtZScsIHRydWUpLFxyXG5cclxuICAgICAgICAvLyBjaGFubmVsIHNob3VsZCBiZSBhIHN0cmluZyBvciB1bmRlZmluZWRcclxuICAgICAgICAgICAgY2hhbm5lbCA9IGNoZWNrVHlwZShvcHRpb25zLmNoYW5uZWwsICdzdHJpbmcnLCAnY2hhbm5lbCcpLFxyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIGNoYW5uZWwgY29ycmVzcG9uZGluZyB0byB0aGF0IG5hbWUgb3IgYSBuZXcgb25lXHJcbiAgICAgICAgICAgIGRlc3RSZWdpc3RyeUNoYW5uZWwgPSB0aGlzLmdldFJlZ2lzdHJ5Q2hhbm5lbChjaGFubmVsKSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLl9pdGVtRmFjdG9yeShvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gaWYgbm8gaXRlbSBpcyByZWdpc3RlcmVkIHlldCwgaW5pdGlhbGl6ZVxyXG4gICAgICAgIGlmIChkZXN0UmVnaXN0cnlDaGFubmVsW25hbWVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGVzdFJlZ2lzdHJ5Q2hhbm5lbFtuYW1lXSA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYWRkIHRvIHRoZSBpdGVtIGxpc3RcclxuICAgICAgICBkZXN0UmVnaXN0cnlDaGFubmVsW25hbWVdLnB1c2goaXRlbSk7XHJcblxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBfaXRlbUZhY3RvcnlcclxuICAgICAqIEBmb3IgUmVnaXN0cnlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIHRoZSBpdGVtIHRvIGJlIGFkZGVkIHRvIHRoZSBSZWdpc3RyeS4gPGJyPlxyXG4gICAgICogSXQgaXMgY2FsbGVkIGJ5IFJlZ2lzdHJ5IHJlZ2lzdGVyIHRvIGNyZWF0ZSB0aGUgaXRlbSBwcm92aWRpbmcgdGhlIGFyZ3VtZW50cyBpdCByZWNlaXZlZC48YnI+XHJcbiAgICAgKiBPdmVycmlkZSB3aGVuIHVzaW5nIGEgc3ViY2xhc3Mgb2YgUmVnaXN0cnlJdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm4ge1JlZ2lzdHJ5SXRlbX1cclxuICAgICAqL1xyXG4gICAgX2l0ZW1GYWN0b3J5ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBjcmVhdGUgYSBuZXcgSXRlbSB3aXRoIHVuaXF1ZSBpZFxyXG4gICAgICAgIHJldHVybiBuZXcgUmVnaXN0cnlJdGVtKHtcclxuICAgICAgICAgICAgaWQ6IHRoaXMuX2dldE5leHRJZCgpLFxyXG4gICAgICAgICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXHJcbiAgICAgICAgICAgIGNoYW5uZWw6IG9wdGlvbnMuY2hhbm5lbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBfZ2V0TmV4dElkXHJcbiAgICAgKiBAZm9yIFJlZ2lzdHJ5XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCB1bmlxdWUgUmVnaXN0cnkgSUQgYXZhaWxhYmxlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gYXZhaWxhYmxlIHJlZ2lzdHJ5IElEXHJcbiAgICAgKi9cclxuICAgIF9nZXROZXh0SWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbEl0ZW1JZFRyYWNrZXIrKztcclxuICAgIH0sXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIEBtZXRob2QgcmVtb3ZlXHJcbiAgICAgKiBAZm9yIFJlZ2lzdHJ5XHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZW1vdmVzIGl0ZW0ocykgZnJvbSB0aGUgc3BlY2lmaWVkIGNoYW5uZWwgYmFzZWQgb24gdGhlIGNyaXRlcmlhIGFuZCBzZWxlY3RvciBwYXNzZWQgaW4gcGFyYW1ldGVycy48YnI+XHJcbiAgICAgKiBJZiB0aGUgY2hhbm5lbCBpcyBub3QgcHJvdmlkZWQsIHRoZSBkZWZhdWx0IGNoYW5uZWwgaXMgdXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1JlZ2lzdHJ5SXRlbXxvYmplY3R9IG9wdGlvbnMuIFRoZSBpdGVtIHJldHVybmVkIGJ5IHJlZ2lzdGVyIG9yIGFuIG9iamVjdCBkZXNjcmliaW5nIGNyaXRlcmlhOjxicj5cclxuICAgICAqICAtIGNoYW5uZWw6IChvcHRpb25hbCkge3N0cmluZ30sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBuYW1lOiB7c3RyaW5nfSBuYW1lIG9mIHRoZSBpdGVtKHMpIHRvIHJlbW92ZSwgICAgICAgICAgICAgICAgICAgICA8YnIvPlxyXG4gICAgICogIC0gc2VsZWN0b3I6IHtmdW5jdGlvbn0gSXQgcHJvdmlkZXMgdGhlIGl0ZW1zIGJlbG9uZ2luZyB0byB0aGUgY2hhbm5lbCwgYW5kIG5hbWUgaWYgc3BlY2lmaWVkOyBpbiBhIG9uZSBieSBvbmUgYmFzaXMgdG8gYWxsb3cgZmluZSBzZWxlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogIEByZXR1cm4ge2FycmF5fSBJdGVtcyByZW1vdmVkIGZyb20gdGhlIFJlZ2lzdHJ5XHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfZmluZEl0ZW1zLmNhbGwodGhpcywgb3B0aW9ucywgdHJ1ZSk7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGZpbHRlclxyXG4gICAgICogQGZvciBSZWdpc3RyeVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogU2VsZWN0cyBhbmQgcmV0dXJucyBpdGVtKHMpIGZyb20gdGhlIHNwZWNpZmllZCBjaGFubmVsIGJhc2VkIG9uIHRoZSBjcml0ZXJpYSBhbmQgc2VsZWN0b3IgcGFzc2VkIGluIHBhcmFtZXRlcnMuPGJyPlxyXG4gICAgICogSWYgdGhlIGNoYW5uZWwgaXMgbm90IHByb3ZpZGVkLCB0aGUgZGVmYXVsdCBjaGFubmVsIGlzIHVzZWQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XHJcbiAgICAgKiAgLSBjaGFubmVsOiAob3B0aW9uYWwpIHtzdHJpbmd9LCAgICAgICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIG5hbWU6IHtzdHJpbmd9IG5hbWUgb2YgdGhlIGl0ZW0ocykgdG8gcmVtb3ZlLCA8YnIvPlxyXG4gICAgICogIC0gc2VsZWN0b3I6IHtmdW5jdGlvbn0gSXQgcHJvdmlkZXMgdGhlIGl0ZW1zIGJlbG9uZ2luZyB0byB0aGUgY2hhbm5lbCwgYW5kIG5hbWUgaWYgc3BlY2lmaWVkOyBpbiBhIG9uZSBieSBvbmUgYmFzaXMgdG8gYWxsb3cgZmluZSBzZWxlY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIF9maWx0ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfZmluZEl0ZW1zLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICB9LFxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgX2dldFJlZ2lzdHJ5Q2hhbm5lbCA9IGZ1bmN0aW9uIChjaGFubmVsSWQpIHtcclxuICAgICAgICAvLyBpZiB0aGUgY2hhbm5lbElkIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBkZWZhdWx0IGNoYW5uZWxcclxuICAgICAgICBpZiAoY2hhbm5lbElkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoYW5uZWxSZWdpc3RyeS5kZWZhdWx0Q2hhbm5lbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIGNoYW5uZWwgaWYgdW5kZWZpbmVkXHJcbiAgICAgICAgaWYgKHRoaXMuX2NoYW5uZWxSZWdpc3RyeVtjaGFubmVsSWRdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hhbm5lbFJlZ2lzdHJ5W2NoYW5uZWxJZF0gPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoYW5uZWxSZWdpc3RyeVtjaGFubmVsSWRdO1xyXG4gICAgfSxcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIF9lbXB0eVJlZ2lzdHJ5Q2hhbm5lbCA9IGZ1bmN0aW9uIChjaGFubmVsSWQpIHtcclxuICAgICAgICB0aGlzLl9jaGFubmVsUmVnaXN0cnlbY2hhbm5lbElkICE9PSB1bmRlZmluZWQgPyBjaGFubmVsSWQgOiAnZGVmYXVsdENoYW5uZWwnXSA9IHt9O1xyXG4gICAgfTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5SZWdpc3RyeS5wcm90b3R5cGUuZXh0ZW5kcyA9IGV4dGVuZHNGYWN0b3J5KFJlZ2lzdHJ5KTtcclxuUmVnaXN0cnkucHJvdG90eXBlLmluaXQgPSBfaW5pdDtcclxuXHJcblJlZ2lzdHJ5LnByb3RvdHlwZS5faXRlbUZhY3RvcnkgPSBfaXRlbUZhY3Rvcnk7XHJcblJlZ2lzdHJ5LnByb3RvdHlwZS5fZ2V0TmV4dElkID0gX2dldE5leHRJZDtcclxuXHJcblJlZ2lzdHJ5LnByb3RvdHlwZS5maWx0ZXIgPSBfZmlsdGVyO1xyXG5SZWdpc3RyeS5wcm90b3R5cGUucmVnaXN0ZXIgPSBfcmVnaXN0ZXI7XHJcblJlZ2lzdHJ5LnByb3RvdHlwZS5yZW1vdmUgPSBfcmVtb3ZlO1xyXG5cclxuUmVnaXN0cnkucHJvdG90eXBlLmVtcHR5UmVnaXN0cnlDaGFubmVsID0gX2VtcHR5UmVnaXN0cnlDaGFubmVsO1xyXG5SZWdpc3RyeS5wcm90b3R5cGUuZ2V0UmVnaXN0cnlDaGFubmVsID0gX2dldFJlZ2lzdHJ5Q2hhbm5lbDtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlZ2lzdHJ5OyIsIi8qZ2xvYmFsIG1vZHVsZSwgZXhwb3J0cywgVHlwZUVycm9yKi9cclxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogVGhlIGNsYXNzIFJlZ2lzdHJ5SXRlbSBob2xkcyBnZW5lcmljIGluZm9ybWF0aW9uIChpZCwgbmFtZSwgY2hhbm5lbCkgYWJvdXQgdGhlIGl0ZW0gcmVnaXN0ZXJlZC5cclxuICpcclxuICogQGNsYXNzIFJlZ2lzdHJ5SXRlbVxyXG4gKi9cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbnZhclxyXG4gICAgZXh0ZW5kc0ZhY3RvcnkgPSByZXF1aXJlKCcuLi91dGlscy9leHRlbmRzRmFjdG9yeS5qcycpLFxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIFJlZ2lzdHJ5SXRlbSBwcm9wZXJ0aWVzLlxyXG4gICAgICogVGhyb3dzIFR5cGVFcnJvciBpZiBtaXNzaW5nIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgPGJyLz5cclxuICAgICAqICAtIGlkOiB7YW55fSBpZCBvZiB0aGUgaXRlbSwgICAgPGJyLz5cclxuICAgICAqICAtIG5hbWU6IHthbnl9IG5hbWUgb2YgdGhlIGl0ZW0sPGJyLz5cclxuICAgICAqICAtIGNoYW5uZWw6IHthbnl9IChvcHRpb25hbClcclxuICAgICAqXHJcbiAgICAgKiBAdGhyb3dzIFR5cGVFcnJvclxyXG4gICAgICpcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxyXG4gICAgICogQGZ1bmN0aW9uXHJcbiAgICAgKiBAZm9yIFJlZ2lzdHJ5SXRlbVxyXG4gICAgICovXHJcbiAgICBSZWdpc3RyeUl0ZW0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAoIW9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVnaXN0cnlJdGVtIGFyZ3VtZW50cyBzaG91bGQgYmUgZGVmaW5lZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlZ2lzdHJ5SXRlbSAoaWQpIHNob3VsZCBiZSBkZWZpbmVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm5hbWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWdpc3RyeUl0ZW0gKG5hbWUpIHNob3VsZCBiZSBkZWZpbmVkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZWZpbmUgdGhlIHByb3BlcnRpZXMgYXMgUkVBRCBPTkxZLCBub3QgZW51bWVyYWJsZVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcclxuICAgICAgICAgICAgaWQ6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLmlkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNoYW5uZWw6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLmNoYW5uZWxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmFtZToge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubmFtZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGluaXQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBjaGlsZCBjbGFzc2VzXHJcbiAgICAgICAgdGhpcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWV0aG9kIGluaXRcclxuICAgICAqIEBmb3IgUmVnaXN0cnlJdGVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogRnVuY3Rpb24gY2FsbGVkIGJ5IHRoZSBjb25zdHJ1Y3RvciwgYmxhbmssIHNob3VsZCBiZSBvdmVycmlkZGVuLlxyXG4gICAgICovXHJcbiAgICBfaW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIH07XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuUmVnaXN0cnlJdGVtLnByb3RvdHlwZS5leHRlbmRzID0gZXh0ZW5kc0ZhY3RvcnkoUmVnaXN0cnlJdGVtKTtcclxuUmVnaXN0cnlJdGVtLnByb3RvdHlwZS5pbml0ID0gX2luaXQ7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWdpc3RyeUl0ZW07XHJcbiIsIi8qZ2xvYmFsIG1vZHVsZSwgZXhwb3J0cywgVHlwZUVycm9yKi9cclxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogQG1ldGhvZCBjaGVja1R5cGVcclxuICogQHByaXZhdGVcclxuICpcclxuICogQHBhcmFtIHthbnl9IHZhbHVlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YXJOYW1lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3N0cmljdF1cclxuICogQHJldHVybiB7YW55fSB2YWx1ZVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogVmFsaWRhdGUgdGhlIHZhbHVlIGFnYWluc3QgdGhlIHR5cGUgcHJvdmlkZWQsIGlmIHN0cmljdCBpcyBcInRydWVcIiB0aGVuIHVuZGVmaW5lZCB2YWx1ZSB3aWxsIG5vdCBiZSBhbGxvd2VkXHJcbiAqL1xyXG52YXIgX2NoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSwgdmFyTmFtZSwgc3RyaWN0KSB7XHJcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBzdHJpY3QgIT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gdHlwZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgdHlwZScgKyAodmFyTmFtZSAhPT0gdW5kZWZpbmVkID8gJyBmb3IgJyArIHZhck5hbWUgOiAnJykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59O1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gX2NoZWNrVHlwZTsiLCIvKmdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGV4cG9ydHMqL1xyXG4vKmpzbGludCBub2RlOiB0cnVlICovXHJcbid1c2Ugc3RyaWN0JztcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBAbWV0aG9kIGV4dGVuZHNGYWN0b3J5XHJcbiAqXHJcbiAqIEBwYXJhbSBTdXBlcktsYXNzXHJcbiAqIEBwYXJhbSBtZXRob2ROYW1lXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRha2luZyBhbiBvYmplY3QgZGVzY3JpYmluZyBuZXcgY2xhc3MgbWV0aG9kcyBhbmQgcHJvcGVydGllcywgYW5kIHRoZSBtZXRob2QgbmFtZSB1c2VkIGZvciBleHRlbmRzLlxyXG4gKiBDYWxsIHRvIHRoZSByZXR1cm4gZnVuY3Rpb24gYWxsb3dzIHRvIGV4dGVuZCBTdXBlcktsYXNzIGFkZGluZy9vdmVycmlkaW5nIHByb3BlcnRpZXMuXHJcbiAqIFRoZSByZXN1bHRpbmcgY2hpbGQgY2xhc3Mgd2lsbCBhbHNvIGhhdmUgdGhlIHNhbWUgZXh0ZW5kcyBtZXRob2QgbmFtZSBidXQgZGVmaW5lZCBmb3IgaXRzZWxmLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAgICAgU3VwZXJLbGFzcy5wcm90b3R5cGUuZXh0ZW5kcyA9IGV4dGVuZHNGYWN0b3J5KFN1cGVyS2xhc3MsJ2V4dGVuZHMnKTtcclxuICogICAgIFN1cGVyS2xhc3MucHJvdG90eXBlLmZvbyA9IGZ1bmN0aW9uICgpIHt9O1xyXG4gKiAgICAgU3VwZXJLbGFzcy5wcm90b3R5cGUuYmFyID0gZnVuY3Rpb24gKCkge307XHJcbiAqXHJcbiAqICAgICB2YXIgS2xhc3MgPSBTdXBlcktsYXNzLnByb3RvdHlwZS5leHRlbmRzKHtcclxuICogICAgICAgICBGT09fQ1NUOiAxMjMsXHJcbiAqICAgICAgICAgYmFyOiBmdW5jdGlvbiAoKSB7XHJcbiAqICAgICAgICAgICAgIC8vIG92ZXJyaWRlIFN1cGVyS2xhc3MgZGVmaW5pdGlvblxyXG4gKiAgICAgICAgIH0sXHJcbiAqICAgICAgICAgYmF6OiBmdW5jdGlvbiAoKSB7fVxyXG4gKiAgICAgfSk7XHJcbiAqXHJcbiAqICAgICB2YXIgayA9IG5ldyBLbGFzcygpO1xyXG4gKiAgICAgay5mb28oKTsgLy8gaW5oZXJpdGVkXHJcbiAqICAgICBrLmJhcigpOyAvLyBvdmVycmlkZGVuXHJcbiAqXHJcbiAqL1xyXG52YXIgX2V4dGVuZHNGYWN0b3J5ID0gZnVuY3Rpb24gKFN1cGVyS2xhc3MsIG1ldGhvZE5hbWUpIHtcclxuICAgIHZhciBleHRlbmRNZXRob2ROYW1lID0gbWV0aG9kTmFtZSB8fCAnZXh0ZW5kcyc7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICAgICAgdmFyIEtsYXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBTdXBlcktsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgS2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlcktsYXNzLnByb3RvdHlwZSk7XHJcbiAgICAgICAgS2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2xhc3M7XHJcblxyXG4gICAgICAgIC8vIHJlZGVmaW5lIHRoZSBleHRlbmRzIGZvciB0aGVcclxuICAgICAgICBLbGFzcy5wcm90b3R5cGVbZXh0ZW5kTWV0aG9kTmFtZV0gPSBfZXh0ZW5kc0ZhY3RvcnkoS2xhc3MpO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XHJcbiAgICAgICAgICAgIEtsYXNzLnByb3RvdHlwZVthdHRyXSA9IG9wdGlvbnNbYXR0cl07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBLbGFzcztcclxuICAgIH07XHJcbn07XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBfZXh0ZW5kc0ZhY3Rvcnk7Il19
