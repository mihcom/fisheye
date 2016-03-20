var gulp = require('gulp'),
    less = require('gulp-less'),
    concatenateCss = require('gulp-concat-css'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixCss = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    paths = {
        CSS: ['css/**/*.less'],
        HTML: ['./index.html', './js/**/*.html'],
        JS: ['js/**/*.js']
    };

gulp.task('css', function () {
    'use strict';

    return gulp.src(paths.CSS)
        .pipe(less())
        .pipe(concatenateCss('bundle.css'))
        .pipe(autoprefixCss('last 2 versions'))
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(rename('bundle.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('css'))
        .pipe(connect.reload());
});

gulp.task('connect', function () {
    'use strict';

    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('html', function () {
    'use strict';

    gulp.src(paths.HTML)
        .pipe(connect.reload());
});

gulp.task('js', function () {
    'use strict';

    gulp.src(paths.JS)
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    'use strict';

    gulp.watch(paths.CSS, ['css']);
    gulp.watch(paths.HTML, ['html']);
    gulp.watch(paths.JS, ['js']);
});

gulp.task('default', ['connect', 'css', 'watch']);