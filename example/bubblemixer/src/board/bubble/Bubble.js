/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../../uimodule/UiModule.js'),
//-----------------------------------------------------------
    template = require('./_bubble.html'),
    style = require('./_bubble.less'),
//-----------------------------------------------------------

    _init = function (options) {
        this._size = options.size;
        this._x = 0;
        this._y = 0;
        this._maxX = options.width;
        this._maxY = options.height;
        this._reverseX = false;
        this._reverseY = false;

        this.moveTo(0, 0);

        this.getElement().css({
            width: options.size + 'px',
            height: options.size + 'px',
            'background-color': options.color
        });

        // this events is subscribed to decouple the timing from a setInterval.
        // only one setInterval is ticking in the control panel and drives all listeners to the "timeBeat" under "commands" channel.
        this._timeBeatEvtId = this.getEventService().on({
            channel: 'commands',
            name: 'timeBeat',
            callBack: _timeBeat.bind(this)
        });

        // subscribe to the "bubble:pop" to remove the bubble element
        // the event registered here describes the bubble, it allows to decouple the selection when removing.
        // the callback will only be executed if the selector of the control panel returns true, (or undefined)
        this._popEvtId = this.getEventService().on({
            channel: options.sectionId,
            name: 'bubble:pop',
            callBack: this.remove.bind(this),
            data: {
                color: options.color,
                size: options.size
            }
        });
    },
    _getTemplate = function () {
        return template();
    },
    _onBeforeRemove = function () {
        // unsubscribe to the event when removing the element.
        this.getEventService().off(this._timeBeatEvtId);
        this.getEventService().off(this._popEvtId);
    },
    _moveTo = function (x, y) {
        this._x = x;
        this._y = y;

        this.getElement().css({
            top: y + 'px',
            left: x + 'px'
        });
    },
//------------------------------------
    _timeBeat = function (options) {
        // executed at each time beat,
        // the period is provided to keep in sync with the css animation which is updated if different
        if (options.period !== this._beatPeriod) {
            this._beatPeriod = options.period;
            this.getElement().css({
                'transition-duration': this._beatPeriod + 'ms'
            });
        }

        _moveRandom.call(this);
    },
    _moveRandom = function () {
        // define a random move step that will be used until the position reaches one of the edge
        if (this._stepX === undefined) {
            // Math.max avoids too small numbers
            this._stepX = Math.max(5, Math.round(10 * Math.random()));
        }
        if (this._stepY === undefined) {
            // Math.max avoids too small numbers
            this._stepY = Math.max(5, Math.round(10 * Math.random()));
        }

        // new position x/y is defined by the current position plus/minus the step
        // reverse is switched when hitting a boundary
        var x = this._x + this._stepX * (this._reverseX ? -1 : 1),
            y = this._y + this._stepY * (this._reverseY ? -1 : 1),
            updateStep;

        // check the boundaries left right
        if (x + this._size >= this._maxX || x < 0) {
            // switch the reverse value and re-evaluate the new position
            this._reverseX = !this._reverseX;
            x = this._x + this._stepX * (this._reverseX ? -1 : 1);
            updateStep = true;
        }

        // check the boundaries top bottom
        if (y + this._size >= this._maxY || y < 0) {
            // switch the reverse value and re-evaluate the new position
            this._reverseY = !this._reverseY;
            y = this._y + this._stepY * (this._reverseY ? -1 : 1);
            updateStep = true;
        }

        if (updateStep) {
            // define new move step after reaching a boundary
            delete this._stepX;
            delete this._stepY;
        }

        this.moveTo(x, y);
    };

//-----------------------------------------------------------
var Bubble = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate,
    onBeforeRemove: _onBeforeRemove,
    moveTo: _moveTo
});
//-----------------------------------------------------------

module.exports = Bubble;