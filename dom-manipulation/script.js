// Initial quotes data
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "wisdom" },
  { text: "The way to get started is to quit talking and begin doing.", category: "motivation" },
  { text: "Be the change that you wish to see in the world.", category: "inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize the app
function init() {
  // Display first quote
  showRandomQuote();
  
  // Set up category filter
  updateCategoryFilter();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  categorySelect.addEventListener('change', showRandomQuote);
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
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
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }
  
  quotes.push({ text, category });
  
  // Clear inputs
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Update UI
  updateCategoryFilter();
  showRandomQuote();
  
  alert('Quote added successfully!');
}

// Update category filter dropdown
function updateCategoryFilter() {
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Save current selection
  const currentSelection = categorySelect.value;
  
  // Clear and rebuild options
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (categories.includes(currentSelection)) {
    categorySelect.value = currentSelection;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);