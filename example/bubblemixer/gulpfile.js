var
    browserify = require('browserify'),
    gulp = require('gulp'),
    hbsfy = require('hbsfy').configure({
        extensions: ['html']
    }),
    rimraf = require('gulp-rimraf'),
    stringify = require('stringify'),
    source = require('vinyl-source-stream');

var name = 'BubbleMixer',
    bundledName = name + '.bundle',
    _pathBase = {
        src: './src/',
        dist: './dist/'
    };

//----------------------------------------------------------------
//---------------------------------------------------------- CLEAN
gulp.task('clean', function () {
    return gulp.src(_pathBase.dist)
        .pipe(rimraf({force: true}));
});

//----------------------------------------------------------------
//---------------------------------------------------------- BUILD
gulp.task('browserify', function () {
    return browserify()
        .transform('node-lessify')
        .transform(hbsfy)
        .add(_pathBase.src + 'main.js')
        .bundle()
        .pipe(source(bundledName + '.js'))
        .pipe(gulp.dest(_pathBase.dist));
});

//-----------------------------------------------------------
gulp.task('watch', function () {
    gulp.watch([
            _pathBase.src + '**/*.js',
            _pathBase.src + '**/*.less',
            _pathBase.src + '**/*.html'
    ], ['browserify']);
});
//-----------------------------------------------------------

gulp.task('default', ['browserify']);
