// Initial quotes data (will be loaded from storage)
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const createFormBtn = document.getElementById('createFormBtn');
const formContainer = document.getElementById('formContainer');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const lastViewedDisplay = document.getElementById('lastViewed');

// Storage keys
const STORAGE_KEY = 'quoteGenerator_quotes';
const SESSION_KEY = 'quoteGenerator_lastViewed';

// Initialize the app
function init() {
  loadQuotes();
  showRandomQuote();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  createFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJson);
  importFile.addEventListener('change', importFromJsonFile);
  clearStorageBtn.addEventListener('click', clearStorage);
}

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if none in storage
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "In the middle of difficulty lies opportunity.", category: "wisdom" }
    ];
    saveQuotes();
  }
  
  // Load last viewed from session storage
  const lastViewed = sessionStorage.getItem(SESSION_KEY);
  if (lastViewed) {
    lastViewedDisplay.textContent = `Last viewed: ${lastViewed}`;
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Display random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available. Please add some quotes.</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <blockquote>
      <p>"${quote.text}"</p>
      <footer>- ${quote.category}</footer>
    </blockquote>
  `;
  
  // Store last viewed in session storage
  const lastViewed = new Date().toLocaleString();
  sessionStorage.setItem(SESSION_KEY, lastViewed);
  lastViewedDisplay.textContent = `Last viewed: ${lastViewed}`;
}

// Create the add quote form dynamically
function createAddQuoteForm() {
  formContainer.innerHTML = '';
  
  const form = document.createElement('form');
  form.className = 'form-container';
  
  form.innerHTML = `
    <h3>Add New Quote</h3>
    <label for="quoteText">Quote Text:</label>
    <input type="text" id="quoteText" placeholder="Enter your quote here" required>
    <label for="quoteCategory">Category:</label>
    <input type="text" id="quoteCategory" placeholder="Enter category (e.g., inspiration)" required>
    <button type="submit">Add Quote</button>
    <button type="button" id="cancelFormBtn">Cancel</button>
  `;
  
  formContainer.appendChild(form);
  document.getElementById('quoteText').focus();
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    addQuote();
  });
  
  document.getElementById('cancelFormBtn').addEventListener('click', function() {
    formContainer.innerHTML = '';
  });
}

// Add new quote to the array
function addQuote() {
  const textInput = document.getElementById('quoteText');
  const categoryInput = document.getElementById('quoteCategory');
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please fill in both fields');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  formContainer.innerHTML = '';
  showRandomQuote();
  alert('Quote added successfully!');
}

// Export quotes to JSON file
function exportToJson() {
  if (quotes.length === 0) {
    alert('No quotes to export');
    return;
  }
  
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'quotes-export.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      quotes = importedQuotes;
      saveQuotes();
      showRandomQuote();
      alert(`Successfully imported ${importedQuotes.length} quotes!`);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
    }
  };
  fileReader.readAsText(file);
}

// Clear all quotes from storage
function clearStorage() {
  if (confirm('Are you sure you want to clear all quotes? This cannot be undone.')) {
    quotes = [];
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    showRandomQuote();
    alert('All quotes have been cleared.');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
