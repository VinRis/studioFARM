class FarmDB {
  constructor() {
    this.dbName = 'FarmDB';
    this.version = 1;
    this.db = null;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create object stores
        if (!db.objectStoreNames.contains('farms')) {
          db.createObjectStore('farms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cows')) {
          db.createObjectStore('cows', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('poultry')) {
          db.createObjectStore('poultry', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('production')) {
          db.createObjectStore('production', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('financial')) {
          db.createObjectStore('financial', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('health')) {
          db.createObjectStore('health', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async add(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ... more methods for update, delete, query
}

const farmDB = new FarmDB();
