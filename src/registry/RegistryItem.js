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
