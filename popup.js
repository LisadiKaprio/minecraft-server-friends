// Popup script for Minecraft Server Friends extension

let currentData = {
    servers: [],
    friends: [],
    allFriends: false,
    primaryServer: null,
    lastSeenPlayers: {}
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    checkNow();
    refreshServerStatus();
});

function setupEventListeners() {
    // Tab switching
    document.getElementById('tab-dashboard').addEventListener('click', () => switchTab('dashboard'));
    document.getElementById('tab-settings').addEventListener('click', () => switchTab('settings'));

    // Server management
    document.getElementById('add-server-btn').addEventListener('click', addServer);
    document.getElementById('server-ip-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addServer();
    });
    document.getElementById('server-name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addServer();
    });

    // Friend management
    document.getElementById('add-friend-btn').addEventListener('click', addFriend);
    document.getElementById('friend-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFriend();
    });
    document.getElementById('all-friends-toggle').addEventListener('change', toggleAllFriends);
}

function switchTab(tab) {
    const dashboardContent = document.getElementById('dashboard-content');
    const settingsContent = document.getElementById('settings-content');
    const dashboardTab = document.getElementById('tab-dashboard');
    const settingsTab = document.getElementById('tab-settings');

    if (tab === 'dashboard') {
        dashboardContent.classList.remove('hidden');
        settingsContent.classList.add('hidden');
        dashboardTab.classList.add('border-blue-500');
        dashboardTab.classList.remove('border-transparent');
        settingsTab.classList.remove('border-blue-500');
        settingsTab.classList.add('border-transparent');
        refreshServerStatus();
    } else {
        dashboardContent.classList.add('hidden');
        settingsContent.classList.remove('hidden');
        dashboardTab.classList.remove('border-blue-500');
        dashboardTab.classList.add('border-transparent');
        settingsTab.classList.add('border-blue-500');
        settingsTab.classList.remove('border-transparent');
        renderSettings();
    }
}

function addServer() {
    const ipInput = document.getElementById('server-ip-input');
    const nameInput = document.getElementById('server-name-input');

    if (!ipInput || !nameInput) {
        return;
    }
    const ip = ipInput.value;
    const name = nameInput.value;
    if (!ip || !name) {
        alert('Please fill in both fields');
        return;
    }

    const server = { id: Date.now(), ip, name };
    currentData.servers.push(server);

    if (!currentData.primaryServer) {
        setPrimaryServer(server.id);
    }

    checkNow();
    saveData();
    renderSettings();
    ipInput.value = '';
    nameInput.value = '';
}

function removeServer(id) {
    currentData.servers = currentData.servers.filter(s => s.id !== id);
    if (currentData.primaryServer === id) {
        currentData.primaryServer = currentData.servers.length > 0 ? currentData.servers[0].id : null;
    }
    saveData();
    renderSettings();
}

function setPrimaryServer(id) {
    currentData.primaryServer = id;
    saveData();
    renderSettings();
    refreshServerStatus();
}

function addFriend() {
    const nameInput = document.getElementById('friend-name');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter a friend name');
        return;
    }

    if (!currentData.friends.includes(name)) {
        currentData.friends.push(name);
        saveData();
        renderSettings();
        nameInput.value = '';
    }
}

function removeFriend(name) {
    currentData.friends = currentData.friends.filter(f => f !== name);
    saveData();
    renderSettings();
}

function toggleAllFriends(e) {
    currentData.allFriends = e.target.checked;
    saveData();
}

function renderSettings() {
    // Render servers list
    const serversList = document.getElementById('servers-list');
    if (currentData.servers.length === 0) {
        serversList.innerHTML = '<p class="text-gray-400 text-sm">No servers configured</p>';
    } else {
        serversList.innerHTML = currentData.servers.map(server => `
            <div class="server-item">
                <div class="server-item-info">
                    <div class="server-item-name">${escapeHtml(server.name)}</div>
                    <div class="server-item-ip reveal-ip" data-ip="${escapeHtml(server.ip)}">
                        Click to reveal
                    </div>
                </div>
                <div class="server-buttons">
                    <button class="btn-small btn-update" data-server-id="${server.id}">Update</button>
                    ${currentData.primaryServer === server.id 
                        ? '<button disabled class="btn-small btn-success">Primary</button>' 
                        : `<button class="btn-small btn-primary btn-set-primary" data-server-id="${server.id}">Set Primary</button>`
                    }
                    <button class="btn-small btn-danger btn-remove-server" data-server-id="${server.id}">Remove</button>
                </div>
            </div>
        `).join('');
    }

    // Render friends list
    const friendsList = document.getElementById('friends-list');
    if (currentData.friends.length === 0) {
        friendsList.innerHTML = '<p class="text-gray-400 text-sm">No friends added</p>';
    } else {
        friendsList.innerHTML = currentData.friends.map(friend => `
            <div class="friend-item">
                <span class="friend-item-name">${escapeHtml(friend)}</span>
                <button class="btn-small btn-danger btn-remove-friend" data-friend-name="${escapeHtml(friend)}">Remove</button>
            </div>
        `).join('');
    }

    // Update all friends toggle
    document.getElementById('all-friends-toggle').checked = currentData.allFriends;

    // Attach event listeners
    attachEventListeners();
}

