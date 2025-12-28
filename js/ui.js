// UI Rendering and Components
class FarmUI {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }

    // Dashboard Rendering
    async renderDashboard(livestock) {
        const isDairy = livestock === 'dairy';
        
        return `
            <div class="dashboard-container">
                <div class="kpi-grid" id="kpi-grid">
                    <!-- KPI cards will be populated by JavaScript -->
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">${isDairy ? 'Milk' : 'Egg'} Production Trends</h3>
                        <div class="view-toggle">
                            <button class="toggle-btn active" data-period="monthly">Monthly</button>
                            <button class="toggle-btn" data-period="annual">Annual</button>
                        </div>
                    </div>
                    <canvas id="production-chart"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Financial Trends</h3>
                        <div class="view-toggle">
                            <button class="toggle-btn active" data-period="monthly">Monthly</button>
                            <button class="toggle-btn" data-period="annual">Annual</button>
                        </div>
                    </div>
                    <canvas id="finance-chart"></canvas>
                </div>
                
                <div class="insights-container">
                    <h3>Smart Insights</h3>
                    <div id="insights-list">
                        <!-- Insights will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        `;
    }

    updateKPICards(kpiData, livestock) {
        const isDairy = livestock === 'dairy';
        const kpiGrid = document.getElementById('kpi-grid');
        
        if (!kpiGrid) return;
        
        let kpiCards = '';
        
        if (isDairy) {
            kpiCards = `
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🥛</span>
                        <span class="kpi-title">Daily Milk Yield</span>
                    </div>
                    <div class="kpi-value">${kpiData.milkYield || '0'} L</div>
                    <div class="kpi-change positive">+2.5% from yesterday</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🐄</span>
                        <span class="kpi-title">Herd Size</span>
                    </div>
                    <div class="kpi-value">${kpiData.herdSize || '0'}</div>
                    <div class="kpi-subtitle">
                        <span>${kpiData.activeCows || '0'} lactating</span>
                        <span>${kpiData.sickCows || '0'} sick</span>
                        <span>${kpiData.dryCows || '0'} dry</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">💰</span>
                        <span class="kpi-title">Monthly Income</span>
                    </div>
                    <div class="kpi-value">KES ${parseFloat(kpiData.income || 0).toLocaleString()}</div>
                    <div class="kpi-change positive">+5.2% from last month</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">📊</span>
                        <span class="kpi-title">Monthly Profit</span>
                    </div>
                    <div class="kpi-value">KES ${parseFloat(kpiData.profit || 0).toLocaleString()}</div>
                    <div class="kpi-change ${kpiData.profit >= 0 ? 'positive' : 'negative'}">
                        ${kpiData.profit >= 0 ? '+' : ''}${(kpiData.profit / (kpiData.income || 1) * 100).toFixed(1)}% margin
                    </div>
                </div>
            `;
        } else {
            kpiCards = `
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🥚</span>
                        <span class="kpi-title">Daily Egg Production</span>
                    </div>
                    <div class="kpi-value">${kpiData.eggProduction || '0'}</div>
                    <div class="kpi-change positive">+3.1% from yesterday</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">🐔</span>
                        <span class="kpi-title">Flock Size</span>
                    </div>
                    <div class="kpi-value">${kpiData.flockSize || '0'}</div>
                    <div class="kpi-subtitle">
                        <span>Mortality: ${kpiData.mortalityRate || '0%'}</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">💰</span>
                        <span class="kpi-title">Monthly Income</span>
                    </div>
                    <div class="kpi-value">KES ${parseFloat(kpiData.income || 0).toLocaleString()}</div>
                    <div class="kpi-change positive">+4.8% from last month</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-icon">📊</span>
                        <span class="kpi-title">Monthly Profit</span>
                    </div>
                    <div class="kpi-value">KES ${parseFloat(kpiData.profit || 0).toLocaleString()}</div>
                    <div class="kpi-change ${kpiData.profit >= 0 ? 'positive' : 'negative'}">
                        ${kpiData.profit >= 0 ? '+' : ''}${(kpiData.profit / (kpiData.income || 1) * 100).toFixed(1)}% margin
                    </div>
                </div>
            `;
        }
        
        kpiGrid.innerHTML = kpiCards;
        
        // Add event listeners to toggle buttons
        document.querySelectorAll('.view-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toggleGroup = e.target.closest('.view-toggle');
                toggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Trigger chart update
                const period = e.target.dataset.period;
                const chartType = e.target.closest('.chart-container').querySelector('canvas').id;
                
                if (chartType === 'production-chart') {
                    window.app.loadDashboardData(); // Reload with new period
                } else if (chartType === 'finance-chart') {
                    window.app.loadDashboardData(); // Reload with new period
                }
            });
        });
    }

    renderInsights(insights) {
        const insightsList = document.getElementById('insights-list');
        if (!insightsList) return;
        
        let insightsHTML = '';
        
        insights.forEach(insight => {
            insightsHTML += `
                <div class="insight-item ${insight.type}">
                    <span class="insight-icon">${insight.icon}</span>
                    <span class="insight-text">${insight.text}</span>
                </div>
            `;
        });
        
        insightsList.innerHTML = insightsHTML;
    }

    // History Page
    async renderHistoryPage() {
        return `
            <div class="history-container">
                <div class="filter-controls">
                    <div class="search-box">
                        <input type="text" id="history-search" placeholder="Search records..." class="search-input">
                    </div>
                    <div class="date-filter">
                        <input type="date" id="history-start-date" class="date-input">
                        <span>to</span>
                        <input type="date" id="history-end-date" class="date-input">
                    </div>
                    <div class="filter-actions">
                        <button id="apply-filters" class="btn-secondary">Apply Filters</button>
                        <button id="export-csv" class="btn-primary">Export CSV</button>
                        <button id="clear-filters" class="btn-secondary">Clear</button>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table" id="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body">
                            <!-- Table rows will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <div class="table-summary">
                    <div class="summary-item">
                        <span>Total Records:</span>
                        <strong id="total-records">0</strong>
                    </div>
                    <div class="summary-item">
                        <span>Filtered:</span>
                        <strong id="filtered-records">0</strong>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistoryTable(records) {
        const tableBody = document.getElementById('history-table-body');
        if (!tableBody) return;
        
        let tableHTML = '';
        
        records.forEach(record => {
            const date = new Date(record.date).toLocaleDateString();
            const typeIcon = record.type === 'milk' ? '🥛' : 
                           record.type === 'eggs' ? '🥚' : 
                           record.type === 'health' ? '💊' : '📝';
            
            tableHTML += `
                <tr>
                    <td>${date}</td>
                    <td><span class="record-icon">${typeIcon}</span> ${record.type}</td>
                    <td>${record.description || 'No description'}</td>
                    <td>${record.quantity || '0'} ${record.unit || ''}</td>
                    <td>${record.notes || '-'}</td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${record.id}">✏️</button>
                        <button class="icon-btn delete-btn" data-id="${record.id}">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
        
        // Update summary
        document.getElementById('total-records').textContent = records.length;
        document.getElementById('filtered-records').textContent = records.length;
        
        // Add event listeners for edit/delete buttons
        tableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.editRecord(recordId);
            });
        });
        
        tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.deleteRecord(recordId, 'history');
            });
        });
    }

    // Finance Page
    async renderFinancePage() {
        return `
            <div class="finance-container">
                <div class="finance-summary">
                    <div class="summary-card income">
                        <div class="summary-header">
                            <span class="summary-icon">💰</span>
                            <h4>Total Income</h4>
                        </div>
                        <div class="summary-value" id="total-income">KES 0</div>
                    </div>
                    
                    <div class="summary-card expense">
                        <div class="summary-header">
                            <span class="summary-icon">💸</span>
                            <h4>Total Expenses</h4>
                        </div>
                        <div class="summary-value" id="total-expense">KES 0</div>
                    </div>
                    
                    <div class="summary-card profit">
                        <div class="summary-header">
                            <span class="summary-icon">📈</span>
                            <h4>Net Profit</h4>
                        </div>
                        <div class="summary-value" id="net-profit">KES 0</div>
                    </div>
                </div>
                
                <div class="filter-controls">
                    <div class="search-box">
                        <input type="text" id="finance-search" placeholder="Search transactions..." class="search-input">
                    </div>
                    <div class="date-filter">
                        <input type="month" id="finance-month" class="month-input">
                    </div>
                    <div class="type-filter">
                        <select id="finance-type" class="type-select">
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div class="filter-actions">
                        <button id="export-finance-csv" class="btn-primary">Export CSV</button>
                        <button id="add-transaction" class="btn-primary">+ Add Transaction</button>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table" id="finance-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="finance-table-body">
                            <!-- Table rows will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderFinanceTable(transactions) {
        const tableBody = document.getElementById('finance-table-body');
        if (!tableBody) return;
        
        let tableHTML = '';
        let totalIncome = 0;
        let totalExpense = 0;
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            const typeIcon = transaction.type === 'income' ? '💰' : '💸';
            const typeClass = transaction.type === 'income' ? 'income' : 'expense';
            
            if (transaction.type === 'income') {
                totalIncome += parseFloat(transaction.amount || 0);
            } else {
                totalExpense += parseFloat(transaction.amount || 0);
            }
            
            tableHTML += `
                <tr>
                    <td>${date}</td>
                    <td><span class="transaction-type ${typeClass}">${typeIcon} ${transaction.type}</span></td>
                    <td>${transaction.category || 'Uncategorized'}</td>
                    <td>${transaction.description || 'No description'}</td>
                    <td class="${typeClass}">KES ${parseFloat(transaction.amount || 0).toLocaleString()}</td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${transaction.id}">✏️</button>
                        <button class="icon-btn delete-btn" data-id="${transaction.id}">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
        
        // Update summary cards
        document.getElementById('total-income').textContent = `KES ${totalIncome.toLocaleString()}`;
        document.getElementById('total-expense').textContent = `KES ${totalExpense.toLocaleString()}`;
        document.getElementById('net-profit').textContent = `KES ${(totalIncome - totalExpense).toLocaleString()}`;
        
        // Add event listeners
        tableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.editTransaction(recordId);
            });
        });
        
        tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.deleteRecord(recordId, 'financial');
            });
        });
        
        // Add transaction button
        document.getElementById('add-transaction')?.addEventListener('click', () => {
            window.app.showFormModal('financial');
        });
    }

    // Health Page
    async renderHealthPage() {
        return `
            <div class="health-container">
                <div class="health-alerts">
                    <h3>Upcoming Health Events</h3>
                    <div id="upcoming-events">
                        <!-- Upcoming events will be populated by JavaScript -->
                    </div>
                </div>
                
                <div class="filter-controls">
                    <div class="search-box">
                        <input type="text" id="health-search" placeholder="Search health records..." class="search-input">
                    </div>
                    <div class="animal-filter">
                        <select id="health-animal" class="animal-select">
                            <option value="all">All Animals</option>
                            <option value="cow">Cows</option>
                            <option value="chicken">Chickens</option>
                        </select>
                    </div>
                    <div class="type-filter">
                        <select id="health-type" class="type-select">
                            <option value="all">All Types</option>
                            <option value="vaccination">Vaccination</option>
                            <option value="treatment">Treatment</option>
                            <option value="checkup">Checkup</option>
                            <option value="mortality">Mortality</option>
                        </select>
                    </div>
                    <div class="filter-actions">
                        <button id="export-health-csv" class="btn-primary">Export CSV</button>
                        <button id="add-health-record" class="btn-primary">+ Add Health Record</button>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table" id="health-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Animal</th>
                                <th>Type</th>
                                <th>Treatment</th>
                                <th>Vet</th>
                                <th>Cost</th>
                                <th>Next Due</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="health-table-body">
                            <!-- Table rows will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderHealthTable(records) {
        const tableBody = document.getElementById('health-table-body');
        const upcomingEvents = document.getElementById('upcoming-events');
        
        if (!tableBody || !upcomingEvents) return;
        
        let tableHTML = '';
        let upcomingHTML = '';
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        records.forEach(record => {
            const date = new Date(record.date);
            const nextDue = record.nextDue ? new Date(record.nextDue) : null;
            
            // Check if this is an upcoming event
            if (nextDue && nextDue >= today && nextDue <= nextMonth) {
                const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
                upcomingHTML += `
                    <div class="upcoming-event ${daysUntil <= 7 ? 'urgent' : ''}">
                        <div class="event-icon">💉</div>
                        <div class="event-details">
                            <strong>${record.animal || 'Animal'}</strong>
                            <small>${record.treatment || 'Vaccination'}</small>
                        </div>
                        <div class="event-date">Due in ${daysUntil} days</div>
                    </div>
                `;
            }
            
            tableHTML += `
                <tr>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${record.animal || '-'}</td>
                    <td><span class="health-type ${record.type}">${record.type}</span></td>
                    <td>${record.treatment || '-'}</td>
                    <td>${record.vet || '-'}</td>
                    <td>${record.cost ? `KES ${parseFloat(record.cost).toLocaleString()}` : '-'}</td>
                    <td>${nextDue ? nextDue.toLocaleDateString() : '-'}</td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${record.id}">✏️</button>
                        <button class="icon-btn delete-btn" data-id="${record.id}">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
        upcomingEvents.innerHTML = upcomingHTML || '<p class="no-events">No upcoming health events</p>';
        
        // Add event listeners
        tableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.editHealthRecord(recordId);
            });
        });
        
        tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.dataset.id;
                this.deleteRecord(recordId, 'health');
            });
        });
        
        // Add health record button
        document.getElementById('add-health-record')?.addEventListener('click', () => {
            window.app.showFormModal('health');
        });
    }

    // Reports Page
    async renderReportsPage() {
        return `
            <div class="reports-container">
                <div class="reports-header">
                    <h2>Generate Reports</h2>
                    <p>Create professional reports for your farm operations</p>
                </div>
                
                <div class="report-types">
                    <div class="report-card" data-report="production">
                        <div class="report-icon">📊</div>
                        <h3>Production Summary</h3>
                        <p>Detailed production report with trends and analysis</p>
                        <button class="generate-btn" data-report="production">Generate PDF</button>
                    </div>
                    
                    <div class="report-card" data-report="finance">
                        <div class="report-icon">💰</div>
                        <h3>Financial Summary</h3>
                        <p>Income, expenses, and profit analysis</p>
                        <button class="generate-btn" data-report="finance">Generate PDF</button>
                    </div>
                    
                    <div class="report-card" data-report="health">
                        <div class="report-icon">❤️</div>
                        <h3>Health Overview</h3>
                        <p>Animal health records and vaccination schedule</p>
                        <button class="generate-btn" data-report="health">Generate PDF</button>
                    </div>
                    
                    <div class="report-card" data-report="annual">
                        <div class="report-icon">📈</div>
                        <h3>Annual Report</h3>
                        <p>Comprehensive annual farm performance report</p>
                        <button class="generate-btn" data-report="annual">Generate PDF</button>
                    </div>
                </div>
                
                <div class="report-settings">
                    <h3>Report Settings</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="report-period">Period</label>
                            <select id="report-period" class="form-select">
                                <option value="last-month">Last Month</option>
                                <option value="last-quarter">Last Quarter</option>
                                <option value="last-year">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="custom-range-group" style="display: none;">
                            <label for="custom-range">Date Range</label>
                            <div class="date-range">
                                <input type="date" id="report-start-date" class="date-input">
                                <span>to</span>
                                <input type="date" id="report-end-date" class="date-input">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="report-format">Format</label>
                            <select id="report-format" class="form-select">
                                <option value="pdf">PDF Document</option>
                                <option value="csv">CSV Data</option>
                                <option value="print">Print Version</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="report-preview" id="report-preview" style="display: none;">
                    <h3>Report Preview</h3>
                    <div class="preview-container" id="preview-content">
                        <!-- Preview will be generated here -->
                    </div>
                    <div class="preview-actions">
                        <button id="download-report" class="btn-primary">Download Report</button>
                        <button id="print-report" class="btn-secondary">Print</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Settings Page
    async renderSettingsPage() {
        return `
            <div class="settings-container">
                <div class="settings-section">
                    <h3>Farm Information</h3>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="farm-name">Farm Name</label>
                            <input type="text" id="farm-name" placeholder="Enter farm name">
                        </div>
                        
                        <div class="form-group">
                            <label for="farm-manager">Farm Manager</label>
                            <input type="text" id="farm-manager" placeholder="Manager's name">
                        </div>
                        
                        <div class="form-group">
                            <label for="farm-location">Farm Location</label>
                            <input type="text" id="farm-location" placeholder="Farm address">
                        </div>
                        
                        <div class="form-group">
                            <label for="currency-select">Currency</label>
                            <select id="currency-select">
                                <option value="KES">Kenyan Shilling (KES)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="GBP">British Pound (GBP)</option>
                                <option value="UGX">Ugandan Shilling (UGX)</option>
                                <option value="TZS">Tanzanian Shilling (TZS)</option>
                            </select>
                        </div>
                        
                        <button id="save-settings" class="btn-primary">Save Settings</button>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Appearance</h3>
                    <div class="theme-settings">
                        <label class="theme-toggle-label">
                            <input type="checkbox" id="theme-switch">
                            <span class="theme-label">
                                <span class="theme-icon">🌙</span>
                                <span class="theme-text">Dark Mode</span>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="data-actions">
                        <button id="backup-settings" class="btn-secondary">Create Backup</button>
                        <button id="restore-settings" class="btn-secondary">Restore Backup</button>
                        <button id="clear-data" class="btn-danger">Clear All Data</button>
                    </div>
                    <div class="data-info">
                        <p><strong>Storage Used:</strong> <span id="storage-used">Calculating...</span></p>
                        <p><strong>Records Count:</strong> <span id="records-count">-</span></p>
                        <p><strong>Last Backup:</strong> <span id="last-backup">Never</span></p>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Account</h3>
                    <div class="account-info" id="account-info">
                        <!-- Account info will be populated by JavaScript -->
                    </div>
                    <div class="account-actions">
                        <button id="logout-settings" class="btn-secondary">Logout</button>
                        <button id="delete-account" class="btn-danger">Delete Account</button>
                    </div>
                </div>
                
                <div class="settings-footer">
                    <p class="app-info">Farm Management PWA v1.0.0</p>
                    <p class="copyright">© 2024 Farm Management. All rights reserved.</p>
                </div>
            </div>
        `;
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="notification-text">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Helper Methods
    async editRecord(recordId) {
        // Implementation for editing records
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    async deleteRecord(recordId, storeName) {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                await db.deleteRecord(storeName, recordId);
                this.showNotification('Record deleted successfully', 'success');
                
                // Refresh current page
                window.app.loadPageContent(window.app.currentPage);
            } catch (error) {
                this.showNotification('Error deleting record', 'error');
            }
        }
    }

    async editTransaction(transactionId) {
        // Implementation for editing transactions
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    async editHealthRecord(recordId) {
        // Implementation for editing health records
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    // Load settings data
    async loadSettingsData() {
        // Implementation for loading settings data
        const accountInfo = document.getElementById('account-info');
        if (accountInfo) {
            const user = auth.getCurrentUser();
            if (user) {
                accountInfo.innerHTML = `
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>User ID:</strong> ${user.uid.substring(0, 8)}...</p>
                    <p><strong>Status:</strong> <span class="status-connected">Connected</span></p>
                `;
            } else {
                accountInfo.innerHTML = `
                    <p><strong>Status:</strong> <span class="status-offline">Not Logged In</span></p>
                    <p><small>Login to enable cloud sync</small></p>
                `;
            }
        }
    }
}

// Create singleton instance
const ui = new FarmUI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui;
}
