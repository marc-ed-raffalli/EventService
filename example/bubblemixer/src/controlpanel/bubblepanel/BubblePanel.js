/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../uimodule/UiModule.js'),
    RadioList = require('./radiolist/RadioList.js'),
    Config = require('./config/Config.js'),
//-----------------------------------------------------------
    template = require('./_bubblePanel.html'),
    style = require('./_bubblePanel.less'),
    _CSS_CLASS_PREFIX = '.mr-es-BubblePanel',
//-----------------------------------------------------------

    _init = function () {
        var moduleElt = this.getElement();

        // Radio button list for the created sections
        // name to group the radio button
        this._radioList = new RadioList({
            name: 'sectionName'
        });
        // configuration form for the created bubbles
        this._configForm = new Config();

        // append the created elements to the DOM
        moduleElt.find(_CSS_CLASS_PREFIX + '-listHolder').append(this._radioList.getElement());
        moduleElt.find(_CSS_CLASS_PREFIX + '-configHolder').append(this._configForm.getElement());

        // button events biding
        moduleElt.find(_CSS_CLASS_PREFIX + '-addBubbleBtn').on('click', _onAddBubbleClick.bind(this));
        moduleElt.find(_CSS_CLASS_PREFIX + '-popBubbleBtn').on('click', _onPopBubbleClick.bind(this));

        // add a new name to the list when a section is created
        this.getEventService().on({
            channel: 'commands',
            name: 'section:new',
            callBack: _addListItem.bind(this)
        });
    },
    _getTemplate = function () {
        return template();
    },
//------------------------------------
    _addListItem = function (options) {
        // add new section name using the list API
        this._radioList.add(options);
    },
    _onAddBubbleClick = function () {
        // get/build common event config values from _getEventTriggerArgs
        var evtOptions = _getEventTriggerArgs.call(this, 'bubble:new'),
            config = this._configForm.getConfig();

        console.info('EventService trigger', evtOptions, config);

        // trigger event 'bubble:new' providing the config and the event details 
        this.getEventService().trigger(evtOptions, config);
    },
    _onPopBubbleClick = function () {
        // get/build common event config values from _getEventTriggerArgs
        var evtOptions = _getEventTriggerArgs.call(this, 'bubble:pop'),
            config = this._configForm.getConfig();

        // add a selector to trigger only the events registered that match the selected config
        evtOptions.selector = function (e) {
            var data = e.getData();
            // size and color should match to allow the callback to be executed
            return data.color === config.color && data.size === config.size;
        };

        // trigger event 'bubble:pop' providing the config and the event details 
        console.info('EventService trigger', evtOptions);
        this.getEventService().trigger(evtOptions);
    },
    _getEventTriggerArgs = function (evtName) {
        return {
            // publish the event on the channel corresponding to the selected section
            channel: this._radioList.getSelectedId(),
            name: evtName
        };
    };

//-----------------------------------------------------------
var BubblePanel = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = BubblePanel;