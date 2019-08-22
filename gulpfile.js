'use strict';

/**
 * Import node modules
 */
var gulp         = require('gulp');
var sass         = require('gulp-sass');
var sassGlob     = require('gulp-sass-glob');
var rename       = require('gulp-rename');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browser_sync = require('browser-sync');
var rimraf       = require('rimraf');
var rollup       = require('gulp-rollup');
var nodeResolve  = require('rollup-plugin-node-resolve');
var commonjs     = require('rollup-plugin-commonjs');
var babel        = require('rollup-plugin-babel');
var ejs          = require('gulp-ejs');
var ts           = require('gulp-typescript');

var dev_dir = 'src/';
var dist_dir = 'dist/';

var dir = {
  src: {
    json  : dev_dir + 'json',
    css   : dev_dir+'css',
    js    : dev_dir+'js',
    lib   : dev_dir+'lib',
    jquery: dev_dir + 'lib/jquery',
    images: dev_dir+'images',
    ejs   : dev_dir+'ejs',
    ts    : dev_dir+'ts'
  },
  dist: {
    json  : dist_dir + 'assets/json',
    css   : dist_dir+'assets/css',
    js    : dist_dir+'assets/js',
    lib    : dist_dir+'assets/lib',
    jquery: dist_dir + 'assets/lib/jquery',
    ts    : dist_dir+'assets/js',
    images: dist_dir+'assets/images',
    ejs   : dist_dir
  }
}

/**
 * Build TypeScript
 */
gulp.task('ts', function() {
  var pj = ts.createProject("./tsconfig.json");
  gulp.src([dir.src.ts + '/*.ts',
        '!./node_modules/**'
      ])
      .pipe(pj())
      .js
      .pipe(gulp.dest(dir.dist.js));
});


/**
 * Build JavaScript
 */
gulp.task('js', function() {

  // 自作のスクリプトファイルを１つのファイルにまとめてコピーする
  gulp.src([dir.src.js + '/*.js', dir.src.js + '/script/*.js'])
    .pipe(rollup({
      allowRealFiles: true,
      entry: dir.src.js + '/app.js',
      format: 'es',
      moduleName: 'myproject',
      plugins: [
        nodeResolve({ jsnext: true }),
        commonjs(),
        babel({
          presets: ['es2015-rollup'],
          babelrc: false
        })
      ]
    }))
    .pipe(rename('common.js'))
    .pipe(gulp.dest(dir.dist.js));

});

/**
 * Build CSS
 */
gulp.task('css', function() {
  return gulp.src(
      [
        dir.src.css + '/style.scss',
      ],
      {base: dir.src.css}
    )
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths,
      outputStyle: 'expanded'
    }))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
        grid: true
      })
    ]))
    .pipe(gulp.dest(dir.dist.css))
});


/**
 * Copy lib
 */
gulp.task('lib', ['remove-json'], function () {
  return gulp.src(dir.src.lib + '/**/*')
    .pipe(gulp.dest(dir.dist.lib));
});

gulp.task('remove-lib', function (cb) {
  rimraf(dir.dist.lib, cb);
});


/**
 * Copy json
 */
gulp.task('json', ['remove-json'], function() {
  return gulp.src(dir.src.json + '/**/*')
    .pipe(gulp.dest(dir.dist.json));
});

gulp.task('remove-json', function(cb) {
  rimraf(dir.dist.json, cb);
});


/**
 * Copy images
 */
gulp.task('images', ['remove-images'], function() {
  return gulp.src(dir.src.images + '/**/*')
    .pipe(gulp.dest(dir.dist.images));
});

gulp.task('remove-images', function(cb) {
  rimraf(dir.dist.images, cb);
});


/**
 * EJS to HTML
 */
gulp.task('ejs', function() {
  gulp.src([
    dir.src.ejs + '/**/*.ejs',
    '!' + dir.src.ejs + '/**/_*.ejs'
  ])
  .pipe(ejs(
    {},
    {},
    {ext: '.html'})
  )
  .pipe(gulp.dest(dir.dist.ejs));
});

/**
 * Auto Build
 */
gulp.task('watch', function() {
  gulp.watch([dir.src.css + '/**/*.scss'], ['css']);
  gulp.watch([dir.src.ts + '/**/*.ts'], ['ts']);
  gulp.watch([dir.src.js + '/**/*.js'], ['js']);
  gulp.watch([dir.src.ejs + '/**/*.ejs'], ['ejs']);
});

/**
 * Browsersync
 */
gulp.task('browsersync', function() {
  browser_sync.init( {
    server: {
      baseDir: dir.dist.ejs
    },
    files: [
      dir.dist.ejs + '/**'
    ]
  });
});


gulp.task('build', ['css','ts', 'js', 'ejs', 'images', 'lib']);

gulp.task('default', ['build', 'browsersync', 'watch']);

