<a href='https://ko-fi.com/G2G21VQMHU' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
# <img width="48" height="48" alt="icon-48" src="https://github.com/user-attachments/assets/57e6b0f1-0d2b-40a0-8f78-4138429a5a6a" /> Minecraft Server Friends - Chrome Extension

A Chrome extension that lets you see which players are online on your favourite Minecraft servers. If you want, you will also receive real-time notifications when specific players join or leave.

Inspired by this website: https://mcsrvstat.us/

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select this folder
5. The extension icon should now appear in your toolbar

## Usage

### Dashboard

In the dashboard, you can see these infos for the servers you added:
- Number of online players
- List of current players with their avatars
- Server status (online/offline)

<img width="334" height="438" alt="Screenshot 2026-03-10 142553" src="https://github.com/user-attachments/assets/95d362e2-d630-4668-a017-1daf4ff3c2f5" />


### Adding a Server

1. Click the extension icon
2. Go to the "Settings" tab
3. Enter your server's IP/Port and give it a name
4. Click "Add Server"
5. When you added multiple servers, use the 📌pin button to set primary server -> that way, the number on the extension icon will always show the amount of active players on this specific server.

<img width="321" height="429" alt="Screenshot 2026-03-10 142603" src="https://github.com/user-attachments/assets/dd6d4e5b-a642-42b1-9ccb-d37547d6967a" />


### Managing Friends

1. In the "Settings" tab, add friend names under "Favorite Friends"
2. When these friends join/leave your primary server, you'll get notifications
3. Toggle "Notify for all players joining" to see notifications for every player

<img width="347" height="438" alt="Screenshot 2026-03-10 142614" src="https://github.com/user-attachments/assets/32e78897-7304-4d6b-9e82-0c6a98b84405" />


## Security Notes

- Server IPs are stored locally in your browser's sync storage

## API Used

- **Server Status**: https://api.mcsrvstat.us/3/
- **Player Avatars**: https://minotar.net/


