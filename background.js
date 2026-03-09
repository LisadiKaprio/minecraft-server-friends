// Background service worker for Minecraft Server Friends extension

const API_BASE = 'https://api.mcsrvstat.us/3/';
const CHECK_INTERVAL_MINUTES = 1;

// Track server status and player changes
// let serverStatusCache = {};
// let lastPlayerStates = {};

// Initialize
chrome.runtime.onInstalled.addListener(() => {
    setupAlarms();
    console.log('Minecraft Server Friends extension installed');
});

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
    setupAlarms();
});

function setupAlarms() {
    // Clear existing alarms
    chrome.alarms.clearAll(() => {
        // Set up recurring alarm to check servers
        chrome.alarms.create('checkServers', {
            periodInMinutes: CHECK_INTERVAL_MINUTES
        });
        // Check immediately on startup
        checkAllServers();
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkServers') {
        checkAllServers();
    }
});

async function checkAllServers() {
    console.log("checkAllServers");
    chrome.storage.sync.get({
        servers: [],
        friends: [],
        allFriends: false,
        primaryServer: null
    }, async (data) => {
        if (data.servers.length === 0) return;

        const localData = await chrome.storage.local.get("serverStatusCache");
        let serverStatusCache = localData.serverStatusCache || {};

        for (const server of data.servers) {
            await checkServer(server, data.friends, data.allFriends, serverStatusCache);
        }

        // Update badge for primary server
        if (data.primaryServer) {
            const primaryServer = data.servers.find(s => s.id === data.primaryServer);
            if (primaryServer && serverStatusCache[primaryServer.id]) {
                updateBadge(serverStatusCache[primaryServer.id]);
            }
        }
    });
}

async function checkServer(server, friends, allFriends, serverStatusCache) {
    try {
        const response = await fetch(`${API_BASE}${encodeURIComponent(server.ip)}`);
        const data = await response.json();

        console.log(`checkServer - ${server.id}`);

        const localData = await chrome.storage.local.get("lastPlayerStates");
        let lastPlayerStates = localData.lastPlayerStates || {};

        // Check if server is online and has valid player data
        if (data.online && data.players && data.players.list instanceof Array) {
            const currentPlayers = data.players.list;
            serverStatusCache[server.id] = {
                online: true,
                players: currentPlayers,
                serverName: server.name,
                motd: data.motd?.clean?.[0] || 'A Minecraft Server'
            };

            // Check for player changes
            checkPlayerChanges(server, currentPlayers, friends, allFriends, lastPlayerStates);
        } else {
            // Server is offline
            serverStatusCache[server.id] = {
                online: false,
                players: []
            };
            lastPlayerStates[server.id] = [];
            chrome.storage.local.set({ lastPlayerStates });
        }
    } catch (error) {
        console.error(`Error checking server ${server.ip}:`, error);
        serverStatusCache[server.id] = {
            online: false,
            players: []
        };
    }

    chrome.storage.local.set({ serverStatusCache })
}

function checkPlayerChanges(server, currentPlayers, friends, allFriends, lastPlayerStates) {
    const lastPlayers = lastPlayerStates[server.id] || [];
    console.log(`lastPlayers for ${server.name}: ${lastPlayers}`);
    const currentPlayerNames = currentPlayers.map(p => p.name);
    console.log(`currentPlayerNames for ${server.name}: ${currentPlayerNames}`);
    const lastPlayerNames = lastPlayers.map(p => p.name);
    console.log(`lastPlayerNames for ${server.name}: ${lastPlayerNames}`);

    // sendNotification(`ID: ${server.id}, Name: ${server.name}`, {
    //     contextMessage: `previous players: ${lastPlayerNames}; current players: ${currentPlayerNames}`
    // });

    // Check for players who joined
    const newPlayerNames = currentPlayerNames.filter(name => !lastPlayerNames.includes(name));
    console.log(`newPlayerNames: ${newPlayerNames}`);
    for (let index = 0; index < Math.min(newPlayerNames.length, 4); index++) {
        const name = newPlayerNames[index];
        const uuid = currentPlayers.find(p => p.name == name).uuid;
        if (allFriends || friends.includes(name)) {
            console.log("sending notif about a joiner...");
            sendNotification(`🎉 ${name} joined ${server.name} MC Server!`, {
                iconUrl: `https://minotar.net/avatar/${uuid}/32.png`
            });
        }
    }

    // Check for players who left
    const quitterPlayerNames = lastPlayerNames.filter(name => !currentPlayerNames.includes(name));
    console.log(`quitterPlayerNames: ${quitterPlayerNames}`);
    for (let index = 0; index < Math.min(quitterPlayerNames.length, 4); index++) {
        const name = quitterPlayerNames[index];
        if (allFriends || friends.includes(name)) {
            console.log("sending notif about a quitter...");
            sendNotification(`👋 ${name} left ${server.name} MC Server!`);
        }
    }

    // Update last known state
    lastPlayerStates[server.id] = currentPlayers;
    chrome.storage.local.set({ lastPlayerStates });
}

function updateBadge(status) {
    // const status = serverStatusCache[serverId];
    if (status && status.online) {
        const friendCount = status.players.length;
        if (friendCount > 0) {
            chrome.action.setBadgeText({ text: friendCount.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#709b53' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}

function sendNotification(title, options = {}) {
    const notificationOptions = {
        type: 'basic',
        title: title,
        message: options.contextMessage || '',
        iconUrl: options.iconUrl || chrome.runtime.getURL('images/icon-128.png'),
        silent: true,  // No sound
        priority: 0,   // Lower priority
        isClickable: false,
        ...options
    };

    chrome.notifications.create('', notificationOptions);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getServerStatus') {
        chrome.storage.local.get("serverStatusCache").then((localData) => {
            let serverStatusCache = localData.serverStatusCache;
            const status = serverStatusCache[request.serverId] || {
                online: false,
                players: []
            };
            sendResponse(status);
        });
        return true; // Keep the message port open for async response
    } else if (request.action === 'checkNow') {
        checkAllServers().then(() => {
            sendResponse({ success: true });
        });
        return true; // Keep the message port open for async response
    }
});
