/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../uimodule/UiModule.js'),
    Bubble = require('../bubble/Bubble.js'),
//-----------------------------------------------------------
    template = require('./_section.html'),
    style = require('./_section.less'),
//-----------------------------------------------------------

    _init = function (options) {
        // keep the section id for further use        
        this._sectionId = options.id;

        // subscribe to the "bubble:new" from channel corresponding to the section id
        // to add a bubble when the event is triggered
        this.getEventService().on({
            channel: options.id,
            name: 'bubble:new',
            callBack: _addBubble.bind(this)
        });
    },
    _addBubble = function (options) {
        // provide the bubble with the bounds width and height, color and size
        // also with the section id it belongs to, to subscribe to the section channel
        var element = this.getElement(),
            newBubble = new Bubble({
                sectionId: this._sectionId,
                width: element.width(),
                height: element.height(),
                size: options.size,
                color: options.color
            });

        element.append(newBubble.getElement());
    },
    _getTemplate = function (options) {
        return template({
            name: options.name
        });
    };

//-----------------------------------------------------------
var Section = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = Section;