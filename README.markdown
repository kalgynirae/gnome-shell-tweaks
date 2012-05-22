This extension displays the number of active Pidgin conversations on a
small icon in the panel status area. Clicking the icon presents a menu
which lists the conversations. When a conversation receives a new
message, the icon will change to a shade of red until you interact with
the conversation.

For best results, change your Pidgin preferences so "Hide new
conversation windows" is set to "Always".

Note that the extension may be buggy due to the unpredictablility of
some of Pidgin's DBus signals.

Installation
------------
1. Clone the repository and create a symlink in the extensions folder.

    ln -s im-notificator@kalgynirae.lumeh.org \
    ~/.local/share/gnome-shell/extensions/im-notificator@kalgynirae.lumeh.org

2. Restart gnome-shell by pressing Alt+F2 and typing `r`.

3. Use gnome-tweak-tool or https://extensions.gnome.org/local/ to enable the
   extension.
