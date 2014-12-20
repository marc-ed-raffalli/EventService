/*global module, exports, TypeError*/
/*jslint node: true */
'use strict';
//------------------------------------------

/**
 * @method checkType
 * @private
 *
 * @param {any} value
 * @param {string} type
 * @param {string} varName
 * @param {Boolean} [strict]
 * @return {any} value
 *
 * @description
 * Validate the value against the type provided, if strict is "true" then undefined value will not be allowed
 */
var _checkType = function (value, type, varName, strict) {
    if (value === undefined && strict !== true) {
        return value;
    }

    if (typeof value !== type) {
        throw new TypeError('Invalid type' + (varName !== undefined ? ' for ' + varName : ''));
    }
    return value;
};

//------------------------------------------

module.exports = _checkType;