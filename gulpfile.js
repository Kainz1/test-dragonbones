const gulp = require('gulp'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    axis = require('axis'),
    stylus = require('gulp-stylus'),
    prefix = require('gulp-autoprefixer'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    tinypng = require('gulp-tinypng-compress'),
    replace = require('gulp-replace');

let isProd = true;
if(argv.dev) isProd = false;

let keys = ['2ZH6Bj39JhmzgB4pbMxFzC5VpBDVQ17Y', '75yD2Rx641rTCHBKsqY5kzqG8w1x0GHR', 'df0SxLbddqbK188sFYcg1VZwN2LRTrlR', 'fSrD2YR6dwjyZ0mZRjrR4TtfX6LZNNBc', '5sVZX6Kh8cR8rttzNCw7lxl4PvCQGH6x', 'pGztycrf6nTvZg8MCbysf1VyX7YmKpsq', '58XNW6KTd1Rm0fwVk52WjFtYN91Ctm20', 'f7kZVZzFmSkrytlSppbWtTl1bKFxl5bn', 'sjpZSm0xD18qGgYBN6TBdZJ6DxJ5jMyH', 'VnDp9Kz3zhQ3PsQvkdFVY5JDSvGB2NBZ']
let rand = keys[Math.floor(Math.random() * keys.length)]

function wrapPipe(taskFn) {
    return function(done) {
        function onSuccess() {
            done();
        }
        function onError(err) {
            done(err);
        }

        const outStream = taskFn(onSuccess, onError);
        if(outStream && typeof outStream.on === 'function') {
            outStream.on('end', onSuccess);
        }
    }
}

gulp.task('tinify', function () {

    let images = 'images/**/*.{png,jpg,jpeg}';

    if (argv.img) images = 'images/' + argv.img;

    gulp.src(images)
        .pipe(tinypng({
            key: rand,
            sigFile: 'images/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest('images'));
});

gulp.task('css', wrapPipe(function (success, error) {
    return gulp.src(['styl/style.styl'])
        .pipe(stylus({
            compress: isProd,
            use: [axis()]
        }).on('error', error))
        .pipe(prefix())
        .pipe(rename('style.min.css').on('error', error))
        .pipe(gulp.dest('css'));
}));

gulp.task('js', wrapPipe(function(success, error) {
    return gulp.src('js/src/*.js')
        .pipe(babel({presets: ['env']}).on('error', error))
        .pipe(gulpif(isProd, uglify().on('error', error)) )
        .pipe(concat('main.min.js').on('error', error))
        .pipe(gulp.dest('js/'));
}));

gulp.task('watch', function () {
    gulp.watch('styl/*.styl', ['css']);
    gulp.watch('js/src/*.js', ['js']);
});

gulp.task('twig:asset', function () {
    return gulp.src('layouts/*.twig')
        .pipe(replace(/(src|href|poster)="(.*?)"/g, function(match, attr, location) {

            // skip external and already upgraded assets
            if(location.startsWith('http://') || location.startsWith('https://') || location.startsWith('//') || location.startsWith('{{')) {
                return match;
            }

            return location.startsWith('/') ?
                attr + '="' + '{{ asset(\'' + location + '\') }}' + '"' :
                attr + '="' + '{{ landing.asset(\'' + location + '\') }}' + '"';

        }))
        .pipe(gulp.dest('layouts'));
});

gulp.task('twig:link', function () {
    return gulp.src('layouts/*.twig')
        .pipe(replace(/<a (.*?)>/gim, function(match, attrString) {
            let attributes = {};
            attrString.replace(/(.*?)="(.*?)"/gi, function (match, key, value) {
                key = key.trim();
                if(key !== 'href') attributes[key] = value;
            });
            return '{{ landing.link_start(' + JSON.stringify(attributes) + ') }}';
        }))
        .pipe(replace(/<\/a>/gi, '{{ landing.link_end() }}'))
        .pipe(gulp.dest('layouts'));
});

gulp.task('default', ['css', 'js', 'watch']);
