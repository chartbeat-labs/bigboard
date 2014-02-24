'use strict';

var gui = require('nw.gui');

var menuBar = new gui.Menu({'type': 'menubar'});

var fileMenuItems = new gui.Menu();

fileMenuItems.append(new gui.MenuItem({ label: 'Item A' }));
fileMenuItems.append(new gui.MenuItem({ label: 'Item B' }));
fileMenuItems.append(new gui.MenuItem({ type: 'separator' }));
fileMenuItems.append(new gui.MenuItem({
  label: 'Sign Out',
  click: function() {
    window.alert('Sign out');
  }
}));

menuBar.append(new gui.MenuItem({
  label: 'Account',
  submenu: fileMenuItems
}));

gui.Window.get().menu = menuBar;
