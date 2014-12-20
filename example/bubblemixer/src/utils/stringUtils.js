/*global require, module, exports*/
/*jslint node: true */
'use strict';
//------------------------------------------

var _alphaNumOnly = function (unsafeStr) {
    // use of explicit instead of word \w for underscore
    return unsafeStr.replace(/[^a-z0-9]/gi, '');
};

//------------------------------------------

module.exports = {
    alphaNumOnly: _alphaNumOnly
};