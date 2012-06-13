/**
 * sensible-status-menu, a gnome-shell extension that changes the status menu
 * https://github.com/kalgynirae/gnome-shell-tweaks
 * Copyright 2012 Colin Chan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Lang = imports.lang;
const Util = imports.misc.util;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

let suspend_item = null;
let reboot_item = null;
let reboot_windows_item = null;
let poweroff_item = null;

function init(metadata) {
}

function enable() {
    let statusMenu = Main.panel._statusArea.userMenu;
    let children = statusMenu.menu._getMenuItems();
    let index = children.length;

    // Remove the suspend/poweroff menu item
    for (let i = children.length - 1; i >= 0; i--) {
        if (children[i] == statusMenu._suspendOrPowerOffItem) {
            children[i].destroy();
            index = i;
            break;
        }
    }
    statusMenu._suspendOrPowerOffItem = null;

    // Add the new menu items
    suspend_item = new PopupMenu.PopupMenuItem("Suspend");
    suspend_item.connect('activate', Lang.bind(statusMenu, function() {
        Main.overview.hide();
        this._screenSaverProxy.LockRemote(Lang.bind(this, function() {
            this._upClient.suspend_sync(null);
        }));
    }));

    reboot_item = new PopupMenu.PopupMenuItem("Reboot");
    reboot_item.connect('activate', function() {
        Util.spawn(['systemctl', 'reboot']);
    });

    reboot_windows_item = new PopupMenu.PopupMenuItem("Reboot to Windows");
    reboot_windows_item.connect('activate', function() {
        Util.spawn(['/usr/local/bin/reboot-windows']);
    });

    poweroff_item = new PopupMenu.PopupMenuItem("Power Off");
    poweroff_item.connect('activate', Lang.bind(statusMenu, function() {
        this._session.ShutdownRemote();
    }));

    statusMenu.menu.addMenuItem(suspend_item, index);
    statusMenu.menu.addMenuItem(reboot_item, index + 1);
    statusMenu.menu.addMenuItem(reboot_windows_item, index + 2);
    statusMenu.menu.addMenuItem(poweroff_item, index + 3);

    // Remove ellipsis from logout menu item
    statusMenu._logoutItem.label.set_text("Log Out")
}

function disable() {
    let statusMenu = Main.panel._statusArea.userMenu;
    let children = statusMenu.menu._getMenuItems();
    let index = children.length;

    // Find the index where the original suspend/poweroff item was
    for (let i = children.length - 1; i >= 0; i--) {
        if (children[i] == suspend_item) {
            index = i;
            break;
        }
    }

    // Remove the menu items we added
    suspend_item.destroy();
    reboot_item.destroy();
    reboot_windows_item.destroy();
    poweroff_item.destroy();

    // Recreate the original suspend/poweroff menu item
    /* empty strings are fine for the labels, since we immediately call updateSuspendOrPowerOff */
    let item = new PopupMenu.PopupAlternatingMenuItem("", "");
    statusMenu._suspendOrPowerOffItem = item;
    statusMenu.menu.addMenuItem(item, index);
    item.connect('activate', Lang.bind(statusMenu, statusMenu._onSuspendOrPowerOffActivate));
    statusMenu._updateSuspendOrPowerOff();

    // Reset the text of logout menu item
    statusMenu._logoutItem.label.set_text("Log Out...")
}
