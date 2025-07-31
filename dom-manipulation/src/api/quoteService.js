// src/api/quoteService.js
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using posts as our quote endpoint

export const fetchQuotesFromServer = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    // Transform the posts data into our quote format
    return data.map(post => ({
      id: post.id,
      text: post.title,
      author: `User ${post.userId}`,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    return [];
  }
};

export const postQuotesToServer = async (quotes) => {
  try {
    // In a real app, we would send only the changed quotes
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(quotes),
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to post quotes:", error);
    return null;
  }
};