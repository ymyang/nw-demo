/**
 * Created by yang on 2015/8/12.
 */
var gui = require('nw.gui');

window._require = window.require;

window.require = undefined;

var win = gui.Window.get();

window.onload = function() {
    win.show();
};

var tray = undefined;
var trayMenu = new gui.Menu();
trayMenu.append(new gui.MenuItem({
    type: 'normal',
    icon: './yliyun_16.png',
    label: '打开云盘网页版',
    tooltip: '打开云盘网页版',
    click: function() {
        gui.Shell.openExternal('http://192.168.1.120/login.html');
    }
}));

trayMenu.append(new gui.MenuItem({
    type: 'separator'
}));

trayMenu.append(new gui.MenuItem({
    type: 'normal',
    icon: './off_black_16.png',
    label: '退出',
    tooltip: '退出',
    click: function() {
        win.close(true);
    }
}));

win.on('close', function() {
    win.hide();

    tray = new gui.Tray({
        title: '一粒云盘',
        icon: './yliyun_64.png',
        tooltip: '一粒云盘',
        menu: trayMenu
    });

    tray.on('click', function() {
        win.show();
        tray.remove();
        tray = null;
    });

});

