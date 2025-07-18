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

// DOM elements
const syncStatus = document.getElementById('syncStatus');
const conflictNotice = document.getElementById('conflictNotice');
const syncNowBtn = document.getElementById('syncNowBtn');

// Initialize the app
async function init() {
  loadQuotes();
  await checkForUpdates();
  
  // Set up periodic sync
  setInterval(checkForUpdates, SYNC_INTERVAL);
  
  // Event listeners
  syncNowBtn.addEventListener('click', checkForUpdates);
  // Previous event listeners remain
}

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  quotes = storedQuotes ? JSON.parse(storedQuotes) : getDefaultQuotes();
  
  // Load server version
  serverVersion = parseInt(localStorage.getItem(SERVER_VERSION_KEY)) || 0;
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Check for updates from server
async function checkForUpdates() {
  if (syncInProgress) return;
  
  syncInProgress = true;
  updateSyncStatus('Syncing with server...', 'syncing');
  
  try {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    const response = await fetch(`${API_URL}?_limit=5`); // Simulate getting updates
    
    if (!response.ok) throw new Error('Server error');
    
    const serverData = await response.json();
    const serverQuotes = transformServerData(serverData);
    const serverDataVersion = Date.now(); // Simulate server version
    
    await handleServerResponse(serverQuotes, serverDataVersion);
    updateSyncStatus('Sync successful', 'success');
  } catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus(`Sync failed: ${error.message}`, 'error');
  } finally {
    syncInProgress = false;
  }
}

// Transform mock API data to our quote format
function transformServerData(serverData) {
  return serverData.map(post => ({
    text: post.title,
    category: `server-${post.userId}`,
    source: 'server',
    id: post.id
  }));
}

// Handle server response and merge changes
async function handleServerResponse(serverQuotes, newServerVersion) {
  if (newServerVersion <= serverVersion) {
    return; // No new updates
  }
  
  const localQuotes = [...quotes];
  let conflicts = [];
  
  // Merge strategy: Server wins for conflicts
  const mergedQuotes = [...localQuotes];
  
  serverQuotes.forEach(serverQuote => {
    const existingIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
    
    if (existingIndex >= 0) {
      // Check if local version differs
      const localQuote = mergedQuotes[existingIndex];
      if (JSON.stringify(localQuote) !== JSON.stringify(serverQuote)) {
        conflicts.push({
          local: localQuote,
          server: serverQuote
        });
      }
      // Server wins
      mergedQuotes[existingIndex] = serverQuote;
    } else {
      // New quote from server
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
    showConflicts(conflicts);
  }
  
  // Refresh UI
  populateCategories();
  showFilteredQuotes();
}

// Show conflict resolution UI
function showConflicts(conflicts) {
  conflictNotice.innerHTML = `
    <h4>${conflicts.length} Conflict(s) Detected</h4>
    <p>Some quotes were updated on the server while you were editing.</p>
    <div class="conflict-actions">
      <button id="acceptServerBtn">Keep Server Version</button>
      <button id="viewChangesBtn">Review Changes</button>
    </div>
  `;
  conflictNotice.style.display = 'block';
  
  document.getElementById('acceptServerBtn').addEventListener('click', () => {
    // Already accepted server version in handleServerResponse
    conflictNotice.style.display = 'none';
  });
  
  document.getElementById('viewChangesBtn').addEventListener('click', () => {
    // In a real app, you'd show a detailed diff view
    alert(`Showing details for ${conflicts.length} conflicts. In a real app, this would open a detailed comparison view.`);
    conflictNotice.style.display = 'none';
  });
}

// Update sync status UI
function updateSyncStatus(message, type) {
  syncStatus.textContent = message;
  syncStatus.className = `sync-status ${type}`;
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      if (syncStatus.textContent === message) {
        syncStatus.textContent = '';
        syncStatus.className = 'sync-status';
      }
    }, 5000);
  }
}

// Add this to your addQuote function to set local modification flag
function addQuote() {
  const textInput = document.getElementById('quoteText');
  const categoryInput = document.getElementById('quoteCategory');
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please fill in both fields');
    return;
  }

  quotes.push({ 
    text, 
    category,
    lastModified: Date.now(),
    source: 'local'
  });
  saveQuotes();
  formContainer.innerHTML = '';
  
  populateCategories();
  showFilteredQuotes();
  alert('Quote added successfully!');
  
  // Trigger sync after local changes
  setTimeout(checkForUpdates, 2000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
