(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var main;

main = function() {
  var eventServiceTest, eventTest, registryItemTest, registryTest;
  eventServiceTest = require('./EventService.coffee');
  eventTest = require('./Event.coffee');
  registryTest = require('./registry/Registry.coffee');
  registryItemTest = require('./registry/RegistryItem.coffee');
  eventServiceTest();
  eventTest();
  registryTest();
  return registryItemTest();
};

main();

module.exports = main;



},{"./Event.coffee":8,"./EventService.coffee":9,"./registry/Registry.coffee":10,"./registry/RegistryItem.coffee":11}],2:[function(require,module,exports){
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
    RegistryItem = require('./registry/RegistryItem.js'),
    checkType = require('./utils/checkType.js'),

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
},{"./registry/RegistryItem.js":5,"./utils/checkType.js":6}],3:[function(require,module,exports){
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
    Registry = require('./registry/Registry.js'),
    Event = require('./Event.js'),
    checkType = require('./utils/checkType.js'),
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
},{"./Event.js":2,"./registry/Registry.js":4,"./utils/checkType.js":6}],4:[function(require,module,exports){
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
    RegistryItem = require('./RegistryItem.js'),
    checkType = require('../utils/checkType.js'),
    extendsFactory = require('../utils/extendsFactory.js'),
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
},{"../utils/checkType.js":6,"../utils/extendsFactory.js":7,"./RegistryItem.js":5}],5:[function(require,module,exports){
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
    extendsFactory = require('../utils/extendsFactory.js'),

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

},{"../utils/extendsFactory.js":7}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
'use strict';
var Event, callBackA, channelA, contextA, eventTestRunner, idA, nameA, nameB;

Event = require('../src/Event.js');

idA = 1;

channelA = 'channelA';

nameA = 'nameA';

nameB = 'nameB';

callBackA = void 0;

contextA = {
  dummy: 'context'
};

eventTestRunner = function() {
  return describe('Event', function() {
    describe('Class definition', function() {
      return it('Event API should be defined', function() {
        expect(Event).not.to.be.undefined;
        expect(Event.prototype.init).not.to.be.undefined;
        expect(Event.prototype.getId).not.to.be.undefined;
        expect(Event.prototype.getChannel).not.to.be.undefined;
        expect(Event.prototype.getCallback).not.to.be.undefined;
        expect(Event.prototype.getContext).not.to.be.undefined;
        expect(Event.prototype.getName).not.to.be.undefined;
        expect(Event.prototype.getPriority).not.to.be.undefined;
        expect(Event.prototype.incrementPriority).not.to.be.undefined;
        expect(Event.prototype.decrementPriority).not.to.be.undefined;
        expect(Event.prototype.trigger).not.to.be.undefined;
        expect(Event.prototype.isPaused).not.to.be.undefined;
        expect(Event.prototype.pause).not.to.be.undefined;
        expect(Event.prototype.resume).not.to.be.undefined;
        expect(Event.prototype.stop).not.to.be.undefined;
        return expect(Event.prototype.isStopped).not.to.be.undefined;
      });
    });
    return describe('API', function() {
      var evt;
      evt = void 0;
      beforeEach(function() {
        callBackA = sinon.spy();
        return evt = new Event({
          id: idA,
          name: nameA,
          channel: channelA,
          callBack: callBackA,
          context: contextA,
          priority: 2
        });
      });
      describe('Event -> init()', function() {
        it('should accept id, name, callBack [,channel, priority, context]', function() {
          evt = new Event({
            id: idA,
            name: nameA,
            callBack: callBackA
          });
          expect(evt.id).to.equal(idA);
          expect(evt.name).to.equal(nameA);
          expect(evt.callBack).to.equal(callBackA);
          expect(evt.callBack.callCount).to.equal(0);
          expect(evt.channel).to.equal(void 0);
          expect(evt.context).to.equal(void 0);
          return expect(evt.priority).to.equal(1);
        });
        it('should set id, name, callBack, channel, context as READ ONLY', function() {
          var editCallBackFunc, editChannelFunc, editContextFunc, editIdFunc, editNameFunc;
          editIdFunc = function() {
            return evt.id = -1;
          };
          editNameFunc = function() {
            return evt.name = '';
          };
          editChannelFunc = function() {
            return evt.channel = '';
          };
          editCallBackFunc = function() {
            return evt.callBack = function() {};
          };
          editContextFunc = function() {
            return evt.context = {};
          };
          expect(editIdFunc).to["throw"];
          expect(editNameFunc).to["throw"];
          expect(editChannelFunc).to["throw"];
          expect(editCallBackFunc).to["throw"];
          expect(editContextFunc).to["throw"];
          expect(evt.id).to.equal(idA);
          expect(evt.name).to.equal(nameA);
          expect(evt.channel).to.equal(channelA);
          expect(evt.callBack).to.equal(callBackA);
          return expect(evt.context).to.equal(contextA);
        });
        return it('should THROW TypeError on missing id, name, callBack', function() {
          var emptyCallFunc, missingCallBackFunc, missingIdFunc, missingNameFunc;
          emptyCallFunc = function() {
            return new Event;
          };
          missingIdFunc = function() {
            return new Event({
              name: nameA,
              callBack: callBackA
            });
          };
          missingNameFunc = function() {
            return new Event({
              id: idA,
              callBack: callBackA
            });
          };
          missingCallBackFunc = function() {
            return new Event({
              id: idA,
              name: nameA
            });
          };
          expect(emptyCallFunc).to["throw"];
          expect(missingIdFunc).to["throw"];
          expect(missingNameFunc).to["throw"];
          return expect(missingCallBackFunc).to["throw"];
        });
      });
      describe('Event -> trigger()', function() {
        it('should execute callBack', function() {
          expect(evt.callBack.callCount).to.equal(0);
          evt.trigger();
          return expect(evt.callBack.callCount).to.equal(1);
        });
        it('should execute callBack providing context', function() {
          var callBackB, contextB, evtB;
          contextB = {};
          callBackB = sinon.spy();
          evtB = new Event({
            id: idA,
            name: nameA,
            callBack: callBackB,
            context: contextB
          });
          expect(evt.callBack.callCount).to.equal(0);
          expect(evtB.callBack.callCount).to.equal(0);
          evt.trigger();
          evtB.trigger();
          expect(evt.callBack.callCount).to.equal(1);
          expect(evt.callBack.calledOn(contextA)).to.be["true"];
          expect(evtB.callBack.callCount).to.equal(1);
          return expect(evtB.callBack.calledOn(contextB)).to.be["true"];
        });
        return it('should execute callBack providing arguments', function() {
          var arg0, arg1, arg2, arg3;
          arg0 = 123;
          arg1 = 'abc';
          arg2 = [4, 5, 6];
          arg3 = {};
          expect(evt.callBack.callCount).to.equal(0);
          evt.trigger(arg0, arg1, arg2, arg3);
          expect(evt.callBack.callCount).to.equal(1);
          return expect(evt.callBack.firstCall.calledWith(arg0, arg1, arg2, arg3)).to.be["true"];
        });
      });
      describe('Event - Getters', function() {
        it('Event -> getId() should return id value', function() {
          return expect(evt.getId()).to.equal(idA);
        });
        it('Event -> getChannel() should return channel value', function() {
          return expect(evt.getChannel()).to.equal(channelA);
        });
        it('Event -> getCallback() should return callBack value', function() {
          return expect(evt.getCallback()).to.equal(callBackA);
        });
        it('Event -> getContext() should return context value', function() {
          return expect(evt.getContext()).to.equal(contextA);
        });
        it('Event -> getName() should return name value', function() {
          return expect(evt.getName()).to.equal(nameA);
        });
        it('Event -> getPriority() should return priority value', function() {
          return expect(evt.getPriority()).to.equal(2);
        });
        return describe('Event -> isPaused()', function() {
          it('should return false by default', function() {
            return expect(evt.isPaused()).to.be["false"];
          });
          return it('should return true after a call to pause()', function() {
            evt.pause();
            return expect(evt.isPaused()).to.be["true"];
          });
        });
      });
      return describe('Event - Setters', function() {
        describe('Event -> incrementPriority()', function() {
          it('should increment priority value by 1 when step is undefined', function() {
            var _p;
            _p = evt.getPriority();
            expect(_p).to.equal(2);
            evt.incrementPriority();
            return expect(evt.getPriority()).to.equal(_p + 1);
          });
          return it('should increment priority value by step', function() {
            var step, _p;
            _p = evt.getPriority();
            step = 2;
            expect(_p).to.equal(2);
            evt.incrementPriority(step);
            return expect(evt.getPriority()).to.equal(_p + step);
          });
        });
        describe('Event -> decrementPriority()', function() {
          it('should decrement priority value by 1 when step is undefined', function() {
            var _p;
            _p = evt.getPriority();
            expect(_p).to.equal(2);
            evt.decrementPriority();
            return expect(evt.getPriority()).to.equal(_p - 1);
          });
          return it('should decrement priority value by step', function() {
            var step, _p;
            _p = evt.getPriority();
            step = 2;
            expect(_p).to.equal(2);
            evt.decrementPriority(step);
            return expect(evt.getPriority()).to.equal(_p - step);
          });
        });
        describe('Event -> pause()', function() {
          it('should set the property paused to true', function() {
            expect(evt.paused).to.be["false"];
            evt.pause();
            return expect(evt.paused).to.be["true"];
          });
          it('should prevent trigger from executing the callBack', function() {
            expect(evt.callBack.callCount).to.equal(0);
            evt.pause();
            evt.trigger();
            return expect(evt.callBack.callCount).to.equal(0);
          });
          return it('should THROW if the event is stopped', function() {
            var pauseOnStoppedFunc;
            pauseOnStoppedFunc = function() {
              return evt.pause();
            };
            evt.stop();
            return expect(pauseOnStoppedFunc).to["throw"];
          });
        });
        describe('Event -> resume()', function() {
          it('should set the property paused to false', function() {
            evt.pause();
            expect(evt.paused).to.be["true"];
            evt.resume();
            return expect(evt.paused).to.be["false"];
          });
          it('should allow trigger executing the callBack after the event has been paused', function() {
            evt.pause();
            evt.trigger();
            expect(evt.callBack.callCount).to.equal(0);
            evt.resume();
            evt.trigger();
            return expect(evt.callBack.callCount).to.equal(1);
          });
          return it('should THROW if the event is stopped', function() {
            var resumeOnStoppedFunc;
            resumeOnStoppedFunc = function() {
              return evt.resume();
            };
            evt.stop();
            return expect(resumeOnStoppedFunc).to["throw"];
          });
        });
        return describe('Event -> stop()', function() {
          it('should set the property stopped to true', function() {
            expect(evt.stopped).to.be.undefined;
            evt.stop();
            return expect(evt.stopped).to.be["true"];
          });
          return it('should THROW on altering / triggering stopped event', function() {
            var decPriorityOnStoppedFunc, incPriorityOnStoppedFunc, pauseOnStoppedFunc, resumeOnStoppedFunc, triggerOnStoppedFunc;
            pauseOnStoppedFunc = function() {
              return evt.pause();
            };
            resumeOnStoppedFunc = function() {
              return evt.resume();
            };
            triggerOnStoppedFunc = function() {
              return evt.trigger();
            };
            incPriorityOnStoppedFunc = function() {
              return evt.incrementPriority();
            };
            decPriorityOnStoppedFunc = function() {
              return evt.decrementPriority();
            };
            evt.stop();
            expect(pauseOnStoppedFunc).to["throw"];
            expect(resumeOnStoppedFunc).to["throw"];
            expect(triggerOnStoppedFunc).to["throw"];
            expect(incPriorityOnStoppedFunc).to["throw"];
            return expect(decPriorityOnStoppedFunc).to["throw"];
          });
        });
      });
    });
  });
};

module.exports = eventTestRunner;



},{"../src/Event.js":2}],9:[function(require,module,exports){
'use strict';
var Event, EventService, callBackA, channelA, cleanAllEvts, eventServiceTestRunner, evtService, nameA, priorityA, priorityDefault, testEvtArr, _registerEvent;

EventService = require('../src/EventService.js');

Event = require('../src/Event.js');

testEvtArr = [];

nameA = 'nameA';

channelA = 'channelA';

evtService = void 0;

callBackA = void 0;

priorityDefault = 1;

priorityA = 2;

_registerEvent = function(evtArgs) {
  var evt;
  evt = evtService.on(evtArgs);
  testEvtArr.push(evt);
  return evt;
};

cleanAllEvts = function() {
  testEvtArr.forEach(function(evt) {
    return evtService.off(evt);
  });
  return testEvtArr = [];
};

eventServiceTestRunner = function() {
  return describe('EventService', function() {
    describe('Class definition', function() {
      return it('EventService API should be defined', function() {
        expect(EventService).not.to.be.undefined;
        expect(EventService.prototype.on).not.to.be.undefined;
        expect(EventService.prototype.off).not.to.be.undefined;
        return expect(EventService.prototype.trigger).not.to.be.undefined;
      });
    });
    return describe('API', function() {
      beforeEach(function() {
        callBackA = sinon.spy();
        return evtService = new EventService();
      });
      afterEach(function() {
        cleanAllEvts();
        return evtService = void 0;
      });
      describe('EventService on()', function() {
        it('should accept minimum arguments / event name and callback', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            callBack: callBackA
          });
          expect(evt).not.to.be.undefined;
          expect(evt instanceof Event).to.be["true"];
          expect(evt.name).to.equal(nameA);
          expect(evt.callBack).to.equal(callBackA);
          expect(evt.callBack.callCount).to.equal(0);
          expect(evt.priority).to.equal(priorityDefault);
          return expect(evt.channel).to.equal(void 0);
        });
        it('should accept full arguments / event name, callback, channel and priority', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: callBackA,
            priority: priorityA
          });
          expect(evt).not.to.be.undefined;
          expect(evt instanceof Event).to.be["true"];
          expect(evt.name).to.equal(nameA);
          expect(evt.channel).to.equal(channelA);
          expect(evt.callBack).to.equal(callBackA);
          expect(evt.callBack.callCount).to.equal(0);
          return expect(evt.priority).to.equal(priorityA);
        });
        it('should throw if name is not string', function() {
          var fn;
          fn = function() {
            return evtService.on({
              name: 1
            });
          };
          return expect(fn).to["throw"];
        });
        return it('should throw if name or callback are missing', function() {
          var missingClbkFunc, missingNameClbkFunc, missingNameFunc;
          missingNameClbkFunc = function() {
            return evtService.on();
          };
          missingNameFunc = function() {
            return evtService.on({
              callBack: function() {}
            });
          };
          missingClbkFunc = function() {
            return evtService.on({
              name: nameA
            });
          };
          expect(missingNameClbkFunc).to["throw"];
          expect(missingNameFunc).to["throw"];
          return expect(missingClbkFunc).to["throw"];
        });
      });
      describe('EventService off()', function() {
        it('should remove event from default channel', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off(evt2);
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        it('should remove event from default channel based on selector filter', function() {
          var callCount, params;
          params = {
            priority: 1,
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          params.priority = 2;
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off({
            selector: function(e) {
              return e.priority === 2;
            }
          });
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
        it('should remove event from default channel based on event name', function() {
          var callCount, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          params.name = 'anotherEventName';
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evtService.off({
            name: nameA
          });
          evtService.trigger({
            name: nameA
          });
          expect(callBackA.callCount).to.equal(callCount);
          evtService.trigger({
            selector: function(e) {
              return e.priority === 1;
            }
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
        it('should remove event from defined channel', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off(evt2);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        it('should remove event from defined channel based on priority filter', function() {
          var callCount, params;
          params = {
            priority: 2,
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          params.priority = 3;
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off({
            selector: function(e) {
              return e.priority === 2;
            }
          });
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        return it('should remove event from defined channel based on event name', function() {
          var callCount, params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          params.name = 'anotherEventName';
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evtService.off({
            name: nameA,
            channel: channelA
          });
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          expect(callBackA.callCount).to.equal(callCount);
          evtService.trigger({
            channel: channelA,
            prioritySelector: function(e) {
              return e.priority === priorityDefault;
            }
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
      });
      return describe('EventService trigger()', function() {
        it('should trigger event registered on default channel', function(done) {
          _registerEvent({
            name: nameA,
            callBack: function() {
              return done();
            }
          });
          return evtService.trigger({
            name: nameA
          });
        });
        it('should trigger event registered on defined channel', function(done) {
          _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: function() {
              return done();
            }
          });
          return evtService.trigger({
            name: nameA,
            channel: channelA
          });
        });
        it('should trigger events based on priority', function(done) {
          var ctr;
          ctr = 0;
          _registerEvent({
            name: nameA,
            callBack: function() {
              expect(ctr).to.equal(11);
              return done();
            }
          });
          _registerEvent({
            name: nameA,
            priority: 2,
            callBack: function() {
              expect(ctr).to.equal(1);
              return ctr += 10;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 3,
            callBack: function() {
              expect(ctr).to.equal(0);
              return ctr++;
            }
          });
          return evtService.trigger({
            name: nameA
          });
        });
        it('should trigger events filtered on selector', function() {
          var ctr;
          ctr = 0;
          _registerEvent({
            name: nameA,
            callBack: function() {
              return ctr++;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 2,
            callBack: function() {
              return ctr += 10;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 3,
            callBack: function() {
              return ctr += 100;
            }
          });
          _registerEvent({
            name: 'anotherEventName',
            priority: 3,
            callBack: function() {
              return ctr += 1000;
            }
          });
          evtService.trigger({
            selector: function(e) {
              return e.name === nameA;
            }
          });
          expect(ctr).to.equal(111);
          ctr = 0;
          evtService.trigger({
            name: nameA,
            selector: function(e) {
              return e.priority === 3;
            }
          });
          expect(ctr).to.equal(100);
          ctr = 0;
          evtService.trigger({
            name: nameA,
            selector: function(e) {
              return e.priority >= 2;
            }
          });
          expect(ctr).to.equal(110);
          ctr = 0;
          evtService.trigger({
            selector: function(e) {
              return e.priority >= 2;
            }
          });
          return expect(ctr).to.equal(1110);
        });
        it('should trigger event passing parameters on default channel', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            callBack: callBackA
          });
          evtService.trigger({
            name: nameA
          }, 1, 2, 3);
          return expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be["true"];
        });
        it('should trigger event passing parameters on defined channel', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: callBackA
          });
          evtService.trigger({
            name: nameA,
            channel: channelA
          }, 1, 2, 3);
          return expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be["true"];
        });
        it('should trigger event as many times as registered', function() {
          var params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          return expect(callBackA.callCount).to.equal(3);
        });
        it('should not trigger if the event is paused', function() {
          var evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.pause();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(2);
        });
        it('should trigger if the event is resumed', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.pause();
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evt2.resume();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 3);
        });
        return it('should not trigger if the event is stopped', function() {
          var ctr, evt2, params;
          ctr = 0;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.stop();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(2);
        });
      });
    });
  });
};

module.exports = eventServiceTestRunner;



},{"../src/Event.js":2,"../src/EventService.js":3}],10:[function(require,module,exports){
'use strict';
var Registry, channelA, nameA, nameB, registryTestRunner;

Registry = require('../../src/registry/Registry.js');

channelA = 'channelA';

nameA = 'nameA';

nameB = 'nameB';

registryTestRunner = function() {
  return describe('Registry', function() {
    describe('Class definition', function() {
      return it('Registry API should be defined', function() {
        expect(Registry).not.to.be.undefined;
        expect(Registry.prototype.register).not.to.be.undefined;
        return expect(Registry.prototype.remove).not.to.be.undefined;
      });
    });
    return describe('API', function() {
      describe('Registry -> register()', function() {
        var registry;
        registry = void 0;
        beforeEach(function() {
          return registry = new Registry();
        });
        afterEach(function() {
          registry.emptyRegistryChannel();
          registry.emptyRegistryChannel(channelA);
          return registry = void 0;
        });
        it('should register item to the default channel', function() {
          var item, itemArr;
          item = registry.register({
            name: nameA
          });
          itemArr = registry.getRegistryChannel()[nameA];
          expect(itemArr.indexOf(item)).not.to.equal(-1);
          return expect(itemArr.length).to.equal(1);
        });
        return it('should register item to a custom channel', function() {
          var item, itemArr;
          item = registry.register({
            channel: channelA,
            name: nameA
          });
          itemArr = registry.getRegistryChannel(channelA)[nameA];
          expect(itemArr.indexOf(item)).not.to.equal(-1);
          return expect(itemArr.length).to.equal(1);
        });
      });
      return describe('Registry -> remove()', function() {
        var channelAEvtA, countEvtAOnDefaultChannel, countEvtAOnOtherChannel, countEvtBOnDefaultChannel, countEvtBOnOtherChannel, defaultChannel, defaultEvtA, otherChannel, registry;
        registry = void 0;
        defaultEvtA = void 0;
        channelAEvtA = void 0;
        defaultChannel = void 0;
        countEvtAOnDefaultChannel = void 0;
        countEvtBOnDefaultChannel = void 0;
        otherChannel = void 0;
        countEvtAOnOtherChannel = void 0;
        countEvtBOnOtherChannel = void 0;
        beforeEach(function() {
          var itemArgs;
          registry = new Registry();
          itemArgs = {
            name: nameA
          };
          defaultEvtA = registry.register(itemArgs);
          registry.register(itemArgs);
          registry.register(itemArgs);
          itemArgs.name = nameB;
          registry.register(itemArgs);
          registry.register(itemArgs);
          registry.register(itemArgs);
          itemArgs = {
            channel: channelA,
            name: nameA
          };
          channelAEvtA = registry.register(itemArgs);
          registry.register(itemArgs);
          registry.register(itemArgs);
          itemArgs.name = nameB;
          registry.register(itemArgs);
          registry.register(itemArgs);
          registry.register(itemArgs);
          defaultChannel = registry.getRegistryChannel();
          countEvtAOnDefaultChannel = defaultChannel[nameA].length;
          countEvtBOnDefaultChannel = defaultChannel[nameB].length;
          otherChannel = registry.getRegistryChannel(channelA);
          countEvtAOnOtherChannel = otherChannel[nameA].length;
          return countEvtBOnOtherChannel = otherChannel[nameB].length;
        });
        afterEach(function() {
          registry.emptyRegistryChannel();
          registry.emptyRegistryChannel(channelA);
          return registry = void 0;
        });
        it('should remove ONE item from the default channel when using item object', function() {
          var res;
          expect(countEvtAOnDefaultChannel).to.equal(3);
          res = registry.remove(defaultEvtA);
          expect(res).not.to.deep.equal([]);
          expect(defaultChannel[nameA].indexOf(defaultEvtA)).to.equal(-1);
          expect(defaultChannel[nameA].length).to.equal(countEvtAOnDefaultChannel - 1);
          expect(defaultChannel[nameB].length).to.equal(countEvtBOnDefaultChannel);
          expect(otherChannel[nameA].length).to.equal(countEvtAOnOtherChannel);
          return expect(otherChannel[nameB].length).to.equal(countEvtBOnOtherChannel);
        });
        it('should remove item from the custom channel using item object', function() {
          var res;
          expect(countEvtAOnOtherChannel).to.equal(3);
          res = registry.remove(channelAEvtA);
          expect(res).not.to.deep.equal([]);
          expect(otherChannel[nameA].indexOf(channelAEvtA)).to.equal(-1);
          expect(otherChannel[nameA].length).to.equal(countEvtAOnOtherChannel - 1);
          expect(otherChannel[nameB].length).to.equal(countEvtBOnOtherChannel);
          expect(defaultChannel[nameA].length).to.equal(countEvtAOnDefaultChannel);
          return expect(defaultChannel[nameB].length).to.equal(countEvtBOnDefaultChannel);
        });
        it('should remove all named item from the default channel using name selector', function() {
          var res;
          expect(countEvtAOnDefaultChannel).to.equal(3);
          res = registry.remove({
            name: nameA
          });
          expect(res).not.to.deep.equal([]);
          expect(defaultChannel[nameA].length).to.equal(0);
          expect(defaultChannel[nameB].length).to.equal(countEvtBOnDefaultChannel);
          expect(otherChannel[nameA].length).to.equal(countEvtAOnOtherChannel);
          return expect(otherChannel[nameB].length).to.equal(countEvtBOnOtherChannel);
        });
        return it('should remove all named item from the custom channel using name selector', function() {
          var res;
          expect(countEvtAOnOtherChannel).to.equal(3);
          res = registry.remove({
            channel: channelA,
            name: nameA
          });
          expect(res).not.to.deep.equal([]);
          expect(otherChannel[nameA].length).to.equal(0);
          expect(otherChannel[nameB].length).to.equal(countEvtBOnOtherChannel);
          expect(defaultChannel[nameA].length).to.equal(countEvtAOnDefaultChannel);
          return expect(defaultChannel[nameB].length).to.equal(countEvtBOnDefaultChannel);
        });
      });
    });
  });
};

module.exports = registryTestRunner;



},{"../../src/registry/Registry.js":4}],11:[function(require,module,exports){
'use strict';
var RegistryItem, channelA, idA, nameA, nameB, registryItemTestRunner;

RegistryItem = require('../../src/registry/RegistryItem.js');

idA = 1;

channelA = 'channelA';

nameA = 'nameA';

nameB = 'nameB';

registryItemTestRunner = function() {
  return describe('RegistryItem', function() {
    describe('Class definition', function() {
      return it('RegistryItem API should be defined', function() {
        expect(RegistryItem).not.to.be.undefined;
        expect(RegistryItem.prototype["extends"]).not.to.be.undefined;
        return expect(RegistryItem.prototype.init).not.to.be.undefined;
      });
    });
    return describe('API', function() {
      describe('RegistryItem -> init()', function() {
        it('should accept id, name [,channel]', function() {
          var item;
          item = new RegistryItem({
            id: idA,
            name: nameA
          });
          expect(item.id).to.equal(idA);
          expect(item.name).to.equal(nameA);
          return expect(item.channel).to.equal(void 0);
        });
        return it('should THROW TypeError on missing id or name', function() {
          var missingIdFunc, missingIdNameFunc, missingNameFunc;
          missingIdFunc = function() {
            return new RegistryItem({
              name: nameA
            });
          };
          missingNameFunc = function() {
            return new RegistryItem({
              id: idA
            });
          };
          missingIdNameFunc = function() {
            return new RegistryItem;
          };
          expect(missingIdFunc).to["throw"];
          expect(missingNameFunc).to["throw"];
          return expect(missingIdNameFunc).to["throw"];
        });
      });
      return describe('RegistryItem -> extends()', function() {
        it('should return new Class with RegistryItem functions overridden/inherited', function() {
          var CST, Klass, _fcA, _init;
          CST = 123;
          _init = function() {};
          _fcA = function() {};
          Klass = RegistryItem.prototype["extends"]({
            CST: CST,
            init: _init,
            fcA: _fcA
          });
          expect(Klass).not.to.be.undefined;
          expect(Klass.prototype["extends"]).not.to.be.undefined;
          expect(Klass.prototype.init).not.to.be.undefined;
          expect(Klass.prototype.CST).to.equal(CST);
          expect(Klass.prototype.init).to.equal(_init);
          return expect(Klass.prototype.fcA).to.equal(_fcA);
        });
        return it('should new Class extending RegistryItem', function() {
          var Klass, k, _attr, _init;
          _attr = 1234;
          _init = function(options) {
            return Object.defineProperty(this, 'attr', {
              value: options.attr
            });
          };
          Klass = RegistryItem.prototype["extends"]({
            init: _init
          });
          k = new Klass({
            id: idA,
            name: nameA,
            attr: _attr
          });
          expect(k.id).to.equal(idA);
          expect(k.name).to.equal(nameA);
          expect(k.channel).to.equal(void 0);
          return expect(k.attr).to.equal(_attr);
        });
      });
    });
  });
};

module.exports = registryItemTestRunner;



},{"../../src/registry/RegistryItem.js":5}]},{},[1]);
