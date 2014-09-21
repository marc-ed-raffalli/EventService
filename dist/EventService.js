/*global define, TypeError*/
define([
], function () {
    'use strict';

    var globalEvtIdTracker = 0,
        _serviceEventList = {
            defaultChannel: {}
        },
    //------------------------------------------
        removeEventFromList = function (channel, evtName, evt) {
            var srcChannelEvtList = _serviceEventList[channel] || _serviceEventList.defaultChannel,
                srcEventArr = srcChannelEvtList[evtName];

            // If the event list still has events registered
            if (srcEventArr.length > 0) {
                srcEventArr.splice(srcEventArr.indexOf(evt), 1);
            }
        },
    //----------------------------------------------------------------------
        eventPrioritySort = function (a, b) {
            return (a.priority < b.priority ? -1 : (a.priority === b.priority ? 0 : 1));
        },
    //------------------------------------------
        setObjectProperty = function (attr, value, prop) {
            prop.enumerable = prop.enumerable || false;
            prop.configurable = prop.configurable || false;
            prop.value = value;
            Object.defineProperty(this, attr, prop);
        },
    //------------------------------------------
        setObjectReadOnlyProperty = function (attr, value) {
            setObjectProperty.call(this, attr, value, {
                writable: false
            });
        },
    //------------------------------------------
        setObjectWritableProperty = function (attr, value) {
            setObjectProperty.call(this, attr, value, {
                writable: true
            });
        },
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
        checkType = function (value, type, varName, strict) {
            if (value === undefined && strict !== true) {
                return value;
            }

            if (typeof value !== type) {
                throw new TypeError('Invalid type' + (varName !== undefined ? ' for ' + varName : ''));
            }
            return value;
        },
    //------------------------------------------
        sortEventList = function (channel, evtName) {
            var destEvtList = _serviceEventList[channel] || _serviceEventList.defaultChannel;

            if (destEvtList[evtName] !== undefined && destEvtList[evtName].length !== 0) {
                destEvtList[evtName].sort(eventPrioritySort);
            }
        };

    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    /**
     * @class Event
     */
    var Event = function (options) {
        setObjectReadOnlyProperty.call(this, 'evtId', options.evtId);
        setObjectReadOnlyProperty.call(this, 'callBack', options.callBack);
        setObjectReadOnlyProperty.call(this, 'channel', options.channel);
        setObjectReadOnlyProperty.call(this, 'evtName', options.evtName);
        setObjectReadOnlyProperty.call(this, 'context', options.context);

        setObjectWritableProperty.call(this, 'priority', options.priority || 0);
    };
    //------------------------------------------
    Event.prototype = {
        /**
         * @method incrementPriority
         * @for Event
         *
         * @param {number} [step] (optional) Value to increment the priority by
         *
         * @description
         * Increment the original priority by 1 (default) or number provided.
         * Throw Error if the event has been stopped before.
         *
         * @throws Error
         */
        incrementPriority: function (step) {
            this._checkIfStopped();
            this.priority += checkType(step, 'number', 'step') || 1;
            sortEventList(this.channel, this.evtName);
        },
        /**
         * @method decrementPriority
         * @for Event
         *
         * @param {number} [step] (optional) Value to decrement the priority by
         *
         * @description
         * Decrement the original priority by 1 (default) or number provided.
         * Throw Error if the event has been stopped before.
         *
         * @throws Error
         */
        decrementPriority: function (step) {
            this._checkIfStopped();
            this.priority -= checkType(step, 'number', 'step') || 1;
            sortEventList(this.channel, this.evtName);
        },
        /**
         * @method trigger
         * @for Event
         *
         * @param args {Array} arguments applied to the callback
         *
         * @description
         * Call the event callback providing the arguments.
         * Throw Error if the event has been stopped before.
         *
         * @throws Error
         */
        trigger: function (args) {
            this._checkIfStopped();

            if (!this.isPaused()) {
                this.callBack.apply(this.context, args);
            }
        },
        /**
         * @method isPaused
         * @for Event
         *
         * @description
         * Give the 'paused' status of the event.
         *
         * @return {boolean}
         */
        isPaused: function () {
            return this.paused === true;
        },
        /**
         * @method pause
         * @for Event
         *
         * @description
         * Prevent the event callback to be called.
         * Throw Error if the event has been stopped before.
         *
         * @throws Error
         */
        pause: function () {
            this._checkIfStopped();
            setObjectWritableProperty.call(this, 'paused', true);
        },
        /**
         * @method resume
         * @for Event
         *
         * @description
         * Allow the event callback to be called again by the Event Service.
         * Throw Error if the event has been stopped before.
         *
         * @throws Error
         */
        resume: function () {
            this._checkIfStopped();
            setObjectWritableProperty.call(this, 'paused', false);
        },
        /**
         * @method stop
         * @for Event
         *
         * @description
         * Prevent the event callback to be called by removing it from the Event Service.
         */
        stop: function () {
            setObjectReadOnlyProperty.call(this, 'stopped', true);
            removeEventFromList(this.channel, this.evtName, this);
        },
        /**
         * @method isStopped
         * @for Event
         *
         * @description
         * Give the 'stopped' status of the event.
         *
         * @return {boolean}
         */
        isStopped: function () {
            return this.stopped === true;
        },
        /**
         * @method _checkIfStopped
         * @for Event
         * @private
         *
         * @description
         * Check if the event is stopped, throw if true.
         *
         * @throws Error
         */
        _checkIfStopped: function () {
            if (this.isStopped()) {
                throw new Error('Stopped event');
            }
        }
    };

    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    /**
     * @class EventService
     * @constructor
     */
    var EventService = function () {
    };
    //------------------------------------------
    EventService.prototype = {
        /**
         * @method on
         * @for EventService
         *
         * @param {object} options
         *  evtName: string,<br>
         *  callBack: function,<br>
         *  channel: (optional) string,<br>
         *  priority: (optional) number,
         * @param  {object} [context]
         * @return {Event} event
         *
         * @description
         * Subscribe to the event identified by "evtName" on the specified channel,
         * If the channel is not provided, the default channel is used.<br>
         * The priority allows the events to be executed in a certain order. It also allows to select by priority event to execute.<br>
         * Returns the event object.
         *
         * @example
         *     var evtService = new EventService(),
         *     options = {
         *       evtName: 'eventNameFoo',
         *       callBack: function(){ // Do stuff },
         *       channel: 'channelFoo', // Optional
         *       priority: 1            // Optional default is 0
         *     };
         *     var evt = evtService.on(options, this);
         *     // Register event named 'eventNameFoo' on the channel 'channelFoo' with a priority of 1
         */
        on: function (options, context) {
            var evtId = globalEvtIdTracker++,
                channel = checkType(options.channel, 'string', 'channel'),
                priority = checkType(options.priority, 'number', 'priority'),
                evtName = checkType(options.evtName, 'string', 'evtName', true),
                clbk = checkType(options.callBack, 'function', 'callBack', true),
                destEvtList = _serviceEventList.defaultChannel,
                evt = new Event({
                    evtId: evtId,
                    evtName: evtName,
                    channel: channel,
                    priority: priority,
                    callBack: clbk,
                    context: context || this
                });

            if (channel !== undefined) {
                if (_serviceEventList[channel] === undefined) {
                    _serviceEventList[channel] = {};
                }
                destEvtList = _serviceEventList[channel];
            }

            if (destEvtList[evtName] === undefined) {
                destEvtList[evtName] = [];
            }

            destEvtList[evtName].push(evt);
            destEvtList[evtName].sort(eventPrioritySort);

            return evt;
        },
        /**
         * @method off
         * @for EventService
         *
         * @param options Event or object. The event returned by on or an object describing selectors:<br>
         *  evtName: {string} (optional),<br>
         *  channel: {string} (optional),<br>
         *  prioritySelector: {function} (optional)
         *
         * @description
         * Un-subscribe one / many event(s) from the service.
         * The off functions allows for filtering and can un-subscribe many events based on the filters passed in parameters.<br>
         * If the channel is not provided, the default channel is used.
         *
         * @example
         *      evtService.off(evt);
         *      // will clear the event evt
         *      var options = {
         *        evtName: 'evtNameFoo',
         *        channel: 'channelFoo',
         *        prioritySelector: function(priority){
         *          return priority > 10;
         *        }
         *      }
         *      evtService.off(options);
         *      // will clear all events name 'evtNameFoo' in the channel 'channelFoo' with a priority greater than 10
         */
        off: function (options) {
            if (options instanceof Event) {
                // channel and evtName are not writable in the Event class
                // call Event.prototype.stop()
                options.stop();
            }
            else if (typeof options === 'object') {
                var channel = checkType(options.channel, 'string', 'channel') || 'defaultChannel',
                    evtName = checkType(options.evtName, 'string', 'evtName'),
                    prioritySelector = checkType(options.prioritySelector, 'function', 'prioritySelector'),

                // Identify from which channel, if not defined target the default
                    srcChannel = channel !== undefined ? _serviceEventList[channel] : _serviceEventList.defaultChannel;

                // referenced channel does not exist
                if (srcChannel === undefined) {
                    return false;
                }

                var wipeArray = function (arr) {
                        while (arr.length > 0) {
                            arr.pop();
                        }
                    },
                    filterOutEvtFromList = function (targetedEvtNameArr) {
                        // If the list has registered events
                        if (targetedEvtNameArr === undefined || targetedEvtNameArr.length === 0) {
                            return;
                        }

                        if (prioritySelector === undefined) {
                            // If no selector is defined, stop all the events registered under that name
                            // Array.prototype.slice()
                            // use the shallow copy as stop alter the original array
                            targetedEvtNameArr.slice().forEach(function (evt) {
                                evt.stop();
                            });
                        }
                        else {
                            // Array.prototype.slice()
                            // use the shallow copy as stop alter the original array
                            targetedEvtNameArr.slice().forEach(function (evt) {
                                // apply the selector provided
                                if (prioritySelector.call(this, evt.priority)) {
                                    evt.stop();
                                }
                            });
                        }
                    };

                if (evtName !== undefined) {
                    // If an event name is specified and exists, get the event list and apply the filterOutEvtFromList
                    filterOutEvtFromList(srcChannel[evtName]);
                }
                else {
                    // If the channel exists, go through the list of registered event names
                    Object.keys(srcChannel).forEach(function (registeredEvtName) {
                        filterOutEvtFromList(srcChannel[registeredEvtName]);
                    });
                }
            }
        },
        /**
         * @method trigger
         * @for EventService
         *
         * @param options object / string The event name or an object describing selectors<br>
         *  evtName: {string} (optional),<br>
         *  channel: {string} (optional),<br>
         *  prioritySelector: {function} (optional), // filters event by priority
         * @param {any} [args]* parameters of the triggered callback
         *
         * @description
         * Trigger events based on the event name or an object describing selectors.<br>
         * If the channel is not provided, the default channel is used.
         *
         * @example
         *     evtService.trigger('evtNameFoo', 'foo');
         *     // triggers all events named 'evtNameFoo' on default channel passing argument 'foo'
         *
         *     evtService.trigger('evtNameFoo', 'foo', 'bar', 123);
         *     // triggers all events named 'evtNameFoo' on default channel passing arguments 'foo', 'bar', 123
         *
         *     var options = {
         *       evtName: 'evtNameFoo',
         *       channel: 'channelFoo',
         *       prioritySelector: function(priority){
         *         return priority > 10;
         *       }
         *     };
         *     evtService.trigger(options, 'foo', 'bar', 123);
         *     // triggers all events event named 'evtNameFoo' on channel 'channelFoo' with a priority greater than 10
         *     // passing arguments 'foo', 'bar', 123
         */
        trigger: function (options, args) {
            var evtName,
                channel,
                prioritySelector;

            if (typeof options === 'object') {
                // select event of a specified name
                evtName = checkType(options.evtName, 'string', 'evtName');
                // select event of a specified channel
                channel = checkType(options.channel, 'string', 'channel');
                // select which priority should be executed
                prioritySelector = checkType(options.prioritySelector, 'function', 'prioritySelector');
            } else {
                // select event of a specified channel
                evtName = checkType(options, 'string', 'evtName', true);
            }

            // Identify from which channel take the event
            var srcChannel = channel !== undefined ? _serviceEventList[channel] : _serviceEventList.defaultChannel,
            // If the channel exists, take the event list
                evtNamesInChannelArr = srcChannel !== undefined ? Object.keys(srcChannel) : [],
                srcEvtList;

            if (evtName !== undefined) {
                // If an event name is specified and exists, get the event list
                srcEvtList = srcChannel[evtName] !== undefined ? srcChannel[evtName] : [];
            } else {
                srcEvtList = [];

                evtNamesInChannelArr.forEach(function (registeredEvtName) {
                    if (srcChannel[registeredEvtName].length > 0) {
                        // concat does nor alter the original array
                        srcEvtList = srcEvtList.concat(srcChannel[registeredEvtName]);
                    }
                });
            }

            if (srcEvtList.length > 0) {

                if (prioritySelector !== undefined) {
                    // filter does nor alter the original array
                    srcEvtList = srcEvtList.filter(function (evt) {
                        return prioritySelector.call(this, evt.priority);
                    });
                }

                srcEvtList.sort(eventPrioritySort);

                args = Array.prototype.slice.call(arguments, 1);

                srcEvtList.forEach(function (evt) {
                    evt.trigger(args);
                });
            }
        }
    };

    return EventService;
});
