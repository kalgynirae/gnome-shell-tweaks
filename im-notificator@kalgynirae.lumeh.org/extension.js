
const DBus = imports.dbus;
const St = imports.gi.St;
const Lang = imports.lang;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

function debug(message) {
}
/* FOR DEBUGGING
const Tweener = imports.ui.tweener;
let debugMessageLabel;
function _hideDebugMessage() {
    Main.uiGroup.remove_actor(debugMessageLabel);
    debugMessageLabel = null;
}
function debug(message) {
    if (!debugMessageLabel) {
        debugMessageLabel = new St.Label({ style_class: 'debug-label', text: message});
        Main.uiGroup.add_actor(debugMessageLabel);
    }
    debugMessageLabel.set_text(message);
    debugMessageLabel.opacity = 255;
    let monitor = Main.layoutManager.primaryMonitor;
    debugMessageLabel.set_position(monitor.x + Math.floor(monitor.width / 2 - debugMessageLabel.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - debugMessageLabel.height / 2));
    Tweener.addTween(debugMessageLabel,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeInQuart',
                       onComplete: _hideDebugMessage });
}
*/

const PidginInterface = {
    name: 'im.pidgin.purple.PurpleInterface',
    properties: [],
    methods: [
        {name: 'PurpleConversationPresent', inSignature: 'i', outSignature: ''},
    ],
    signals: [
        {name: 'WroteImMsg', inSignature: 'issii'}, // viewed=false
        {name: 'ConversationUpdated', inSignature: 'iu'}, // [u=4] viewed=true
        {name: 'DeletingConversation', inSignature: 'i'}, // forget conversation
    ],
};
let PidginProxy = DBus.makeProxyClass(PidginInterface);

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

        // Initialize the message counts
        this._conversations = {};

        // Initialize DBus proxy object
        let proxy = new PidginProxy(DBus.session,
                                    'im.pidgin.purple.PurpleService',
                                    '/im/pidgin/purple/PurpleObject');
        this._pidginProxy = proxy;
        this._messageDisplayedId = proxy.connect('WroteImMsg', Lang.bind(this, this._messageDisplayed));
        this._conversationUpdatedId = proxy.connect('ConversationUpdated', Lang.bind(this, this._conversationUpdated));
        this._conversationDeletedId = proxy.connect('DeletingConversation', Lang.bind(this, this._conversationDeleted));

        this._update();
    },

    destroy: function() {
        this._pidginProxy.disconnect(this._messageDisplayedId);
        this._pidginProxy.disconnect(this._conversationUpdatedId);
        this._pidginProxy.disconnect(this._conversationDeletedId);
        PanelMenu.Button.prototype.destroy.call(this);
    },

    _conversationUpdated: function(emitter, id, updateType) {
        debug("_conversationUpdated");
        if (updateType != 4) return;
        if (id in this._conversations) {
            this._conversations[id].setViewed(true);
        }
    },

    _conversationDeleted: function(emitter, id) {
        debug("_conversationDeleted");
        if (id in this._conversations) {
            this._conversations[id].destroy();
            delete this._conversations[id];
            this._update();
        }
    },

    _messageDisplayed: function(emitter, account, sender, message, conv, flags) {
        debug("_messageDisplayed");
        // Only handle if the signal is for sent or received messages
        if (flags != 1 && flags != 2) return;
        if (!(conv in this._conversations))
            this._conversations[conv] = new Conversation(conv, this);
        this._conversations[conv].newMessage(sender);
    },

    _update: function() {
        let count = Object.keys(this._conversations).length;
        this._notificatorLabel.set_text(count.toString());
        if (count > 0) {
            this.actor.show();
        }
        else {
            this.actor.hide();
        }
        let newMessages = false;
        for (c in this._conversations) {
            if (!this._conversations[c]._viewed)
                newMessages = true;
        }
        let color = newMessages ? '#a01010' : '#404040';
        this._notificatorLabel.set_style('background-color: ' + color);
    },
};

function Conversation(id, notificator) {
    this._init(id, notificator);
}
Conversation.prototype = {
    _init: function(id, notificator) {
        this._id = id;
        this._menuItem = null;
        this._notificator = notificator;
        this._sender = '';
        this._viewed = false;
    },

    destroy: function() {
        this._menuItem.destroy();
    },

    newMessage: function(sender) {
        if (this._menuItem == null) {
            this._sender = sender;
            this._menuItem = new PopupMenu.PopupMenuItem(this._sender);
            this._menuItem.connect('activate', Lang.bind(this, function() {
                this.present();
            }));
            this._notificator.menu.addMenuItem(this._menuItem);
        }
        this.setViewed(false);
    },

    present: function() {
        this._notificator._pidginProxy.PurpleConversationPresentRemote(this._id);
        this.setViewed(true);
    },

    setViewed: function(viewed) {
        if (viewed) {
            this._viewed = true;
            this._menuItem.label.set_text(this._sender);
        }
        else {
            this._viewed = false;
            this._menuItem.label.set_text("# " + this._sender);
        }
        this._notificator._update();
    },
};

function init() {
}

function enable() {
    notificator = new Notificator();
    Main.panel.addToStatusArea('im-notificator', notificator);
    debug("im-notificator enabled!");
}

function disable() {
    notificator.destroy();
    debug("im-notificator disabled!");
}
