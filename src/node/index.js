/**
 * Created by yang on 2015/8/12.
 */
var gui = require('nw.gui');

global._require = window._require = window.require;

window.require = undefined;

global.gui = window.gui = gui;

var win = gui.Window.get();

window.onload = function() {
    win.show();
};
