/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    UiModule = require('../uimodule/UiModule.js'),
    BubblePanel = require('./bubblepanel/BubblePanel.js'),
    SectionPanel = require('./sectionpanel/SectionPanel.js'),
//-----------------------------------------------------------
    template = require('./_controlPanel.html'),
    TIMER_SECS = 250,
//-----------------------------------------------------------

    _init = function () {
        // create a BubblePanel and SectionPanel component for the ControlPanel
        // both are event driven so totally modular
        var moduleElt = this.getElement(),
            bubblePanel = new BubblePanel(),
            sectionPanel = new SectionPanel();

        // append the created elements to the DOM
        moduleElt.append(sectionPanel.getElement());
        moduleElt.append(bubblePanel.getElement());

        // the ControlPanel drives the UI and specially the interval based actions.
        // in order to allow for changeability of the time value, the CP only has the setInterval set.
        // it then in its turn gives the possibility to execute a callback every period of time.
        setInterval(_beatRhythm.bind(this), TIMER_SECS);
    },
    _getTemplate = function () {
        return template();
    },
//------------------------------------
    _beatRhythm = function () {
        var evtOptions = {
                channel: 'commands',
                name: 'timeBeat'
            },
            args = {
                period: TIMER_SECS
            };

        // trigger the 'timeBeat' providing the period value to allow every subscriber to update animation duration
        this.getEventService().trigger(evtOptions, args);
    };

//-----------------------------------------------------------
var ControlPanel = UiModule.prototype.extends({
    init: _init,
    getTemplate: _getTemplate
});
//-----------------------------------------------------------

module.exports = ControlPanel;