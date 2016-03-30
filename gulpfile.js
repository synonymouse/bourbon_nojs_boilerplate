'use strict';

var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var nano = require('gulp-cssnano');
var uncss = require('gulp-uncss');
var rename = require('gulp-rename');
var bourbon = require('node-bourbon').includePaths;
var dirSync = require('gulp-directory-sync');
var browserSync = require('browser-sync');
var injector = require('bs-html-injector');
var reload = browserSync.reload;

var f = {
  dev: 'dev',
  build: 'build',
  css: 'build/css',
  scss: 'dev/scss/**/*.{scss,sass}',
  html: 'build/*.html',
  jade: 'dev/*.jade'
};

// error function for plumber
var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

// Browser definitions for autoprefixer
var autoprefixer_options = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Jade convert
gulp.task('jade', function() {
  gulp.src(f.jade)
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(f.build));
});

// Sass convert & Autoprefixer
gulp.task('sass', function() {
  gulp.src(f.scss)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      style: 'expanded',
      includePaths: bourbon
    }).on('error', sass.logError))
    .pipe(uncss({
            html: [f.html]
        }))
    .pipe(gulp.dest(f.css))
    .pipe(postcss([autoprefixer({
      browsers: autoprefixer_options
    })]))
    .pipe(nano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(f.css))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(notify( 'Styles ready' ));
});

// Image sync
gulp.task('images:sync', function() {
  return gulp.src('')
    .pipe(dirSync(f.dev + '/images', f.build + '/images'))
    .on('error', gutil.log);;
});

// Javascript sync
gulp.task('js:sync', function() {
  return gulp.src('')
    .pipe(dirSync(f.dev + '/js', f.build + '/js'))
    .pipe(browserSync.stream());
});

// Browsersync server
gulp.task('server', ['sass'], function() {
  browserSync.use(injector, {
    files: 'build/*.html'
  });
  browserSync({
    server: {
      baseDir: 'build'
    },
    notify: false
  });
});

//Watch

gulp.task('watch', function() {
  gulp.watch(f.jade, ['jade']);
  gulp.watch(f.scss, ['sass']);
  gulp.watch(f.dev + '/images', ['images:sync']);
  gulp.watch(f.dev + '/js', ['js:sync']);
});

// Default Task

gulp.task('default', ['server', 'watch']);
