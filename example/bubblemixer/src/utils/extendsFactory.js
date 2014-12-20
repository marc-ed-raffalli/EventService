/*global require, module, exports*/
/*jslint node: true */
'use strict';
//------------------------------------------

/**
 * @method extendsFactory
 *
 * @param SuperKlass
 * @param methodName
 * @return {Function}
 *
 * @description
 * Returns a function taking an object describing new class methods and properties, and the method name used for extends.
 * Call to the return function allows to extend SuperKlass adding/overriding properties.
 * The resulting child class will also have the same extends method name but defined for itself.
 *
 * @example
 *
 *     SuperKlass.prototype.extends = extendsFactory(SuperKlass,'extends');
 *     SuperKlass.prototype.foo = function () {};
 *     SuperKlass.prototype.bar = function () {};
 *
 *     var Klass = SuperKlass.prototype.extends({
 *         FOO_CST: 123,
 *         bar: function () {
 *             // override SuperKlass definition
 *         },
 *         baz: function () {}
 *     });
 *
 *     var k = new Klass();
 *     k.foo(); // inherited
 *     k.bar(); // overridden
 *
 */
var _extendsFactory = function (SuperKlass, methodName) {
    var extendMethodName = methodName || 'extends';
    return function (options) {
        options = options || {};

        var Klass = function () {
            SuperKlass.apply(this, arguments);
        };

        Klass.prototype = Object.create(SuperKlass.prototype);
        Klass.prototype.constructor = Klass;

        // redefine the extends for the
        Klass.prototype[extendMethodName] = _extendsFactory(Klass);

        Object.keys(options).forEach(function (attr) {
            Klass.prototype[attr] = options[attr];
        });

        return Klass;
    };
};

//------------------------------------------

module.exports = _extendsFactory;