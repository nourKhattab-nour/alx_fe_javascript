// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import { QuoteSync } from './utils/syncService';
import { SyncStatus } from './components/SyncStatus';
import QuoteList from './components/QuoteList';

function App() {
  const [quotes, setQuotes] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [syncService, setSyncService] = useState(null);

  // Initialize sync service
  useEffect(() => {
    const service = new QuoteSync(
      quotes,
      setQuotes,
      () => setConflictDetected(true)
    );
    setSyncService(service);
    service.startSyncing();

    return () => {
      service.stopSyncing();
    };
  }, []);

  // Update last sync time when quotes change from server
  useEffect(() => {
    if (lastSync) {
      setLastSync(new Date());
    }
  }, [quotes]);

  const handleAddQuote = useCallback((newQuote) => {
    setQuotes(prev => [...prev, {
      ...newQuote,
      id: Date.now(), // Temporary ID until synced
      updatedAt: new Date().toISOString()
    }]);
    
    // Push changes to server
    setTimeout(() => syncService?.pushLocalChanges(), 1000);
  }, [syncService]);

  const handleResolveConflict = () => {
    setConflictDetected(false);
    // In a real app, you might show a diff view here
    alert('Review the updated quotes list. Server changes have been applied.');
  };

  return (
    <div className="app">
      <h1>Dynamic Quote Generator</h1>
      <SyncStatus 
        lastSync={lastSync} 
        conflictDetected={conflictDetected}
        onResolveConflict={handleResolveConflict}
      />
      <QuoteList 
        quotes={quotes} 
        onAddQuote={handleAddQuote}
        onEditQuote={(id, updates) => {
          setQuotes(prev => prev.map(q => 
            q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
          ));
          setTimeout(() => syncService?.pushLocalChanges(), 1000);
        }}
      />
    </div>
  );
}

export default App;