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