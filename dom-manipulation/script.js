// Configuration
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API
const SYNC_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'quoteGenerator_quotes';
const LAST_SYNC_KEY = 'quoteGenerator_lastSync';
const SERVER_VERSION_KEY = 'quoteGenerator_serverVersion';

// State variables
let quotes = [];
let syncInProgress = false;
let serverVersion = 0;
let syncInterval;

// DOM elements
const syncStatus = document.getElementById('syncStatus');
const conflictNotice = document.getElementById('conflictNotice');
const syncNowBtn = document.getElementById('syncNowBtn');

// Initialize the app
async function init() {
  loadQuotes();
  startSyncInterval();
  await syncQuotes(); // Initial sync
  
  // Event listeners
  syncNowBtn.addEventListener('click', () => syncQuotes(true));
  // Previous event listeners remain
}

// Start periodic syncing
function startSyncInterval() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => syncQuotes(), SYNC_INTERVAL);
}

// Main sync function
async function syncQuotes(manualSync = false) {
  if (syncInProgress) {
    if (manualSync) {
      updateSyncStatus('Sync already in progress', 'syncing');
    }
    return;
  }
  
  syncInProgress = true;
  updateSyncStatus('Syncing with server...', 'syncing');
  
  try {
    // Step 1: Push local changes to server
    const localChanges = quotes.filter(q => q.source === 'local');
    if (localChanges.length > 0) {
      await postQuotesToServer(localChanges);
    }
    
    // Step 2: Pull changes from server
    const serverData = await fetchQuotesFromServer();
    const serverQuotes = transformServerData(serverData);
    const serverDataVersion = Date.now();
    
    // Step 3: Handle server response and merge changes
    await handleServerResponse(serverQuotes, serverDataVersion);
    
    updateSyncStatus('Sync successful', 'success');
    if (manualSync) {
      showNotification('Quotes synchronized successfully!');
    }
  } catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus(`Sync failed: ${error.message}`, 'error');
    if (manualSync) {
      showNotification('Sync failed. Please try again.', 'error');
    }
  } finally {
    syncInProgress = false;
  }
}

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  quotes = storedQuotes ? JSON.parse(storedQuotes) : getDefaultQuotes();
  serverVersion = parseInt(localStorage.getItem(SERVER_VERSION_KEY)) || 0;
}

function getDefaultQuotes() {
  return [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "life" },
    { text: "In the middle of difficulty lies opportunity.", category: "wisdom" }
  ];
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(`${API_URL}?_limit=5`);
    if (!response.ok) throw new Error('Server error');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    throw error;
  }
}

// Post quotes to server
async function postQuotesToServer(quotesToSend) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotes: quotesToSend,
        lastSync: localStorage.getItem(LAST_SYNC_KEY),
        version: serverVersion
      })
    });
    
    if (!response.ok) throw new Error('Failed to save quotes');
    return await response.json();
  } catch (error) {
    console.error('Error posting quotes:', error);
    throw error;
  }
}

// Handle server response and merge changes
async function handleServerResponse(serverQuotes, newServerVersion) {
  if (newServerVersion <= serverVersion) {
    console.log('No new updates from server');
    return;
  }
  
  const localQuotes = [...quotes];
  let conflicts = [];
  const mergedQuotes = [...localQuotes];
  
  // Merge strategy with conflict detection
  serverQuotes.forEach(serverQuote => {
    const existingIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
    
    if (existingIndex >= 0) {
      const localQuote = mergedQuotes[existingIndex];
      if (!isSameQuote(localQuote, serverQuote)) {
        conflicts.push({
          local: localQuote,
          server: serverQuote,
          resolved: false
        });
      }
      mergedQuotes[existingIndex] = serverQuote;
    } else {
      mergedQuotes.push(serverQuote);
    }
  });
  
  // Update local data
  quotes = mergedQuotes;
  serverVersion = newServerVersion;
  saveQuotes();
  localStorage.setItem(SERVER_VERSION_KEY, serverVersion);
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  
  // Show conflicts if any
  if (conflicts.length > 0) {
    showConflictResolution(conflicts);
  }
  
  // Refresh UI
  populateCategories();
  showFilteredQuotes();
}

// Compare two quotes for changes
function isSameQuote(quote1, quote2) {
  return quote1.text === quote2.text && 
         quote1.category === quote2.category;
}

// Show conflict resolution UI
function showConflictResolution(conflicts) {
  conflictNotice.innerHTML = `
    <h4>${conflicts.length} Conflict(s) Detected</h4>
    <p>The following quotes were modified on both server and locally:</p>
    <div id="conflictsList"></div>
    <div class="conflict-actions">
      <button id="acceptAllServerBtn">Accept All Server Versions</button>
      <button id="reviewBtn">Review Conflicts</button>
    </div>
  `;
  
  const conflictsList = document.getElementById('conflictsList');
  conflicts.forEach((conflict, index) => {
    conflictsList.innerHTML += `
      <div class="conflict-item" data-index="${index}">
        <p><strong>Local:</strong> ${conflict.local.text} (${conflict.local.category})</p>
        <p><strong>Server:</strong> ${conflict.server.text} (${conflict.server.category})</p>
      </div>
    `;
  });
  
  conflictNotice.style.display = 'block';
  
  document.getElementById('acceptAllServerBtn').addEventListener('click', () => {
    // Server versions already applied in handleServerResponse
    conflictNotice.style.display = 'none';
    showNotification('All conflicts resolved using server versions');
  });
  
  document.getElementById('reviewBtn').addEventListener('click', () => {
    // In a real app, you would implement detailed conflict resolution
    showNotification('Opening detailed conflict resolution view...');
    conflictNotice.style.display = 'none';
  });
}

// Show notification to user
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Update sync status
function updateSyncStatus(message, type) {
  syncStatus.textContent = message;
  syncStatus.className = `sync-status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      if (syncStatus.textContent === message) {
        syncStatus.textContent = '';
        syncStatus.className = 'sync-status';
      }
    }, 5000);
  }
}

// Add quote function
function addQuote() {
  const textInput = document.getElementById('quoteText');
  const categoryInput = document.getElementById('quoteCategory');
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    showNotification('Please fill in both fields', 'error');
    return;
  }

  quotes.push({ 
    text, 
    category,
    lastModified: Date.now(),
    source: 'local',
    id: `local-${Date.now()}`
  });
  saveQuotes();
  formContainer.innerHTML = '';
  
  populateCategories();
  showFilteredQuotes();
  showNotification('Quote added successfully!');
  
  // Trigger sync after short delay
  setTimeout(() => syncQuotes(), 2000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
