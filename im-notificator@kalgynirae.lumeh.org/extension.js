
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Tweener = imports.ui.tweener;

function incrementMessageCount() {
    notificator.setMessageCount(notificator._messageCount + 1);
}

function init() {
}

function enable() {
    notificator = new Notificator();
    Main.panel.addToStatusArea('im-notificator', notificator);

    // For testing
    notificator.setMessageCount(2);
    notificator.addConversation('John Smith', 2, incrementMessageCount);
}

function disable() {
    notificator.destroy();
}

function Notificator() {
    this._init.apply(this, arguments);
}

Notificator.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0, 'im-notificator');

        // Set up like PanelMenu.SystemStatusButton except with a label
        // instead of an icon
        this._notificatorLabel = new St.Label({style_class: 'im-notificator-label'});
        this.actor.add_actor(this._notificatorLabel);
        this.actor.add_style_class_name('panel-status-button');

        // Initialize the message count
        this._messageCount = 0;
    },

    addConversation: function(name, messageCount, callback) {
        let title = name + " (" + messageCount.toString() + ")";
        let menuItem = new PopupMenu.PopupMenuItem(title);
        menuItem.connect('activate', callback);
        this.menu.addMenuItem(menuItem);
    },

    setMessageCount: function(count) {
        this._messageCount = count;
        this._notificatorLabel.set_text(this._messageCount.toString());
    },
};
