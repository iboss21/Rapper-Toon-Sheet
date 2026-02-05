import { HistoryItem } from '@rapper-toon-sheet/shared';

const STORAGE_KEY = 'rapper-toon-history';

export function saveToLocalStorage(item: HistoryItem): void {
  try {
    const history = getLocalHistory();
    history.unshift(item);
    
    // Keep only last 50 items
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
}

export function getLocalHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read from local storage:', error);
    return [];
  }
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear local storage:', error);
  }
}

export function deleteFromLocalHistory(id: string): void {
  try {
    const history = getLocalHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete from local storage:', error);
  }
}
