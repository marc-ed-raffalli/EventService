/*global define, TypeError*/
define([
], function () {
    'use strict';

    var EventService = function () {
        },
        globalEvtIdTracker = 0,
        eventList = {
            defaultChannel: {}
        },
        eventPrioritySort = function (a, b) {
            return (a.priority < b.priority ? -1 : (a.priority === b.priority ? 0 : 1));
        };

    //----------------------------------------------------------------------

    EventService.prototype = {
        /**
         * @param options
         *  evtName: string,
         *  callBack: function,
         *  channel: (optional) string,
         *  priority: (optional) number,
         * @param context
         * @returns {string}
         *
         * @description
         * Register the event identified by "evtName" on the specified channel, default one if none specified.
         * The priority allows the events to be executed in a certain order and select priority to execute.
         * Returns the event id.
         *
         * @example
         *   var evtService = new EventService(),
         *   options = {
         *     evtName: 'eventNameFoo',
         *     callBack: function(){ \/* Do stuff *\/ },
         *     channel: 'channelFoo',      // Optional
         *     priority: 1      // Optional default is 0
         *   };
         *   var evtIt = evtService.on(options, this);
         */
        on: function (options, context) {
            var evtId = globalEvtIdTracker++,
                channel = checkType(options.channel, 'string', 'channel'),
                priority = checkType(options.priority, 'number', 'priority') || 0,
                evtName = checkType(options.evtName, 'string', 'evtName', true),
                clbk = checkType(options.callBack, 'function', 'callBack', true),
                destEvtList = eventList.defaultChannel,
                evt = {
                    evtId: evtId,
                    priority: priority,
                    callBack: clbk,
                    context: context || this
                };

            if (channel !== undefined) {

                if (eventList[channel] === undefined) {
                    eventList[channel] = {};
                }

                destEvtList = eventList[channel];
            }

            if (destEvtList[evtName] === undefined) {
                destEvtList[evtName] = [];
            }

            destEvtList[evtName].push(evt);
            destEvtList[evtName].sort(eventPrioritySort);

            return (channel !== undefined ? channel + ':' : '') + evtId;
        },
        /**
         * @param options {object || string} The event name or an object describing selectors
         *  evtId: {string},
         *  evtName: {string} (optional),
         *  channel: {string} (optional),
         *  prioritySelector: {function} (optional)
         *
         * @description
         * The off functions allows for filtering and can un-subscribe many events based on the filters passed in parameters.
         * If the channel is not provided, the default channel is used.
         *
         * @example
         *   evtService.off(evtId);
         *   var options = {
         *     evtName: 'evtNameFoo',
         *     channel: 'channelFoo',
         *     prioritySelector: function(priority){
         *       return priority > 10;
         *     }
         *   }
         *   evtService.off(options);
         */
        off: function (options) {

            var evtId,
                prioritySelector,
                channel,
                evtName;

            if (typeof options === 'object') {
                prioritySelector = checkType(options.prioritySelector, 'function', 'prioritySelector');
                channel = checkType(options.channel, 'string', 'channel');
                evtName = checkType(options.evtName, 'string', 'evtName');

                // Identify from which channel, if not defined target the default
                var srcChannel = channel !== undefined ? eventList[channel] : eventList.defaultChannel,

                // If the channel exists, take the list of event name
                    evtNamesInChannelArr = srcChannel !== undefined ? Object.keys(srcChannel) : [],

                // referenced as the fasted way to clean array keeping the reference
                    whipeArray = function (arr) {
                        while (arr.length > 0) {
                            arr.pop();
                        }
                    },

                    filterRemoveEvtFromList = function (targetedEvtNameArr) {
                        if (prioritySelector === undefined) {
                            // If no selector is defined, wipe all the events registered under that name
                            whipeArray(targetedEvtNameArr);
                        }
                        else {
                            var evtToRemoveArr = targetedEvtNameArr.filter(function (evt) {
                                return prioritySelector.call(this, evt.priority);
                            });

                            evtToRemoveArr.forEach(function (evtToRemove) {
                                targetedEvtNameArr.splice(targetedEvtNameArr.indexOf(evtToRemove), 1);
                            });
                        }
                    };

                if (evtName !== undefined) {
                    // If an event name is specified and exists, get the event list and apply
                    filterRemoveEvtFromList(srcChannel[evtName]);
                }
                else {
                    evtNamesInChannelArr.forEach(function (registeredEvtName) {
                        // If the list has registered events
                        if (srcChannel[registeredEvtName].length > 0) {
                            filterRemoveEvtFromList(srcChannel[registeredEvtName]);
                        }
                    });
                }
            }
            else {
                // if it is not an object, it must be a string, split to get the channel
                var splitArr = checkType(options, 'string', 'evtId', true).split(':');
                // if the split evtId contains the channel name, get the channel
                channel = (splitArr.length === 2 ? splitArr[0] : undefined);
                evtId = Number.parseInt(splitArr[splitArr.length - 1]);

                if (evtId !== undefined) {
                    var srcEvtChannel = (eventList[channel] !== undefined ? eventList[channel] : eventList.defaultChannel),
                        eventNamesArr = Object.keys(srcEvtChannel);

                    // If the event channel has events registered
                    if (eventNamesArr.length > 0) {
                        var foundIndex = -1;

                        // The evtId is unique,
                        // use Array.prototype.some() instead of Array.prototype.forEach() to allow breaking loop
                        eventNamesArr.some(function (eventName) {
                            srcEvtChannel[eventName].some(function (evt, index) {
                                if (evt.evtId === evtId) {
                                    foundIndex = index;
                                    return true;
                                }
                            });
                            if (foundIndex !== -1) {
                                srcEvtChannel[eventName].splice(foundIndex, 1);
                                return true;
                            }
                        });
                    }
                }
            }
        },
        /**
         * @param options {object || string} The event name or an object describing selectors
         *  evtName: {string},
         *  channel: {string},
         *  prioritySelector: {function} (optional),
         * @param {*} [args] parameters of the triggered callback
         * @description
         * Trigger events based on the event name or an object describing selectors.
         * If the channel is not provided, the default channel is used.
         * prioritySelector if defined filters event by priority
         * @example
         *   evtService.trigger('evtNameFoo', 'foo')
         *   evtService.trigger('evtNameFoo', 'foo', 'bar', 123)
         *   var options = {
         *     evtName: 'evtNameFoo',
         *     channel: 'channelFoo',
         *     prioritySelector: function(priority){
         *       return priority > 10;
         *     }
         *   }
         *   evtService.trigger(options, 'foo', 'bar', 123)
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
            var srcChannel = channel !== undefined ? eventList[channel] : eventList.defaultChannel,
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
                    evt.callBack.apply(evt.context, args);
                });
            }
        }
    };

    return EventService;

    //----------------------------------------------------------------------
    //----------------------------------------------------------------------
    /**
     *
     * @param value
     * @param type
     * @param varName
     * @param [strict]
     * @returns value
     *
     * @private
     *
     * @description
     * Validate the value against the type provided, if strict is "true" then undefined value will not be allowed
     */
    function checkType(value, type, varName, strict) {
        if (value === undefined && strict !== true) {
            return value;
        }

        if (typeof value !== type) {
            throw new TypeError('Invalid type' + (varName !== undefined ? ' for ' + varName : ''));
        }
        return value;
    }

    //----------------------------------------------------------------------
});
