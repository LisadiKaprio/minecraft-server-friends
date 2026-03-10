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
        dashboardTab.classList.add('tab-active');
        settingsTab.classList.remove('tab-active');
        refreshServerStatus();
    } else {
        dashboardContent.classList.add('hidden');
        settingsContent.classList.remove('hidden');
        settingsTab.classList.add('tab-active');
        dashboardTab.classList.remove('tab-active');
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
                        Click to reveal IP
                    </div>
                </div>
                <div class="server-buttons">
                    ${currentData.primaryServer === server.id 
                        ? '<button disabled class="btn-small btn-success">Primary</button>' 
                        : `<button class="btn-small btn-primary btn-set-primary" data-server-id="${server.id}">Set Primary</button>`
                    }
                    <button class="btn-small btn-danger btn-remove-server" data-server-id="${server.id}" title="Remove server from list">X</button>
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
                <button class="btn-small btn-danger btn-remove-friend" data-friend-name="${escapeHtml(friend)}"title="Remove friend from list">X</button>
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
    const container = document.getElementById('servers-status-container');

    if (currentData.servers.length === 0) {
        container.innerHTML = '<p class="message">No servers configured</p>';
        return;
    }

    container.innerHTML = '';

    for (const server of currentData.servers) {
        // Create server status element
        const serverStatusDiv = document.createElement('div');
        serverStatusDiv.className = 'server-status';
        serverStatusDiv.id = `server-status-${server.id}`;

        serverStatusDiv.innerHTML = `
            <div class="server-status-header">
                <h2 class="server-name">${escapeHtml(server.name)}</h2>
                <span class="online-count" style="display: none;">
                    <span class="player-count">0</span> Online
                </span>
                <span class="offline-status">
                    Offline
                </span>
            </div>
            <div class="players-list">
                <p class="message">Loading...</p>
            </div>
        `;

        container.appendChild(serverStatusDiv);

        // Get latest player data from background script
        chrome.runtime.sendMessage({ action: 'getServerStatus', serverId: server.id }, (response) => {
            updateServerStatusUI(server.id, response);
        });
    }
}

function updateServerStatusUI(serverId, serverStatus) {
    const statusElement = document.getElementById(`server-status-${serverId}`);
    if (!statusElement) return;

    const offlineStatus = statusElement.querySelector('.offline-status');
    const onlineCount = statusElement.querySelector('.online-count');
    const playerCount = statusElement.querySelector('.player-count');
    const playersList = statusElement.querySelector('.players-list');

    if (serverStatus && serverStatus.online && serverStatus.players) {
        offlineStatus.style.display = 'none';
        onlineCount.style.display = 'inline-block';
        playerCount.textContent = serverStatus.players.length;
        renderPlayersList(serverStatus.players, playersList);
    } else {
        onlineCount.style.display = 'none';
        offlineStatus.style.display = 'inline-block';
        playersList.innerHTML = '<p class="message">Server is offline</p>';
    }
}

function checkNow() {
    chrome.runtime.sendMessage({ action: 'checkNow' }, (response) => {
        console.log("Check now response:", response);
    });
}

function renderPlayersList(players, playersList) {
    if (players.length === 0) {
        playersList.innerHTML = '<p class="message">No players online</p>';
        return;
    }

    const maxVisiblePlayers = 5;
    const isExpanded = playersList.classList.contains('expanded');
    const playersToShow = isExpanded ? players : players.slice(0, maxVisiblePlayers);

    let html = playersToShow.map(player => `
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

    if (players.length > maxVisiblePlayers && !isExpanded) {
        html += `
            <button class="expand-players-btn">
                Show all ${players.length} players
            </button>
        `;
    }

    playersList.innerHTML = html;

    // Attach event listener to expand button
    const expandBtn = playersList.querySelector('.expand-players-btn');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            playersList.classList.add('expanded');
            renderPlayersList(players, playersList);
        });
    }
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
