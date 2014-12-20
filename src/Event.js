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