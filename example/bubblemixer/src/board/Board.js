/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../uimodule/UiModule.js'),
    Section = require('./section/Section.js'),
//-----------------------------------------------------------
    template = require('./_board.html'),
    style = require('./_board.less'),
//-----------------------------------------------------------

    _init = function () {        
        // subscribe to the "section:new" from channel "commands" to add a section
        this.getEventService().on({
            channel: 'commands',
            name: 'section:new',
            callBack: _addSection.bind(this)
        });
    },
    _addSection = function (options) {
        // pass the received arguments to the Section constructor
        var newSection = new Section(options);
        // append the created section to the DOM
        this.getElement().append(newSection.getElement());
    },
    _getTemplate = function () {
        return template();
    };

//-----------------------------------------------------------
var Board = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = Board;