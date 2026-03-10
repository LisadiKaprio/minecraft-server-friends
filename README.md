# Minecraft Server Friends - Chrome Extension

A Chrome extension that lets you track your friends on Minecraft servers with real-time notifications.

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select this folder
5. The extension icon should now appear in your toolbar

## Usage

### Adding a Server

1. Click the extension icon
2. Go to the "Settings" tab
3. Enter your server's IP/Port and give it a name
4. Click "Add Server"
5. Click "Set Primary" -> that way, the number on the extension icon will always show the amount of active players on this specific server.

### Managing Friends

1. In the "Settings" tab, add friend names under "Favorite Friends"
2. When these friends join/leave your primary server, you'll get notifications
3. Toggle "Notify for all players joining" to see notifications for every player

### Dashboard

1. The "Dashboard" tab shows:
   - Number of online players
   - List of current players with their avatars
   - Server status (online/offline)

## Security Notes

- Server IPs are stored locally in your browser's sync storage

## API Used

- **Server Status**: https://api.mcsrvstat.us/3/
- **Player Avatars**: https://minotar.net/


