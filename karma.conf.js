// Karma configuration
// Generated on Sat Oct 11 2014 17:57:23 GMT+0100 (GMT Daylight Time)

module.exports = function (config) {
    'use strict';

    var
        testFilePattern = 'test/main.coffee',
        preprocessors = {},
        reporters = ['progress'],
        exclude = [];

    preprocessors[testFilePattern] = ['browserify'];

    config.set({
        basePath: '',
        frameworks: ['browserify', 'mocha', 'chai-sinon', 'es5-shim'],

        files: [
            testFilePattern
        ],

        preprocessors: preprocessors,

        exclude: exclude,

        reporters: reporters,

        browserify: {
            debug: true,
            extensions: ['.coffee'],
            transform: ['coffeeify']
        },

        browsers: ['PhantomJS'],


        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: false
    });
};