function attachEventListeners() {
    // Reveal IP addresses
    document.querySelectorAll('.reveal-ip').forEach(el => {
        el.addEventListener('click', function() {
            const ip = this.dataset.ip;
            toggleIpVisibility(this, ip);
        });
    });

    // Set primary server buttons
    document.querySelectorAll('.btn-set-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            const serverId = parseInt(this.dataset.serverId);
            setPrimaryServer(serverId);
        });
    });

    // Remove server buttons
    document.querySelectorAll('.btn-remove-server').forEach(btn => {
        btn.addEventListener('click', function() {
            const serverId = parseInt(this.dataset.serverId);
            removeServer(serverId);
        });
    });
    
    document.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', async function() {
            const serverId = parseInt(this.dataset.serverId);
            await checkNow();
            refreshServerStatus(serverId);
        });
    });

    // Remove friend buttons
    document.querySelectorAll('.btn-remove-friend').forEach(btn => {
        btn.addEventListener('click', function() {
            const friendName = this.dataset.friendName;
            removeFriend(friendName);
        });
    });
}

function toggleIpVisibility(element, ip) {
    if (element.classList.contains('revealed')) {
        element.classList.remove('revealed');
        element.textContent = 'Click to reveal IP';
    } else {
        element.classList.add('revealed');
        element.textContent = ip;
    }
}

function refreshServerStatus() {
    // const statusDiv = document.getElementById('server-status');
    const primaryServer = currentData.servers.find(s => s.id === currentData.primaryServer);

    if (!primaryServer) {
        document.getElementById('server-name').textContent = 'No Server Selected';
        document.getElementById('online-count').style.display = 'none';
        document.getElementById('offline-status').style.display = 'inline-block';
        document.getElementById('players-list').innerHTML = '<p class="text-gray-400 text-sm">No server selected or server is offline</p>';
        return;
    }

    document.getElementById('server-name').textContent = escapeHtml(primaryServer.name);

    // Get latest player data from background script
    chrome.runtime.sendMessage({ action: 'getServerStatus', serverId: primaryServer.id }, (response) => {
        if (response && response.online && response.players) {
            document.getElementById('offline-status').style.display = 'none';
            document.getElementById('online-count').style.display = 'inline-block';
            document.getElementById('player-count').textContent = response.players.length;

            renderPlayersList(response.players);
        } else {
            document.getElementById('online-count').style.display = 'none';
            document.getElementById('offline-status').style.display = 'inline-block';
            document.getElementById('players-list').innerHTML = '<p class="text-gray-400 text-sm">Server is offline</p>';
        }
    });
}

function checkNow() {
    chrome.runtime.sendMessage({ action: 'checkNow' }, (response) => {
        console.log("Check now response:", response);
    });
}

function renderPlayersList(players) {
    const playersList = document.getElementById('players-list');
    
    if (players.length === 0) {
        playersList.innerHTML = '<p class="text-gray-400 text-sm">No players online</p>';
        return;
    }

    playersList.innerHTML = players.map(player => `
        <div class="player-item">
            <img 
                src="https://minotar.net/avatar/${player.uuid}" 
                alt="${escapeHtml(player.name)}" 
                class="player-avatar"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><rect fill=%22%23888%22 width=%2232%22 height=%2232%22/></svg>'"
            />
            <span class="player-name">${escapeHtml(player.name)}</span>
        </div>
    `).join('');
}

function loadData() {
    chrome.storage.sync.get({
        servers: [],
        friends: [],
        allFriends: false,
        primaryServer: null
    }, (data) => {
        currentData = data;
        refreshServerStatus();
        renderSettings();
    });
}

function saveData() {
    chrome.storage.sync.set({
        servers: currentData.servers,
        friends: currentData.friends,
        allFriends: currentData.allFriends,
        primaryServer: currentData.primaryServer
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
