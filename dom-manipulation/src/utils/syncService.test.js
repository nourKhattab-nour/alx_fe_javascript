// src/utils/syncService.test.js
import { QuoteSync } from './syncService';

describe('QuoteSync', () => {
  let mockSetQuotes, mockNotifyConflict, syncService;
  
  beforeEach(() => {
    mockSetQuotes = jest.fn();
    mockNotifyConflict = jest.fn();
    syncService = new QuoteSync([], mockSetQuotes, mockNotifyConflict);
  });

  test('should merge server quotes with local quotes', () => {
    const localQuotes = [
      { id: 1, text: 'Local quote', author: 'Me', updatedAt: '2023-01-01' }
    ];
    const serverQuotes = [
      { id: 1, text: 'Server quote', author: 'You', updatedAt: '2023-01-02' },
      { id: 2, text: 'New server quote', author: 'Someone', updatedAt: '2023-01-02' }
    ];
    
    syncService.localQuotes = localQuotes;
    syncService.mergeQuotes(serverQuotes);
    
    expect(mockSetQuotes).toHaveBeenCalledWith([
      { id: 1, text: 'Server quote', author: 'You', updatedAt: '2023-01-02' },
      { id: 2, text: 'New server quote', author: 'Someone', updatedAt: '2023-01-02' }
    ]);
    expect(mockNotifyConflict).toHaveBeenCalled();
  });

  test('should not notify conflict when no changes', () => {
    const localQuotes = [
      { id: 1, text: 'Same quote', author: 'Me', updatedAt: '2023-01-02' }
    ];
    const serverQuotes = [
      { id: 1, text: 'Same quote', author: 'Me', updatedAt: '2023-01-02' }
    ];
    
    syncService.localQuotes = localQuotes;
    syncService.mergeQuotes(serverQuotes);
    
    expect(mockNotifyConflict).not.toHaveBeenCalled();
  });
});