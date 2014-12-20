/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../../uimodule/UiModule.js'),
//-----------------------------------------------------------
    template = require('./_config.html'),
    style = require('./_config.less'),
    _CSS_CLASS_PREFIX = '.mr-es-BubblePanelConfig',
    // colors listed on the UI, used in template
    colors = [
        {name: 'red', checked: true},
        {name: 'orange'},
        {name: 'yellow'},
        {name: 'green'},
        {name: 'blue'},
        {name: 'purple'}
    ],
//-----------------------------------------------------------

    _init = function (options) {
        var moduleElt = this.getElement();

        this.$sizeRange = moduleElt.find(_CSS_CLASS_PREFIX + '-sizeRange');

        // display the current value
        _displaySizeValue.call(this);

        // bind the input event to display the value when changed
        this.$sizeRange.on('input', _displaySizeValue.bind(this));
    },
    _displaySizeValue = function () {
        this.getElement().find(_CSS_CLASS_PREFIX + '-sizeValue').text(this.$sizeRange.val());
    },
    _getConfig = function () {
        // return the size and color selected on the form
        return {
            size: parseInt(this.$sizeRange.val()) || 10,
            color: this.getElement().find(_CSS_CLASS_PREFIX + '-colorListItemRadio:checked').val()
        };
    },
    _getTemplate = function () {
        return template({
            colors: colors
        });
    };

//-----------------------------------------------------------
var Config = UiModule.prototype.extends({
    init: _init,
    getConfig: _getConfig,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = Config;