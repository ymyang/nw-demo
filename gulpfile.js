/**
 * Created by yang on 2015/8/12.
 */
'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const proc = require('child_process');
const gulp = require('gulp');
const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const del = require('del');
const shelljs = require('shelljs');
const jetpack = require('fs-jetpack');
const Promise = require('bluebird');

const _isMac = os.type() === 'Darwin';

// mac应用名称
const appName = '一粒云';

const nwVersion = '0.14.7';

// 清理build和release目录
gulp.task('clean', (cb) => {
    del(['./build', './release'], cb);
});

gulp.task('build', () => {
    jetpack.dir('./build', { empty: true});
    jetpack.copy('./src/app', './build', { overwrite: true });
    jetpack.copy('./src/res', './build/res', { overwrite: true });
    jetpack.copy('./src/package.json', './build/package.json', { overwrite: true });
});

// 启动调试
gulp.task('start', () => {
    let nwjs = 'res/nw/' + nwVersion + '/win32/nw.exe';
    if (_isMac) {
        nwjs = 'res/nw/' + nwVersion + '/osx64/nwjs.app/Contents/MacOS/nwjs';
    }
    let nw = path.join(__dirname, nwjs);
    gutil.log('nwjs:', nw);
    //shelljs.exec(nw + ' ./build');
    let p = proc.spawn(nw, ['./build']);

    p.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    p.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    p.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});

// 打包
gulp.task('pack', () => {
    jetpack.dir('./publish');
    jetpack.dir('./release', { empty: true });

    _copyApp();

    _copyNW();

    _copyCommon();

    return _winIcon();

});

// 生成安装包
gulp.task('install', function() {
    if (_isMac) {
        // mac安装包
        runSequence('nw', 'dmg');
        return;
    }
    // windows安装包
    shelljs.exec('makensis ./res/install.nsi');
});


// 打包mac安装包
gulp.task('dmg', () => {
    let manifest = jetpack.read('./src/package.json', 'json');
    let appdmg = require('appdmg');
    let app = appdmg({
        target: './publish/yliyun-mac-v' + manifest.version + '.dmg',
        basepath: __dirname,
        specification: {
            title: appName,
            icon: './src/res/yliyun.icns',
            contents: [
                { x: 448, y: 144, type: 'link', path: '/Applications' },
                { x: 192, y: 144, type: 'file', path: './publish/' + appName + '/osx64/' + appName + '.app' }
            ]
        }
    });
    app.on('progress', (info) => {
        gutil.log('progress:', JSON.stringify(info));
    });
    app.on('finish', () => {
        gutil.log('finish');
    });
    app.on('error', (err) => {
        gutil.log(err);
    });
});

// 打包mac应用程序文件
gulp.task('nw', () => {
    let manifest = jetpack.read('./src/package.json', 'json');
    let Nwbuilder = require('nw-builder');
    let nw = new Nwbuilder({
        files: './release/app/**/**',
        version: nwVersion,
        platforms: _isMac ? ['osx64'] : ['win32'],
        appName: appName,
        appVersion: manifest.version,
        buildDir: './publish',
        cacheDir: './res/nw',
        buildType: 'default',
        zip: false,
        winIco: './release/app/yliyun.ico',
        //forceDownload: true,
        //macCredits: '',
        macIcns: './release/app/yliyun.icns',
        macPlist: {
            CFBundleDisplayName: appName
        }
    });

    nw.on('log', (msg) => {
        gutil.log('nw-builder log', msg);
    });

    return nw.build().then(() => {
        gutil.log('nw-builder', 'all done');

        if (_isMac) {
            var ffmpegTarget = './publish/' + appName + '/osx64/' + appName
                + '.app/Contents/Versions/50.0.2661.102/nwjs Framework.framework/libffmpeg.dylib';

            jetpack.copy('./res/libffmpeg.dylib', ffmpegTarget, {
                overwrite: true
            });
        }

        return;
    }).catch((err) => {
        gutil.log('nw-builder err', err);
    });
});

// 拷贝nw至release
function _copyNW() {
    jetpack.copy('./res/nw/' + nwVersion + '/win32', './release', {
        overwrite: true,
        matching: ['locales/en-US.pak', 'locales/zh-CN.pak', 'locales/zh-TW.pak',
            'd3dcompiler_47.dll', 'dbghelp.dll', 'ffmpeg.dll', 'icudtl.dat', 'libEGL.dll', 'libexif.dll',
            'libGLESv2.dll', 'natives_blob.bin', 'node.dll', 'nw.dll', 'nw.exe', 'nw_100_percent.pak',
            'nw_200_percent.pak', 'nw_elf.dll', 'resources.pak', 'snapshot_blob.bin']
    });

    gutil.log('copy nw done');

    jetpack.copy('./res/ffmpeg.dll', './release/ffmpeg.dll', {
        overwrite: true
    });

    jetpack.rename('./release/nw.exe', 'yliyun.exe');
    return;
}

// 拷贝程序文件至release
function _copyApp() {
    jetpack.copy('./build', './release/app', {
        overwrite: true
    });

    gutil.log('copy app done');
    return;
}

// 拷贝其他资源至release
function _copyCommon() {
    jetpack.copy('./res', './release', {
        overwrite: true,
        matching: ['yliyun_start.exe']
    });
    gutil.log('copy common done');
    return;
}

// 替换exe图标
function _winIcon() {
    return new Promise((resolve, reject) => {
        require('winresourcer')({
            operation: 'Update', // one of Add, Update, Extract or Delete
            exeFile: './release/yliyun.exe',
            resourceType: 'Icongroup',
            resourceName: 'IDR_MAINFRAME',
            lang: 1033, // Required, except when updating or deleting
            resourceFile: './src/res/yliyun.ico' // Required, except when deleting
        }, (err) => {
            // callback
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

gulp.task('default', ['build']);