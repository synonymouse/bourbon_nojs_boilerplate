'use strict';

var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var bourbon = require('node-bourbon').includePaths;
var dirSync = require( 'gulp-directory-sync');
var browserSync = require('browser-sync');
var injector = require('bs-html-injector');
// var ghPages = require('gulp-gh-pages');
var reload = browserSync.reload;

var f = {
dev: 'dev',
build: 'build',
css: 'build/css',
scss: 'dev/scss/**/*.{scss,sass}',
html: 'build/*.html',
jade: 'dev/*.jade'
};

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

gulp.task('jade', function () {
gulp.src(f.jade)
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest(f.build));
});

// Sass convert & Autoprefixer

gulp.task('sass', function () {
gulp.src(f.scss)
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: bourbon
  }).on('error', sass.logError))
  .pipe(postcss([ autoprefixer({ browsers: autoprefixer_options }) ]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(f.css))
  .pipe(browserSync.reload({
    stream: true
  }));
});

// Image sync
gulp.task('images:sync', function () {
return gulp.src('')
  .pipe(dirSync(f.dev + '/images', f.build + '/images'))
  .on('error', gutil.log);;
});

// Javascript sync
gulp.task('js:sync', function () {
return gulp.src('')
  .pipe(dirSync(f.dev + '/js', f.build + '/js'))
  .pipe(browserSync.stream());
});

// Browsersync server

gulp.task('server', ['sass'], function () {
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

// //Deploy to github pages
//
// gulp.task('deploy', function() {
//   return gulp.src('./build/**/*')
//     .pipe(ghPages());
// });

//Watch

gulp.task('watch', function () {
gulp.watch(f.jade, ['jade']);
gulp.watch(f.scss, ['sass']);
gulp.watch(f.dev + '/images', ['images:sync']);
gulp.watch(f.dev + '/js', ['js:sync']);
});

// Default Task

gulp.task('default', ['server', 'watch']);
