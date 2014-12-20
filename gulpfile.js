var
    browserify = require('browserify'),
    coffeeify = require('coffeeify'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    rimraf = require('gulp-rimraf'),
    shell = require('gulp-shell'),
    source = require('vinyl-source-stream');

var name = 'EventService',
    bundledName = name + '.bundle',
    _pathBase = {
        src: './src/',
        test: './test/',
        api: './api/',
        dist: './dist/'
    };

//----------------------------------------------------------------
//---------------------------------------------------------- CLEAN
gulp.task('clean:dist', function () {
    return gulp.src(_pathBase.dist)
        .pipe(rimraf({force: true}));
});

gulp.task('clean:api', function () {
    return gulp.src(_pathBase.api)
        .pipe(rimraf({force: true}));
});

//-----------------------------------------------------------------
//---------------------------------------------------------- VERIFY
gulp.task('lint', function () {
    return gulp.src(_pathBase.src + '**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

//----------------------------------------------------------------
//---------------------------------------------------------- BUILD
gulp.task('browserify', ['clean'], function () {
    return browserify(_pathBase.src + name + '.js')
        .bundle()
        .pipe(source(bundledName + '.js'))
        .pipe(gulp.dest(_pathBase.dist));
});

gulp.task('browserify:uglify', ['clean'], function () {
    return browserify(_pathBase.src + name + '.js')
        .transform('uglifyify')
        .bundle()
        .pipe(source(bundledName + '.min.js'))
        .pipe(gulp.dest(_pathBase.dist));
});


//----------------------------------------------------------------
//----------------------------------- used for tests in index.html

gulp.task('browserify-test', function () {
    return browserify(_pathBase.test + 'main.coffee')
        .transform('coffeeify')
        .bundle()
        .pipe(source(bundledName + '.test.js'))
        .pipe(gulp.dest(_pathBase.test));
});

//--------------------------------------------------------------
//---------------------------------------------------------- DOC
gulp.task('doc', ['clean'], function () {
    return gulp.src('')
        .pipe(shell([
            'jsdox --output api src',
            'jsdox --output api src/registry'
        ]));
});

//-----------------------------------------------------------

gulp.task('clean', ['clean:dist', 'clean:api']);
gulp.task('verify', ['lint', 'test']);
gulp.task('build', ['browserify', 'browserify:uglify']);

gulp.task('post:build', ['browserify-test', 'doc']);

gulp.task('default', ['clean', 'build', 'verify', 'post:build']);

