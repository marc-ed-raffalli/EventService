// Karma configuration
// Generated on Sat Oct 11 2014 17:57:23 GMT+0100 (GMT Daylight Time)

module.exports = function (config) {
    'use strict';

    var
        testFilePattern = 'test/**/*.coffee',
        preprocessors = {},
        reporters = ['progress'],
        exclude = [
            'test/main.coffee'
        ];

    preprocessors[testFilePattern] = ['browserify'];

//    reporters.push('coverage');

    config.set({
        basePath: '',
        frameworks: ['browserify', 'mocha', 'chai-sinon'],

        files: [
            testFilePattern
        ],

        preprocessors: preprocessors,

        exclude: exclude,

        reporters: reporters,

        coffeePreprocessor: {
            options: {
                bare: true,
                sourceMap: false
            },
            transformPath: function (path) {
                return path.replace(/\.coffee$/, '.js');
            }
        },
        coverageReporter: {
            reporters: [
                {type: 'html', dir: 'dist/coverage/', subdir: 'report'},
                {type: 'lcovonly', dir: 'dist/coverage/', subdir: '.'}
            ]
        },
        browserify: {
            debug: true,
            outfile:'test/EventService.bundle.test.js',
            extensions: ['.js', '.coffee'],
            transform: ['coffeeify', 'brfs', 'browserify-shim']
        },

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],//, 'Chrome', 'Firefox'],

        singleRun: false
    });
};
