// IndexedDB Database Manager
class FarmDB {
    constructor() {
        this.db = null;
        this.dbName = 'FarmDB';
        this.dbVersion = 3;
        this.stores = {
            farms: 'id',
            cows: 'id',
            poultry: 'id',
            production: 'id',
            financial: 'id',
            health: 'id',
            syncQueue: 'id',
            settings: 'key'
        };
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                for (const [storeName, keyPath] of Object.entries(this.stores)) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { 
                            keyPath,
                            autoIncrement: storeName !== 'settings'
                        });
                        
                        // Create indexes for common queries
                        switch(storeName) {
                            case 'production':
                            case 'financial':
                            case 'health':
                                store.createIndex('date', 'date', { unique: false });
                                store.createIndex('livestock', 'livestock', { unique: false });
                                store.createIndex('type', 'type', { unique: false });
                                break;
                            case 'cows':
                                store.createIndex('status', 'status', { unique: false });
                                store.createIndex('breed', 'breed', { unique: false });
                                break;
                            case 'syncQueue':
                                store.createIndex('synced', 'synced', { unique: false });
                                break;
                        }
                    }
                }
            };
        });
    }

    async addRecord(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateRecord(storeName, id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // First get the existing record
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                if (!existing) {
                    reject(new Error('Record not found'));
                    return;
                }
                
                // Merge with existing data
                const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
                
                const putRequest = store.put(updated);
                putRequest.onsuccess = () => resolve(putRequest.result);
                putRequest.onerror = (event) => reject(event.target.error);
            };
            
            getRequest.onerror = (event) => reject(event.target.error);
        });
    }

    async deleteRecord(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllRecords(storeName, filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                let records = request.result;
                
                // Apply filters
                if (filters.livestock) {
                    records = records.filter(r => r.livestock === filters.livestock);
                }
                
                if (filters.type) {
                    records = records.filter(r => r.type === filters.type);
                }
                
                if (filters.startDate && filters.endDate) {
                    records = records.filter(r => {
                        const date = new Date(r.date);
                        return date >= new Date(filters.startDate) && date <= new Date(filters.endDate);
                    });
                }
                
                // Sort by date descending
                records.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                resolve(records);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getRecord(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async addProductionRecord(data) {
        return this.addRecord('production', {
            ...data,
            createdAt: new Date().toISOString(),
            synced: false
        });
    }

    async addFinancialRecord(data) {
        return this.addRecord('financial', {
            ...data,
            createdAt: new Date().toISOString(),
            synced: false
        });
    }

    async addHealthRecord(data) {
        return this.addRecord('health', {
            ...data,
            createdAt: new Date().toISOString(),
            synced: false
        });
    }

    async addCow(data) {
        return this.addRecord('cows', {
            ...data,
            createdAt: new Date().toISOString(),
            status: data.status || 'active',
            synced: false
        });
    }

    async getKPIData(livestock) {
        // Get data for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const production = await this.getAllRecords('production', {
            livestock,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
        
        const financial = await this.getAllRecords('financial', {
            livestock,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
        
        const health = await this.getAllRecords('health', {
            livestock,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
        
        // Calculate KPIs
        let kpis = {};
        
        if (livestock === 'dairy') {
            // Dairy KPIs
            const milkProduction = production
                .filter(p => p.type === 'milk')
                .reduce((sum, p) => sum + (p.quantity || 0), 0);
            
            const cows = await this.getAllRecords('cows');
            const activeCows = cows.filter(c => c.status === 'active' || c.status === 'lactating');
            const sickCows = cows.filter(c => c.status === 'sick');
            const dryCows = cows.filter(c => c.status === 'dry');
            
            const income = financial
                .filter(f => f.type === 'income')
                .reduce((sum, f) => sum + (f.amount || 0), 0);
            
            const expenses = financial
                .filter(f => f.type === 'expense')
                .reduce((sum, f) => sum + (f.amount || 0), 0);
            
            kpis = {
                milkYield: milkProduction.toFixed(1),
                herdSize: cows.length,
                activeCows: activeCows.length,
                sickCows: sickCows.length,
                dryCows: dryCows.length,
                income: income.toFixed(2),
                expenses: expenses.toFixed(2),
                profit: (income - expenses).toFixed(2)
            };
            
        } else {
            // Poultry KPIs
            const eggProduction = production
                .filter(p => p.type === 'eggs')
                .reduce((sum, p) => sum + (p.quantity || 0), 0);
            
            const poultry = await this.getAllRecords('poultry');
            const activePoultry = poultry.filter(p => p.status === 'active');
            const mortality = health.filter(h => h.type === 'mortality').length;
            
            const income = financial
                .filter(f => f.type === 'income')
                .reduce((sum, f) => sum + (f.amount || 0), 0);
            
            const expenses = financial
                .filter(f => f.type === 'expense')
                .reduce((sum, f) => sum + (f.amount || 0), 0);
            
            const mortalityRate = poultry.length > 0 ? (mortality / poultry.length) : 0;
            
            kpis = {
                eggProduction: eggProduction,
                flockSize: poultry.length,
                mortalityRate: (mortalityRate * 100).toFixed(1) + '%',
                income: income.toFixed(2),
                expenses: expenses.toFixed(2),
                profit: (income - expenses).toFixed(2)
            };
        }
        
        return kpis;
    }

    async getProductionData(livestock, period = 'monthly') {
        const production = await this.getAllRecords('production', { livestock });
        
        // Group by period
        const grouped = {};
        const now = new Date();
        
        production.forEach(record => {
            const date = new Date(record.date);
            let key;
            
            if (period === 'monthly') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else {
                key = date.getFullYear().toString();
            }
            
            if (!grouped[key]) {
                grouped[key] = 0;
            }
            
            grouped[key] += record.quantity || 0;
        });
        
        // Convert to array and sort
        return Object.entries(grouped)
            .map(([period, total]) => ({ period, total }))
            .sort((a, b) => a.period.localeCompare(b.period))
            .slice(-12); // Last 12 periods
    }

    async getFinanceData(livestock, period = 'monthly') {
        const financial = await this.getAllRecords('financial', { livestock });
        
        // Group by period and type
        const grouped = {};
        
        financial.forEach(record => {
            const date = new Date(record.date);
            let key;
            
            if (period === 'monthly') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            } else {
                key = date.getFullYear().toString();
            }
            
            if (!grouped[key]) {
                grouped[key] = { income: 0, expense: 0 };
            }
            
            if (record.type === 'income') {
                grouped[key].income += record.amount || 0;
            } else {
                grouped[key].expense += record.amount || 0;
            }
        });
        
        // Convert to array
        return Object.entries(grouped)
            .map(([period, data]) => ({
                period,
                income: data.income,
                expense: data.expense,
                profit: data.income - data.expense
            }))
            .sort((a, b) => a.period.localeCompare(b.period))
            .slice(-12);
    }

    async getInsightData(livestock) {
        const production = await this.getAllRecords('production', { livestock });
        const financial = await this.getAllRecords('financial', { livestock });
        const health = await this.getAllRecords('health', { livestock });
        
        // Calculate current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthKey = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Group production by month
        const productionByMonth = {};
        production.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!productionByMonth[monthKey]) {
                productionByMonth[monthKey] = 0;
            }
            
            if (livestock === 'dairy' && record.type === 'milk') {
                productionByMonth[monthKey] += record.quantity || 0;
            } else if (livestock === 'poultry' && record.type === 'eggs') {
                productionByMonth[monthKey] += record.quantity || 0;
            }
        });
        
        // Group feed costs by month
        const feedCostByMonth = {};
        financial.forEach(record => {
            if (record.category === 'feed') {
                const date = new Date(record.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (!feedCostByMonth[monthKey]) {
                    feedCostByMonth[monthKey] = 0;
                }
                
                feedCostByMonth[monthKey] += record.amount || 0;
            }
        });
        
        // Get last vaccination date
        const vaccinations = health.filter(h => h.type === 'vaccination');
        const lastVaccination = vaccinations.length > 0 
            ? Math.max(...vaccinations.map(v => new Date(v.date)))
            : null;
        
        const daysSinceLastVaccination = lastVaccination 
            ? Math.floor((now - lastVaccination) / (1000 * 60 * 60 * 24))
            : 365; // Default to 1 year if no vaccination
        
        // Calculate mortality rate for poultry
        let mortalityRate = 0;
        if (livestock === 'poultry') {
            const poultry = await this.getAllRecords('poultry');
            const mortalityCount = health.filter(h => h.type === 'mortality').length;
            mortalityRate = poultry.length > 0 ? mortalityCount / poultry.length : 0;
        }
        
        // Calculate feed efficiency for poultry
        let feedEfficiency = 0;
        if (livestock === 'poultry') {
            const totalEggs = production
                .filter(p => p.type === 'eggs')
                .reduce((sum, p) => sum + (p.quantity || 0), 0);
            
            const totalFeedCost = financial
                .filter(f => f.category === 'feed')
                .reduce((sum, f) => sum + (f.amount || 0), 0);
            
            feedEfficiency = totalFeedCost > 0 ? totalEggs / totalFeedCost : 0;
        }
        
        return {
            currentMilkProduction: productionByMonth[currentMonth] || 0,
            previousMilkProduction: productionByMonth[lastMonthKey] || 0,
            currentFeedCost: feedCostByMonth[currentMonth] || 0,
            previousFeedCost: feedCostByMonth[lastMonthKey] || 0,
            daysSinceLastVaccination,
            currentEggProduction: productionByMonth[currentMonth] || 0,
            previousEggProduction: productionByMonth[lastMonthKey] || 0,
            mortalityRate,
            feedEfficiency,
            profitMargin: 0.25 // Simplified for demo
        };
    }

    async exportData() {
        const exportData = {};
        
        for (const storeName of Object.keys(this.stores)) {
            exportData[storeName] = await this.getAllRecords(storeName);
        }
        
        exportData.metadata = {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            recordCount: Object.values(exportData).reduce((sum, records) => sum + records.length, 0)
        };
        
        return exportData;
    }

    async importData(data) {
        // Clear existing data first
        const transaction = this.db.transaction(Object.keys(this.stores), 'readwrite');
        
        for (const storeName of Object.keys(this.stores)) {
            const store = transaction.objectStore(storeName);
            store.clear();
            
            if (data[storeName]) {
                data[storeName].forEach(record => {
                    store.add(record);
                });
            }
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = (event) => reject(event.target.error);
        });
    }

    async getUnsyncedRecords() {
        const unsynced = [];
        
        for (const storeName of ['production', 'financial', 'health', 'cows', 'poultry']) {
            const records = await this.getAllRecords(storeName);
            const unsyncedStore = records.filter(r => !r.synced);
            unsynced.push(...unsyncedStore.map(r => ({ ...r, _store: storeName })));
        }
        
        return unsynced;
    }

    async markAsSynced(storeName, id) {
        return this.updateRecord(storeName, id, { synced: true, syncedAt: new Date().toISOString() });
    }

    async getSettings(key) {
        const record = await this.getRecord('settings', key);
        return record ? record.value : null;
    }

    async setSettings(key, value) {
        return this.addRecord('settings', { key, value, updatedAt: new Date().toISOString() });
    }
}

// Create singleton instance
const db = new FarmDB();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
}
