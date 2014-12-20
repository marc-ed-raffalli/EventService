/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../../uimodule/UiModule.js'),
//-----------------------------------------------------------
    template = require('./_radioList.html'),
    style = require('./_radioList.less'),
    templateItem = require('./_radioListItem.html'),
    _CSS_CLASS_PREFIX = '.mr-es-RadioList',
//-----------------------------------------------------------

    _init = function (options) {
        // list name abstracted from the list itself
        this._listName = options.name;
    },
    _add = function (options) {
        // pass the received data to the template,
        // list name used for the radio button grouping
        var templateArgs = {
            item: options,
            list: {
                name: this._listName
            }
        };
        // append the generated template to the DOM
        this.getElement().append(templateItem(templateArgs));
    },
    _getSelectedId = function () {
        return this.getElement().find(_CSS_CLASS_PREFIX + 'Item-radio:checked').val();
    },
    _getTemplate = function () {
        return template();
    };

//-----------------------------------------------------------
var RadioList = UiModule.prototype.extends({
    init: _init,
    add: _add,
    getSelectedId: _getSelectedId,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = RadioList;