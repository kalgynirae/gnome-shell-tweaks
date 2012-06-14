This is my collection of small custom gnome-shell extensions.

im-notificator
==============

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
1.  Clone the repository and create a symlink in the extensions folder.

        ln -s im-notificator@kalgynirae.lumeh.org \
        ~/.local/share/gnome-shell/extensions/im-notificator@kalgynirae.lumeh.org

6.  Restart gnome-shell by pressing Alt+F2 and typing `r`.

3.  Use gnome-tweak-tool or https://extensions.gnome.org/local/ to
    enable the extension.

sensible-status-menu
====================

sensible-status-menu removes gnome-shell's silly default alternating
suspend/poweroff menu item from the user menu and replaces it with
separate "Suspend", "Reboot", "Reboot to Windows", and "Power Off".

sensible-status-menu assumes that you have done the following:

    $ gsettings set org.gnome.SessionManager logout-prompt 'false'

This makes the "Log Out" and "Power Off" menu items skip their
confirmation dialogs and perform the action immediately. For
consistency, sensible-status-menu removes the ellipsis from the
"Log Off" item.

The "Reboot" menu item executes `systemctl reboot`, which works if your
system uses systemd. The "Reboot to Windows" menu item executes
`/usr/local/bin/reboot-windows`, a script which you'll have to create
yourself (mine uses [old grub's savedefault feature](
http://www.gnu.org/software/grub/manual/legacy/Booting-once_002donly.html)).
