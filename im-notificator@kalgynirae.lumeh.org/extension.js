
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Tweener = imports.ui.tweener;

let text;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}

function init() {
}

function enable() {
    notificatorMenu = new NotificatorMenu();
    Main.panel.addToStatusArea('notificator-menu', notificatorMenu);
}

function disable() {
    notificatorMenu.destroy();
}

function NotificatorMenu() {
    this._init.apply(this, arguments);
}

NotificatorMenu.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'printer-printing-symbolic');

        // Add a menu item
        this._testmenuitem = new PopupMenu.PopupMenuItem("Display message");
        this.menu.addMenuItem(this._testmenuitem);
        this._testmenuitem.connect('activate', _showHello);
    },
};
