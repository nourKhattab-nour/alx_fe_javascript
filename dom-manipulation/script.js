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
const categoryFilter = document.getElementById('categoryFilter');

// Storage keys
const STORAGE_KEY = 'quoteGenerator_quotes';
const SESSION_KEY = 'quoteGenerator_lastViewed';
const FILTER_KEY = 'quoteGenerator_lastFilter';

// Initialize the app
function init() {
  loadQuotes();
  populateCategories();
  restoreLastFilter();
  showFilteredQuotes();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  createFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJsonFile);
  importFile.addEventListener('change', importFromJsonFile);
  clearStorageBtn.addEventListener('click', clearStorage);
  categoryFilter.addEventListener('change', filterQuotes);
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

// Populate categories dropdown
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add new category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Restore last selected filter
function restoreLastFilter() {
  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  
  // Save the selected filter
  localStorage.setItem(FILTER_KEY, selectedCategory);
  
  showFilteredQuotes();
}

// Show quotes filtered by category
function showFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;
  
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available in this category.</p>';
    return;
  }
  
  // Display all filtered quotes
  quoteDisplay.innerHTML = filteredQuotes.map(quote => `
    <div class="quote-item">
      <blockquote>
        <p>"${quote.text}"</p>
        <footer>- ${quote.category}</footer>
      </blockquote>
    </div>
  `).join('');
}

// Display random quote from filtered selection
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;
  
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available in this category.</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
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
  
  // Update categories dropdown
  populateCategories();
  
  // If the new category matches the current filter, update the display
  if (categoryFilter.value === 'all' || categoryFilter.value === category) {
    showFilteredQuotes();
  }
  
  alert('Quote added successfully!');
}

// Export quotes to JSON file using Blob
function exportToJsonFile() {
  if (quotes.length === 0) {
    alert('No quotes to export');
    return;
  }
  
  try {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes-export.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    alert(`Error exporting quotes: ${error.message}`);
  }
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
      populateCategories();
      showFilteredQuotes();
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
    localStorage.removeItem(FILTER_KEY);
    populateCategories();
    showFilteredQuotes();
    alert('All quotes have been cleared.');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
