/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    EventService = require('eventservice'),
    extendsFactory = require('../utils/extendsFactory.js'),
//-----------------------------------------------------------
    template = require('./_uiModule.html'),
// one single instance of the EventService is shared between the modules for simplicity purposes only.
    appES = new EventService(),
//-------------------------------------------

// Quick class to allow simple DOM module management

    UiModule = function () {
        // the root element of the module is set by default to a simple div
        // override 'getTemplate' to define custom template
        // constructor arguments forwarded to the 'getTemplate' to allow parametrized template
        this.$el = $(this.getTemplate.apply(this, arguments));

        this.init.apply(this, arguments);
    },
// override it for custom action after the constructor
    _init = function () {
    },
// override to specify your template
    _getTemplate = function () {
        return template();
    },
// get the EventService singleton
    _getEventService = function () {
        return appES;
    },
// get the module root element
    _getElement = function () {
        return this.$el;
    },
// remove the element
    _remove = function () {
        this.onBeforeRemove();
        this.getElement().remove();
    },
// override to specify what should be done before removal
    _onBeforeRemove = function () {
    };

//-----------------------------------------------------------
// allows for subclassing using extends
UiModule.prototype.extends = extendsFactory(UiModule);

UiModule.prototype.init = _init;
UiModule.prototype.getElement = _getElement;
UiModule.prototype.getEventService = _getEventService;
UiModule.prototype.getTemplate = _getTemplate;
UiModule.prototype.remove = _remove;
UiModule.prototype.onBeforeRemove = _onBeforeRemove;
//-----------------------------------------------------------

module.exports = UiModule;