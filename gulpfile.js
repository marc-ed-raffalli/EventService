var coffee = require('gulp-coffee'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    mocha = require('gulp-mocha'),
    rename = require("gulp-rename"),
    rimraf = require('gulp-rimraf'),
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

gulp.task('coffee-build-test', function () {
    return gulp.src(bases.test + '*.coffee')
        .pipe(sourcemaps.init())
        .pipe(coffee())
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(bases.test));
});

gulp.task('test', ['coffee-build-test'], function () {
    return gulp.src(bases.test + '*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('uglify', ['clean'], function () {
    return gulp.src(bases.src + '*.js')
        .pipe(uglify())
        .pipe(rename('EventService.min.js'))
        .pipe(gulp.dest(bases.dist));
});

gulp.task('copy-src', ['clean'], function () {
    return gulp.src(bases.src + '*.js')
        .pipe(gulp.dest(bases.dist));
});

gulp.task('default', ['clean', 'lint', 'copy-src', 'uglify']);// 'test',
