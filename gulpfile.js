/**
 * Created by yang on 2015/8/12.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var rev = require('gulp-rev');
var del = require('del');
var shelljs = require('shelljs');

gulp.task('clean', function(cb) {
    del(['./build', './release'], cb);
});

gulp.task('nw', function() {
    var Nwbuilder = require('nw-builder');
    var nw = new Nwbuilder({
        files: './build/**/**',
        version: '0.13.2',
        platforms: ['osx64', 'win32'],
        appName: 'yliyun',
        appVersion: '1.6.7',
        buildDir: './release',
        cacheDir: './res/nw',
        buildType: 'default',
        zip: true,
        winIco: './build/yliyun.ico',
        //forceDownload: true,
        //macCredits: '',
        macIcns: './build/yliyun.icns'
        //macPlist: ''
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
    shelljs.exec('fisy release');
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
    return gulp.src(['./src/package.json', './src/res/**/**', './src/web/**/**'])
        .pipe(gulp.dest('./build/'));
});

gulp.task('build', ['fis', 'copy']);

gulp.task('start', ['build'], function() {
    var nw = path.join(__dirname, 'res/nw/0.13.2/win32/nw.exe');
    console.log('nw:', nw);
    shelljs.exec(nw + ' ./build');
});

gulp.task('release', ['nw']);

gulp.task('default', ['build']);