// Initial quotes data
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "wisdom" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showFormBtn = document.getElementById('showFormBtn');
const quoteForm = document.getElementById('quoteForm');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const quoteTextInput = document.getElementById('quoteText');
const quoteCategoryInput = document.getElementById('quoteCategory');

// Initialize the app
function init() {
  showRandomQuote();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showFormBtn.addEventListener('click', showAddQuoteForm);
  addQuoteBtn.addEventListener('click', addQuote);
  cancelFormBtn.addEventListener('click', hideAddQuoteForm);
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
}

// Show the add quote form
function showAddQuoteForm() {
  quoteForm.style.display = 'block';
  showFormBtn.style.display = 'none';
  quoteTextInput.focus();
}

// Hide the add quote form
function hideAddQuoteForm() {
  quoteForm.style.display = 'none';
  showFormBtn.style.display = 'inline-block';
  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
}

// Add new quote
function addQuote() {
  const text = quoteTextInput.value.trim();
  const category = quoteCategoryInput.value.trim();

  if (!text || !category) {
    alert('Please fill in both fields');
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });
  
  // Update UI
  hideAddQuoteForm();
  showRandomQuote();
  
  // Notify user
  alert('Quote added successfully!');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
