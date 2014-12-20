/*global require, module, exports*/
/*jslint node: true */
'use strict';

var $ = require('jquery'),
    EventService = require('eventservice'),
//-----------------------------------------------------------
    ControlPanel = require('./controlpanel/ControlPanel.js'),
    Board = require('./board/Board.js'),
    style = require('./_main.less'),
//-----------------------------------------------------------

    _ready = function () {
        var cp = new ControlPanel(),
            board = new Board(),
            appContainer = $('#appContainer');

        appContainer.append(cp.getElement());
        appContainer.append(board.getElement());
    };

//-----------------------------------------------------------

$(document).ready(_ready);