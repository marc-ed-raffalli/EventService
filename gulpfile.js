var browserify = require('gulp-browserify'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    rename = require("gulp-rename"),
    rimraf = require('gulp-rimraf'),
    shell = require('gulp-shell'),
    uglify = require('gulp-uglify');

var bases = {
    src: 'src/',
    test: 'test/',
    dist: 'dist/'
};

// Delete the dist directory
gulp.task('clean', function () {
    return gulp.src(bases.dist)
        .pipe(rimraf());
});

gulp.task('lint', function () {
    return gulp.src(bases.src + '*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('uglify', function () {
    return gulp.src(bases.dist + 'EventService.bundle.js')
        .pipe(uglify())
        .pipe(rename('EventService.bundle.min.js'))
        .pipe(gulp.dest(bases.dist));
});

gulp.task('copy-src', ['clean', 'browserify', 'uglify'], function () {
    return gulp.src(bases.src + '*.js')
        .pipe(gulp.dest(bases.dist));
});

gulp.task('doc', ['clean'], function () {
    return gulp.src('')
        .pipe(shell([
            'rm -rf api',
            'mkdir api',
            'jsdox --output api src'
        ]));
});

gulp.task('browserify', function () {
    gulp.src([bases.src + '*.js'], {read: false})
        .pipe(browserify())
        .pipe(rename('EventService.bundle.js'))
        .pipe(gulp.dest(bases.dist));
});

gulp.task('browserify-test', function () {
    gulp.src([bases.test + '*.coffee'], {read: false})
        .pipe(browserify({
            debug: true,
            transform: ['coffeeify'],
            extensions: ['.coffee']}))
        .pipe(rename('EventService.test.bundle.js'))
        .pipe(gulp.dest(bases.dist));
});

gulp.task('default', ['clean', 'lint', 'test', 'copy-src', 'doc']);

