/**
 * Created by yang on 2015/8/12.
 */
var win = nw.Window.get();

win.on('loaded', function() {
    win.show();
});

nw.App.on('open', function(cmd) {
    win.show();
});

nw.App.on('reopen', function(cmd) {
    win.show();
});

nw.App.registerGlobalHotKey(new nw.Shortcut({
    key: 'Ctrl+F5',
    active: function() {
        win.reload();
    }
}));

var trayMenu = new nw.Menu();
trayMenu.append(new nw.MenuItem({
    type: 'normal',
    icon: 'res/yliyun_16.png',
    label: '打开云盘网页版',
    tooltip: '打开云盘网页版',
    click: function() {
        nw.Shell.openExternal('http://www.yliyun.com');
    }
}));

trayMenu.append(new nw.MenuItem({
    type: 'normal',
    icon: 'res/ios7-paperplane-outline-16.png',
    label: '在线升级',
    tooltip: '在线升级',
    click: function() {
        $log.debug(TAG, 'upgrade clicked');
        win.show();
        //upgrade.showUpgradeView();
    }
}));

trayMenu.append(new nw.MenuItem({
    type: 'separator'
}));

trayMenu.append(new nw.MenuItem({
    type: 'normal',
    icon: 'res/off_black_16.png',
    label: '退出',
    tooltip: '退出',
    click: function() {
        win.close(true);
    }
}));

var _tray = new nw.Tray({
    title: '一粒云',
    icon: 'res/yliyun_64.png',
    tooltip: '一粒云',
    menu: trayMenu
});

_tray.on('click', function() {
    win.show();
});

win.on('close', function(event) {
    if (_tray && event != 'quit') {
        win.hide();
    } else {
        win.close(true);
        nw.App.quit();
    }
});

window.ondragover = function(event) {
    event.preventDefault();
};
window.ondrop = function(event) {
    event.preventDefault();
};

process.on("uncaughtException", function (err) {
    console.error('uncaughtException:', err);
});
process.on("unhandledRejection", function(reason, promise) {
    console.error('unhandledRejection:', reason, promise);
});