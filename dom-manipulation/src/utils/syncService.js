// src/utils/syncService.js
import { fetchQuotesFromServer, postQuotesToServer } from '../api/quoteService';

const SYNC_INTERVAL = 30000; // Sync every 30 seconds

export class QuoteSync {
  constructor(localQuotes, setLocalQuotes, notifyConflict) {
    this.localQuotes = localQuotes;
    this.setLocalQuotes = setLocalQuotes;
    this.notifyConflict = notifyConflict;
    this.syncInterval = null;
  }

  startSyncing() {
    this.syncInterval = setInterval(() => this.syncWithServer(), SYNC_INTERVAL);
    this.syncWithServer(); // Initial sync
  }

  stopSyncing() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    this.mergeQuotes(serverQuotes);
  }

  mergeQuotes(serverQuotes) {
    // Simple conflict resolution: server version wins
    const mergedQuotes = [...this.localQuotes];
    let conflictsDetected = false;

    serverQuotes.forEach(serverQuote => {
      const localIndex = this.localQuotes.findIndex(q => q.id === serverQuote.id);
      
      if (localIndex >= 0) {
        // Quote exists in both local and server
        if (serverQuote.updatedAt > this.localQuotes[localIndex].updatedAt) {
          // Server has newer version
          mergedQuotes[localIndex] = serverQuote;
          conflictsDetected = true;
        }
      } else {
        // New quote from server
        mergedQuotes.push(serverQuote);
      }
    });

    if (conflictsDetected) {
      this.notifyConflict();
    }

    this.setLocalQuotes(mergedQuotes);
    return mergedQuotes;
  }

  async pushLocalChanges() {
    await postQuotesToServer(this.localQuotes);
  }
}