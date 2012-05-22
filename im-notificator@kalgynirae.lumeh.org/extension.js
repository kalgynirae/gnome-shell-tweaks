
const DBus = imports.dbus;
const St = imports.gi.St;
const Lang = imports.lang;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const PidginInterface = {
    name: 'im.pidgin.purple.PurpleInterface',
    properties: [],
    methods: [
        {name: 'PurpleConversationPresent', inSignature: 'i', outSignature: ''},
    ],
    signals: [
        {name: 'ConversationCreated', inSignature: 'i'}, // create conversation
        {name: 'DisplayedImMsg', inSignature: 'issii'}, // viewed=false
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
        //this._conversationCreatedId = proxy.connect('ConversationCreated', Lang.bind(this, this._conversationCreated));
        this._messageDisplayedId = proxy.connect('DisplayedImMsg', Lang.bind(this, this._messageDisplayed));
        this._conversationUpdatedId = proxy.connect('ConversationUpdated', Lang.bind(this, this._conversationUpdated));
        this._conversationDeletedId = proxy.connect('DeletingConversation', Lang.bind(this, this._conversationDeleted));
    },

    destroy: function() {
        //this._pidginProxy.disconnect(this._conversationCreatedId);
        this._pidginProxy.disconnect(this._messageDisplayedId);
        this._pidginProxy.disconnect(this._conversationUpdatedId);
        this._pidginProxy.disconnect(this._conversationDeletedId);
        PanelMenu.Button.prototype.destroy.call(this);
    },

    _conversationUpdated: function(emitter, id, updateType) {
        if (updateType != 4) return;
        if (id in this._conversations) {
            this._conversations[id].viewed = true;
        }
        this._update();
    },

    _conversationDeleted: function(emitter, id) {
        if (id in this._conversations) {
            this._conversations[id].destroy();
            delete this._conversations[id];
        }
        this._update();
    },

    _messageDisplayed: function(emitter, account, sender, message, conv, flags) {
        // Only handle normal received messages
        if (flags != 2) return;
        if (!(conv in this._conversations))
            this._conversations[conv] = new Conversation(conv, this);
        this._conversations[conv].newMessage(sender);
        this._update();
    },

    _update: function() {
        let count = 0;
        for (let c in this._conversations) {
            if (!this._conversations[c].viewed)
                count += 1;
        }
        this._notificatorLabel.setText(count.toString());
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
        this.viewed = true;
    },

    destroy: function() {
        this._menuItem.destroy();
    },

    newMessage: function(sender) {
        this.viewed = false;
        if (this._menuItem == null) {
            this._menuItem = new PopupMenu.PopupMenuItem(sender);
            menuItem.connect('activate', Lang.bind(this, function() {
                this.present();
            }));
            this._notificator.menu.addMenuItem(menuItem);
        }
    },

    present: function() {
        this._notificator._pidginProxy.PurpleConversationPresentRemote(this._id);
    },
};

function init() {
}

function enable() {
    notificator = new Notificator();
    Main.panel.addToStatusArea('im-notificator', notificator);
}

function disable() {
    notificator.destroy();
}
