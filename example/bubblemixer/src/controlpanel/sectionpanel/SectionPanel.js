/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../uimodule/UiModule.js'),
    stringUtils = require('../../utils/stringUtils.js'),
//-----------------------------------------------------------
    template = require('./_sectionPanel.html'),
    _CSS_CLASS_PREFIX = '.mr-es-SectionPanel',
//-----------------------------------------------------------

    _init = function () {
        var moduleElt = this.getElement();

        // array to keep track of the created sections,
        // used to avoid 2 sections to share the same channel
        this.sectionChannelArr = [];

        this.$sectionNameInput = moduleElt.find(_CSS_CLASS_PREFIX + '-sectionName');
        this.$sectionNameBtn = moduleElt.find(_CSS_CLASS_PREFIX + '-addBtn');

        // UI events biding
        this.$sectionNameInput.on('input', _onSectionNameInput.bind(this));
        this.$sectionNameBtn.on('click', _onAddClick.bind(this));
    },
    _getTemplate = function () {
        return template();
    },
//------------------------------------
    _onSectionNameInput = function () {
        // check if the value in the input already exist in the array
        // disable the button if so
        var found = this.sectionChannelArr.indexOf(this.$sectionNameInput.val()) !== -1;
        this.$sectionNameBtn.prop('disabled', found);
    },
    _onAddClick = function () {
        var name = this.$sectionNameInput.val();

        if (this.sectionChannelArr.indexOf(name) !== -1) {
            return;
        }

        var evtOptions = {
                channel: 'commands',
                name: 'section:new'
            },
            // create an id from the name that will be used in the DOM
            args = {
                name: name,
                id: 'section-' + stringUtils.alphaNumOnly(name)
            };

        // add the name to the list of registered sections
        this.sectionChannelArr.push(name);
        // reset UI form
        this.$sectionNameInput.val('');
        this.$sectionNameInput.focus();

        console.info('EventService trigger', evtOptions, args);

        // trigger the 'section:new' providing section name and id
        this.getEventService().trigger(evtOptions, args);
    };

//-----------------------------------------------------------
var SectionPanel = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = SectionPanel;