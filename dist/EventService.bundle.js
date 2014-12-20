(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./Event.js":2,"./registry/Registry.js":3,"./utils/checkType.js":5}],2:[function(require,module,exports){
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
},{"./registry/RegistryItem.js":4,"./utils/checkType.js":5}],3:[function(require,module,exports){
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
     *  - name: {string} name of the item(s) to remove,                       <br/>
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
     * @param {object} options.            <br>
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
},{"../utils/checkType.js":5,"../utils/extendsFactory.js":6,"./RegistryItem.js":4}],4:[function(require,module,exports){
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
    extendsFactory = require('../utils/extendsFactory.js');

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

var
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

},{"../utils/extendsFactory.js":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
/*global module, exports*/
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
},{}]},{},[1]);
