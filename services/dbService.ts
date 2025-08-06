
import { Story } from '../types';

const DB_NAME = 'DreamAStoryDB';
const STORE_NAME = 'stories';
const DB_VERSION = 1;

let db: IDBDatabase;

// Initializes the IndexedDB database.
export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // If db is already initialized, resolve immediately.
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    // This event handles creation and updates of the DB schema.
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        // Create an object store for stories, using 'id' as the key.
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Saves or updates a story in the database.
export const saveStoryDB = (story: Story): Promise<Story> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject("DB is not initialized.");
    
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    transaction.onerror = () => reject(transaction.error);
    
    const request = store.put(story);
    request.onsuccess = () => resolve(story);
  });
};

// Retrieves all stories from the database, sorted by creation date.
export const getAllStoriesDB = (): Promise<Story[]> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB is not initialized.");

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            // Sort stories with the newest ones first.
            const sortedStories = request.result.sort((a, b) => b.createdAt - a.createdAt);
            resolve(sortedStories);
        };
    });
};

// Deletes a story from the database by its ID.
export const deleteStoryDB = (storyId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB is not initialized.");

        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(storyId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(storyId);
    });
};
