// Firestore Sync Manager
class FarmSync {
    constructor() {
        this.isSyncing = false;
        this.lastSync = null;
        this.syncInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async init() {
        // Check if Firebase is available
        if (!window.firebase) {
            console.warn('Firebase not available, sync disabled');
            return false;
        }

        // Initialize Firestore
        this.firestore = firebase.firestore();
        
        // Enable offline persistence
        this.firestore.enablePersistence()
            .then(() => {
                console.log('Firestore offline persistence enabled');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.warn('The current browser doesn\'t support offline persistence.');
                }
            });

        return true;
    }

    async startSync() {
        // Start periodic syncing
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Sync immediately
        await this.syncAll();

        // Then sync every 5 minutes
        this.syncInterval = setInterval(() => {
            this.syncAll();
        }, 5 * 60 * 1000);
    }

    async stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async syncAll() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        if (!navigator.onLine) {
            console.log('Offline, skipping sync');
            return;
        }

        const user = auth.getCurrentUser();
        if (!user) {
            console.log('No user logged in, skipping sync');
            return;
        }

        this.isSyncing = true;
        
        try {
            // Update sync status UI
            this.updateSyncStatus('syncing');
            
            // Get unsynced records from IndexedDB
            const unsynced = await db.getUnsyncedRecords();
            
            if (unsynced.length === 0) {
                console.log('No unsynced records');
                this.lastSync = new Date();
                this.isSyncing = false;
                this.updateSyncStatus('synced');
                return;
            }

            console.log(`Syncing ${unsynced.length} records...`);

            // Sync each record
            const batch = this.firestore.batch();
            const userRef = this.firestore.collection('users').doc(user.uid);
            const syncPromises = [];

            for (const record of unsynced) {
                const recordId = record.id;
                const storeName = record._store;
                delete record._store; // Remove temporary property
                
                // Create document reference
                const docRef = userRef.collection(storeName).doc(recordId.toString());
                
                // Add to batch
                batch.set(docRef, {
                    ...record,
                    userId: user.uid,
                    lastSynced: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // Mark as synced in IndexedDB
                syncPromises.push(db.markAsSynced(storeName, recordId));
            }

            // Commit batch to Firestore
            await batch.commit();
            
            // Update IndexedDB records
            await Promise.all(syncPromises);
            
            // Pull latest data from Firestore
            await this.pullLatestData();
            
            this.lastSync = new Date();
            this.retryCount = 0;
            
            console.log('Sync completed successfully');
            this.updateSyncStatus('synced');
            
            // Show notification
            if (unsynced.length > 0) {
                ui.showNotification(`${unsynced.length} records synced to cloud`, 'success');
            }
            
        } catch (error) {
            console.error('Sync error:', error);
            this.retryCount++;
            
            if (this.retryCount <= this.maxRetries) {
                console.log(`Retrying sync (${this.retryCount}/${this.maxRetries})...`);
                setTimeout(() => this.syncAll(), 5000);
            } else {
                this.updateSyncStatus('error');
                ui.showNotification('Sync failed after multiple attempts', 'error');
            }
            
        } finally {
            this.isSyncing = false;
        }
    }

    async pullLatestData() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            // Get all collections
            const collections = ['production', 'financial', 'health', 'cows', 'poultry'];
            
            for (const collection of collections) {
                const querySnapshot = await this.firestore
                    .collection('users')
                    .doc(user.uid)
                    .collection(collection)
                    .orderBy('lastSynced', 'desc')
                    .limit(100)
                    .get();

                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    const id = doc.id;
                    
                    // Remove Firebase-specific fields
                    delete data.userId;
                    delete data.lastSynced;
                    
                    // Check if record exists in IndexedDB
                    const existing = await db.getRecord(collection, parseInt(id));
                    
                    if (!existing || new Date(data.updatedAt || data.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
                        // Update or add record
                        await db.updateRecord(collection, parseInt(id), {
                            ...data,
                            synced: true,
                            syncedAt: new Date().toISOString()
                        });
                    }
                }
            }
            
            console.log('Data pulled from cloud successfully');
            
        } catch (error) {
            console.error('Error pulling data:', error);
        }
    }

    async addToSyncQueue(storeName, data) {
        try {
            // Add to sync queue in IndexedDB
            await db.addRecord('syncQueue', {
                storeName,
                data,
                createdAt: new Date().toISOString(),
                attempts: 0,
                status: 'pending'
            });
            
            // Try to sync immediately if online
            if (navigator.onLine && auth.getCurrentUser()) {
                await this.syncAll();
            }
            
        } catch (error) {
            console.error('Error adding to sync queue:', error);
        }
    }

    updateSyncStatus(status) {
        const syncDot = document.getElementById('sync-status');
        if (!syncDot) return;
        
        switch(status) {
            case 'syncing':
                syncDot.style.backgroundColor = '#FF9800';
                syncDot.title = 'Syncing...';
                break;
            case 'synced':
                syncDot.style.backgroundColor = '#4CAF50';
                syncDot.title = `Last sync: ${this.lastSync ? this.lastSync.toLocaleTimeString() : 'Never'}`;
                break;
            case 'error':
                syncDot.style.backgroundColor = '#F44336';
                syncDot.title = 'Sync error';
                break;
            case 'offline':
                syncDot.style.backgroundColor = '#9E9E9E';
                syncDot.title = 'Offline';
                break;
        }
    }

    async syncSettings() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            // Get settings from IndexedDB
            const settings = {
                farmName: localStorage.getItem('farmName') || '',
                farmManager: localStorage.getItem('farmManager') || '',
                farmLocation: localStorage.getItem('farmLocation') || '',
                currency: localStorage.getItem('currency') || 'KES',
                theme: localStorage.getItem('theme') || 'light'
            };

            // Save to Firestore
            await this.firestore
                .collection('users')
                .doc(user.uid)
                .update({
                    settings,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log('Settings synced to cloud');
            
        } catch (error) {
            console.error('Error syncing settings:', error);
        }
    }

    async getCloudSettings() {
        const user = auth.getCurrentUser();
        if (!user) return null;

        try {
            const doc = await this.firestore
                .collection('users')
                .doc(user.uid)
                .get();

            if (doc.exists) {
                const data = doc.data();
                return data.settings || {};
            }
            
            return null;
            
        } catch (error) {
            console.error('Error getting cloud settings:', error);
            return null;
        }
    }

    async applyCloudSettings() {
        const settings = await this.getCloudSettings();
        if (!settings) return;

        // Apply settings to localStorage
        if (settings.farmName) localStorage.setItem('farmName', settings.farmName);
        if (settings.farmManager) localStorage.setItem('farmManager', settings.farmManager);
        if (settings.farmLocation) localStorage.setItem('farmLocation', settings.farmLocation);
        if (settings.currency) localStorage.setItem('currency', settings.currency);
        if (settings.theme) {
            localStorage.setItem('theme', settings.theme);
            document.documentElement.setAttribute('data-theme', settings.theme);
        }

        // Refresh UI if on settings page
        if (window.app?.currentPage === 'settings') {
            window.app.loadSettings();
        }
    }

    async clearCloudData() {
        const user = auth.getCurrentUser();
        if (!user) return;

        if (!confirm('This will delete all your data from the cloud. Are you sure?')) {
            return;
        }

        try {
            // Delete all user collections
            const collections = ['production', 'financial', 'health', 'cows', 'poultry'];
            
            for (const collection of collections) {
                const querySnapshot = await this.firestore
                    .collection('users')
                    .doc(user.uid)
                    .collection(collection)
                    .get();

                const batch = this.firestore.batch();
                querySnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                await batch.commit();
            }

            // Clear user document
            await this.firestore
                .collection('users')
                .doc(user.uid)
                .delete();

            ui.showNotification('Cloud data cleared successfully', 'success');
            
        } catch (error) {
            console.error('Error clearing cloud data:', error);
            ui.showNotification('Error clearing cloud data', 'error');
        }
    }

    async getSyncStats() {
        const user = auth.getCurrentUser();
        if (!user) {
            return { synced: 0, pending: 0, lastSync: null };
        }

        try {
            // Get count of synced records
            let syncedCount = 0;
            const collections = ['production', 'financial', 'health', 'cows', 'poultry'];
            
            for (const collection of collections) {
                const querySnapshot = await this.firestore
                    .collection('users')
                    .doc(user.uid)
                    .collection(collection)
                    .count()
                    .get();
                
                syncedCount += querySnapshot.data().count;
            }

            // Get pending syncs from IndexedDB
            const pending = await db.getAllRecords('syncQueue');
            const pendingCount = pending.filter(p => p.status === 'pending').length;

            return {
                synced: syncedCount,
                pending: pendingCount,
                lastSync: this.lastSync
            };
            
        } catch (error) {
            console.error('Error getting sync stats:', error);
            return { synced: 0, pending: 0, lastSync: null };
        }
    }

    // Manual sync trigger
    async manualSync() {
        if (this.isSyncing) {
            ui.showNotification('Sync already in progress', 'info');
            return;
        }

        if (!navigator.onLine) {
            ui.showNotification('You are offline. Connect to sync.', 'warning');
            return;
        }

        if (!auth.getCurrentUser()) {
            ui.showNotification('Please login to sync data', 'warning');
            return;
        }

        ui.showNotification('Starting manual sync...', 'info');
        await this.syncAll();
    }
}

// Create singleton instance
const sync = new FarmSync();

// Initialize when firebase is available
if (typeof firebase !== 'undefined' && firebase.firestore) {
    sync.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sync;
}
