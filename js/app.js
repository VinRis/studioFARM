// Main Application Controller
class FarmManagementApp {
    constructor() {
        this.currentLivestock = null;
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    async init() {
        // Set theme
        this.setTheme(this.theme);
        
        // Initialize Firebase
        await this.initFirebase();
        
        // Initialize database
        await db.init();
        
        // Check authentication state
        this.checkAuthState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check online status
        this.updateOnlineStatus();
        
        // Initialize UI
        this.loadDefaultContent();
    }

    async initFirebase() {
        console.log('Initializing Firebase...');
        
        // Check if Firebase is available (scripts loaded)
        if (typeof firebase === 'undefined') {
            console.log('Firebase not available - running in offline mode');
            this.auth = null;
            this.firestore = null;
            return;
        }
        
        try {
            // Check if Firebase is already initialized
            if (firebase.apps.length > 0) {
                console.log('Firebase already initialized');
                this.auth = firebase.auth();
                this.firestore = firebase.firestore();
                return;
            }
            
            // Your Firebase config - UPDATE THIS WITH YOUR REAL CONFIG
            const firebaseConfig = {
                apiKey: "AIzaSyAva7tu7mWrdgJswDIR0W9OWv8ctZ5phPk",
                authDomain: "farmtrack-b470e.firebaseapp.com",
                projectId: "farmtrack-b470e",
                storageBucket: "farmtrack-b470e.firebasestorage.app",
                messagingSenderId: "572276398926",
                appId: "1:572276398926:web:4b39dc570ce2077fae5c1f"
            };
    
            // Check if this is a real config or dummy
            const hasRealConfig = firebaseConfig.apiKey && 
                                 firebaseConfig.apiKey !== "AIzaSyDummyKeyReplaceWithYours";
            
            if (hasRealConfig) {
                console.log('Initializing Firebase with real config');
                // Initialize Firebase
                firebase.initializeApp(firebaseConfig);
                this.auth = firebase.auth();
                this.firestore = firebase.firestore();
                
                // Enable Firestore offline persistence
                this.firestore.enablePersistence()
                    .catch((err) => {
                        console.warn('Firestore persistence error:', err);
                    });
            } else {
                console.log('Using dummy Firebase config - running in offline mode');
                this.auth = null;
                this.firestore = null;
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.auth = null;
            this.firestore = null;
            console.log('Running in offline mode due to error');
        }
    }

    setupEventListeners() {
        // Livestock selection
        document.querySelectorAll('.selection-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectLivestock(e.currentTarget.dataset.livestock);
            });
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // Welcome screen buttons
        document.getElementById('backup-btn').addEventListener('click', () => this.createBackup());
        document.getElementById('restore-btn').addEventListener('click', () => this.restoreBackup());
        document.getElementById('login-btn').addEventListener('click', () => this.showAuthModal());

        // FAB and modal
        document.getElementById('fab').addEventListener('click', () => this.showFabModal());
        document.querySelectorAll('.fab-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const formType = e.currentTarget.dataset.form;
                this.showFormModal(formType);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Auth form
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        document.getElementById('switch-auth').addEventListener('click', () => {
            this.switchAuthMode();
        });

        // Production form
        document.getElementById('production-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProductionRecord();
        });

        // Theme toggle
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                this.setTheme(e.target.checked ? 'dark' : 'light');
            });
        }

        // Online/offline events
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());

        // Sync button
        document.getElementById('sync-btn').addEventListener('click', () => this.syncData());
    }

    selectLivestock(livestock) {
        this.currentLivestock = livestock;
        
        // Show dairy-specific button
        const addHerdBtn = document.getElementById('add-herd-btn');
        addHerdBtn.style.display = livestock === 'dairy' ? 'flex' : 'none';
        
        // Switch to app screen
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        
        // Update page title
        document.getElementById('page-title').textContent = 
            livestock === 'dairy' ? 'Dairy Dashboard' : 'Poultry Dashboard';
        
        // Load dashboard
        this.loadDashboard();
        
        // Show welcome notification
        ui.showNotification(
            `Welcome to ${livestock === 'dairy' ? 'Dairy' : 'Poultry'} Management!`,
            'success'
        );
        
        // Save selection
        localStorage.setItem('selectedLivestock', livestock);
    }

    navigateTo(page) {
        this.currentPage = page;
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });
        
        // Update page title
        const titles = {
            dashboard: this.currentLivestock === 'dairy' ? 'Dairy Dashboard' : 'Poultry Dashboard',
            history: 'History Records',
            finance: 'Financial Records',
            health: 'Health Records',
            reports: 'Reports',
            settings: 'Settings'
        };
        document.getElementById('page-title').textContent = titles[page] || 'Farm Management';
        
        // Load page content
        this.loadPageContent(page);
    }

    async loadPageContent(page) {
        const contentArea = document.getElementById('content-area');
        
        switch(page) {
            case 'dashboard':
                contentArea.innerHTML = await ui.renderDashboard(this.currentLivestock);
                await this.loadDashboardData();
                break;
            case 'history':
                contentArea.innerHTML = await ui.renderHistoryPage();
                await this.loadHistoryData();
                break;
            case 'finance':
                contentArea.innerHTML = await ui.renderFinancePage();
                await this.loadFinanceData();
                break;
            case 'health':
                contentArea.innerHTML = await ui.renderHealthPage();
                await this.loadHealthData();
                break;
            case 'reports':
                contentArea.innerHTML = await ui.renderReportsPage();
                break;
            case 'settings':
                contentArea.innerHTML = await ui.renderSettingsPage();
                this.loadSettings();
                break;
        }
    }

    async loadDashboard() {
        this.navigateTo('dashboard');
    }

    async loadDashboardData() {
        try {
            // Load KPI data
            const kpiData = await db.getKPIData(this.currentLivestock);
            ui.updateKPICards(kpiData, this.currentLivestock);
            
            // Load chart data
            const productionData = await db.getProductionData(this.currentLivestock, 'monthly');
            charts.renderProductionChart(productionData, this.currentLivestock);
            
            const financeData = await db.getFinanceData(this.currentLivestock, 'monthly');
            charts.renderFinanceChart(financeData, this.currentLivestock);
            
            // Load insights
            const insights = await this.generateInsights();
            ui.renderInsights(insights);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            ui.showNotification('Error loading dashboard data', 'error');
        }
    }

    async generateInsights() {
        const insights = [];
        const data = await db.getInsightData(this.currentLivestock);
        
        if (this.currentLivestock === 'dairy') {
            // Rule 1: Milk production drop
            if (data.currentMilkProduction < data.previousMilkProduction * 0.9) {
                insights.push({
                    icon: '⚠️',
                    text: `Milk production dropped by ${Math.round((1 - data.currentMilkProduction/data.previousMilkProduction) * 100)}% this month`,
                    type: 'warning'
                });
            }
            
            // Rule 2: Feed cost increase
            if (data.currentFeedCost > data.previousFeedCost * 1.2) {
                insights.push({
                    icon: '💰',
                    text: `Feed costs increased by ${Math.round((data.currentFeedCost/data.previousFeedCost - 1) * 100)}%`,
                    type: 'info'
                });
            }
            
            // Rule 3: Vaccination due
            if (data.daysSinceLastVaccination > 180) {
                insights.push({
                    icon: '💉',
                    text: 'Herd vaccination is due (over 6 months since last)',
                    type: 'warning'
                });
            }
            
            // Rule 4: High profit margin
            if (data.profitMargin > 0.3) {
                insights.push({
                    icon: '📈',
                    text: `Excellent profit margin of ${Math.round(data.profitMargin * 100)}%`,
                    type: 'success'
                });
            }
            
        } else {
            // Poultry insights
            if (data.currentEggProduction < data.previousEggProduction * 0.85) {
                insights.push({
                    icon: '⚠️',
                    text: `Egg production dropped by ${Math.round((1 - data.currentEggProduction/data.previousEggProduction) * 100)}%`,
                    type: 'warning'
                });
            }
            
            if (data.mortalityRate > 0.05) {
                insights.push({
                    icon: '😔',
                    text: `High mortality rate detected: ${Math.round(data.mortalityRate * 100)}%`,
                    type: 'danger'
                });
            }
            
            if (data.feedEfficiency < 0.3) {
                insights.push({
                    icon: '🌾',
                    text: 'Low feed efficiency detected',
                    type: 'info'
                });
            }
        }
        
        // Add default insights if none
        if (insights.length === 0) {
            insights.push({
                icon: '✅',
                text: 'All operations are running smoothly',
                type: 'success'
            });
        }
        
        return insights;
    }

    async saveProductionRecord() {
        const form = document.getElementById('production-form');
        const formData = {
            date: document.getElementById('prod-date').value,
            type: document.getElementById('prod-type').value,
            quantity: parseFloat(document.getElementById('prod-quantity').value),
            unit: document.getElementById('prod-unit').value,
            notes: document.getElementById('prod-notes').value,
            livestock: this.currentLivestock,
            timestamp: new Date().toISOString()
        };

        try {
            // Save to IndexedDB
            await db.addProductionRecord(formData);
            
            // If logged in, add to sync queue
            if (this.currentUser) {
                await sync.addToSyncQueue('production', formData);
            }
            
            // Close modal
            this.closeModal(document.getElementById('production-modal'));
            
            // Reset form
            form.reset();
            
            // Show success
            ui.showNotification('Production record saved successfully!', 'success');
            
            // Refresh dashboard
            if (this.currentPage === 'dashboard') {
                await this.loadDashboardData();
            }
            
        } catch (error) {
            console.error('Error saving production record:', error);
            ui.showNotification('Error saving record', 'error');
        }
    }

    async createBackup() {
        try {
            const data = await db.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `farm-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            ui.showNotification('Backup created successfully!', 'success');
        } catch (error) {
            console.error('Error creating backup:', error);
            ui.showNotification('Error creating backup', 'error');
        }
    }

    async restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                await db.importData(data);
                ui.showNotification('Backup restored successfully!', 'success');
                
                // Refresh current page
                if (this.currentLivestock) {
                    await this.loadPageContent(this.currentPage);
                }
            } catch (error) {
                console.error('Error restoring backup:', error);
                ui.showNotification('Error restoring backup', 'error');
            }
        };
        
        input.click();
    }

    showAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
    }

    showFabModal() {
        document.getElementById('fab-modal').classList.add('active');
    }

    showFormModal(formType) {
        this.closeModal(document.getElementById('fab-modal'));
        
        switch(formType) {
            case 'production':
                document.getElementById('production-modal').classList.add('active');
                break;
            case 'financial':
                // Similar modals for financial and health forms
                break;
            case 'health':
                // Health form modal
                break;
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async handleAuthSubmit() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const isSignUp = document.getElementById('submit-auth').textContent === 'Sign Up';
        const authStatus = document.getElementById('auth-status');
        
        try {
            if (isSignUp) {
                await auth.signUp(email, password);
                authStatus.textContent = 'Account created successfully!';
                authStatus.className = 'auth-status success';
            } else {
                await auth.signIn(email, password);
                authStatus.textContent = 'Login successful!';
                authStatus.className = 'auth-status success';
                
                // Close modal after successful login
                setTimeout(() => {
                    this.closeModal(document.getElementById('auth-modal'));
                }, 1000);
            }
        } catch (error) {
            authStatus.textContent = error.message;
            authStatus.className = 'auth-status error';
        }
    }

    switchAuthMode() {
        const submitBtn = document.getElementById('submit-auth');
        const switchBtn = document.getElementById('switch-auth');
        
        if (submitBtn.textContent === 'Login') {
            submitBtn.textContent = 'Sign Up';
            switchBtn.textContent = 'Switch to Login';
        } else {
            submitBtn.textContent = 'Login';
            switchBtn.textContent = 'Switch to Sign Up';
        }
        
        document.getElementById('auth-status').textContent = '';
    }

    checkAuthState() {
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            const userBtn = document.getElementById('user-btn');
            
            if (user) {
                // User is signed in
                userBtn.innerHTML = '👤';
                userBtn.title = `Logged in as ${user.email}`;
                
                // Start syncing
                sync.startSync();
                
                // Update sync status
                document.getElementById('sync-status').style.backgroundColor = '#4CAF50';
            } else {
                // User is signed out
                userBtn.innerHTML = '👤';
                userBtn.title = 'Login';
                
                // Update sync status
                document.getElementById('sync-status').style.backgroundColor = '#FF9800';
            }
        });
    }

    updateOnlineStatus() {
        const offlineStatus = document.getElementById('offline-status');
        const syncDot = document.getElementById('sync-status');
        
        if (navigator.onLine) {
            if (offlineStatus) {
                offlineStatus.textContent = '✅ Online - Data will sync automatically';
                offlineStatus.style.color = '#4CAF50';
            }
            if (syncDot) {
                syncDot.style.backgroundColor = this.currentUser ? '#4CAF50' : '#FF9800';
            }
        } else {
            if (offlineStatus) {
                offlineStatus.textContent = '⚠️ Offline - Working locally';
                offlineStatus.style.color = '#FF9800';
            }
            if (syncDot) {
                syncDot.style.backgroundColor = '#F44336';
            }
        }
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme switch if exists
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = theme === 'dark';
        }
    }

    loadDefaultContent() {
        // Check if livestock was previously selected
        const savedLivestock = localStorage.getItem('selectedLivestock');
        if (savedLivestock) {
            this.selectLivestock(savedLivestock);
        }
    }

    async syncData() {
        if (!this.currentUser) {
            ui.showNotification('Please login to sync data', 'warning');
            return;
        }
        
        if (!navigator.onLine) {
            ui.showNotification('You are offline. Connect to sync.', 'warning');
            return;
        }
        
        try {
            ui.showNotification('Syncing data...', 'info');
            await sync.syncAll();
            ui.showNotification('Data synced successfully!', 'success');
        } catch (error) {
            console.error('Sync error:', error);
            ui.showNotification('Sync failed', 'error');
        }
    }

    async loadHistoryData() {
        // Implementation for loading history data
        const historyData = await db.getAllRecords('history');
        ui.renderHistoryTable(historyData);
    }

    async loadFinanceData() {
        // Implementation for loading finance data
        const financeData = await db.getAllRecords('financial');
        ui.renderFinanceTable(financeData);
    }

    async loadHealthData() {
        // Implementation for loading health data
        const healthData = await db.getAllRecords('health');
        ui.renderHealthTable(healthData);
    }

    loadSettings() {
        // Load saved settings
        const farmName = localStorage.getItem('farmName') || '';
        const farmManager = localStorage.getItem('farmManager') || '';
        const farmLocation = localStorage.getItem('farmLocation') || '';
        const currency = localStorage.getItem('currency') || 'KES';
        
        // Populate form fields
        const farmNameInput = document.getElementById('farm-name');
        if (farmNameInput) farmNameInput.value = farmName;
        
        const managerInput = document.getElementById('farm-manager');
        if (managerInput) managerInput.value = farmManager;
        
        const locationInput = document.getElementById('farm-location');
        if (locationInput) locationInput.value = farmLocation;
        
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) currencySelect.value = currency;
        
        // Set theme switch
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = this.theme === 'dark';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FarmManagementApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmManagementApp;
}
