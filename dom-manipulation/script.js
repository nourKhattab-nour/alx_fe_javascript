// Initial quotes data
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "wisdom" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const createFormBtn = document.getElementById('createFormBtn');
const formContainer = document.getElementById('formContainer');

// Initialize the app
function init() {
  showRandomQuote();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  createFormBtn.addEventListener('click', createAddQuoteForm);
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

// Create the add quote form dynamically
function createAddQuoteForm() {
  // Clear any existing form
  formContainer.innerHTML = '';
  
  // Create form elements
  const form = document.createElement('form');
  const textLabel = document.createElement('label');
  const textInput = document.createElement('input');
  const categoryLabel = document.createElement('label');
  const categoryInput = document.createElement('input');
  const submitBtn = document.createElement('button');
  const cancelBtn = document.createElement('button');
  
  // Set up text input
  textLabel.textContent = 'Quote Text:';
  textInput.type = 'text';
  textInput.id = 'quoteText';
  textInput.required = true;
  textInput.placeholder = 'Enter your quote here';
  
  // Set up category input
  categoryLabel.textContent = 'Category:';
  categoryInput.type = 'text';
  categoryInput.id = 'quoteCategory';
  categoryInput.required = true;
  categoryInput.placeholder = 'Enter category (e.g., inspiration)';
  
  // Set up buttons
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Add Quote';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  
  // Add classes for styling
  form.className = 'form-container';
  
  // Build form structure
  form.appendChild(textLabel);
  form.appendChild(textInput);
  form.appendChild(document.createElement('br'));
  form.appendChild(categoryLabel);
  form.appendChild(categoryInput);
  form.appendChild(document.createElement('br'));
  form.appendChild(submitBtn);
  form.appendChild(cancelBtn);
  
  // Add form to container
  formContainer.appendChild(form);
  
  // Focus on first input
  textInput.focus();
  
  // Form submission handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    addQuote();
  });
  
  // Cancel button handler
  cancelBtn.addEventListener('click', function() {
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

  // Add to quotes array
  quotes.push({ text, category });
  
  // Clear form
  formContainer.innerHTML = '';
  
  // Show the new quote
  showRandomQuote();
  
  // Notify user
  alert('Quote added successfully!');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
