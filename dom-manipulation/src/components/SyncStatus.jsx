// src/components/SyncStatus.jsx
import { useState, useEffect } from 'react';

export const SyncStatus = ({ lastSync, conflictDetected, onResolveConflict }) => {
  const [showConflictAlert, setShowConflictAlert] = useState(false);

  useEffect(() => {
    if (conflictDetected) {
      setShowConflictAlert(true);
      const timer = setTimeout(() => setShowConflictAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [conflictDetected]);

  return (
    <div className="sync-status">
      <p>Last synced: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}</p>
      
      {showConflictAlert && (
        <div className="conflict-alert">
          <p>Conflict detected! Server changes were applied.</p>
          <button onClick={onResolveConflict}>Review Changes</button>
        </div>
      )}
    </div>
  );
};