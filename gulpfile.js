/**
 * Created by yang on 2015/8/12.
 */
var nw = require('nw');
var gulp = require('gulp');
var gutil = require('gulp-util');
var rev = require('gulp-rev');
var del = require('del');
var shelljs = require('shelljs');

gulp.task('clean', function(cb) {
    del(['./build'], cb);
});

gulp.task('script', function() {
    return gulp.src('./src/**/*.js')
        .pipe(require('gulp-uglify')())
        .pipe(rev())
        .pipe(gulp.dest('./build/js'));
});

gulp.task('less', function() {
    return gulp.src('./src/**/*.less')
        .pipe(require('gulp-less')())
        .pipe(require('gulp-minify-css')())
        .pipe(gulp.dest('./build/css'));
});

gulp.task('css', function() {
    return gulp.src('./src/**/*.css')
        .pipe(require('gulp-minify-css')())
        .pipe(gulp.dest('./build/css'));
});

gulp.task('nw', function() {
    var Nwbuilder = require('nw-builder');
    var nw = new Nwbuilder({
        files: './build/**/**',
        version: "0.12.3",
        appName: 'yliyun',
        appVersion: '0.0.1',
        platforms: ['win32'] ,
        buildDir: './release',
        cacheDir: './tmp',
        buildType: 'versioned',
        //forceDownload: true,
        winIco: './build/yliyun.ico'
    });

    nw.on('log', function(msg) {
        gutil.log('nw-builder log', msg);
    });

    return nw.build().then(function() {
        gutil.log('nw-builder', 'all done');
    }).catch(function(err) {
        gutil.log('nw-builder err', err);
    });
});

gulp.task('fis', function() {
    shelljs.cd('./src/web');
    shelljs.exec('yliyun release -cd ../../build');
    shelljs.cd('../../');
});

gulp.task('node_modules', function() {
    return gulp.src(['./src/node_modules/**/**'])
        .pipe(gulp.dest('./build/node_modules/'));
});

gulp.task('node', ['node_modules'], function() {
    return gulp.src(['./src/node/**/*.js'])
        .pipe(gulp.dest('./build/node/'));
});

gulp.task('copy', ['node'], function() {
    return gulp.src(['./src/package.json', './src/res/**/**'])
        .pipe(gulp.dest('./build/'));
});

gulp.task('watch', function() {
    gulp.watch('./src/web/**/**', ['fis']);
    gulp.watch('./src/node/**/**', ['node']);
    gulp.watch('./src/res/**/**', ['copy']);
});

gulp.task('start', function() {
    shelljs.exec(nw.findpath() + ' ./build');
});

gulp.task('build', ['fis', 'copy']);

gulp.task('serve', ['build', 'watch'], function() {
    gulp.start('start');
});

gulp.task('release', ['nw']);

gulp.task('default', ['build']);