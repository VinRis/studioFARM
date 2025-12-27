// Global state
let state = {
  livestock: null, // 'dairy' or 'poultry'
  farm: null,
  user: null,
  offline: !navigator.onLine
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const bottomNav = document.getElementById('bottom-nav');
const fab = document.getElementById('fab');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initFirebase();
  initEventListeners();
  loadWelcomeScreen();
});

// Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
}

// Firebase Configuration (replace with your config)
function initFirebase() {
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
}

// Event Listeners
function initEventListeners() {
  // Livestock selection cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      state.livestock = card.dataset.livestock;
      showDashboard();
    });
  });

  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const screenId = item.getAttribute('href').substring(1);
      showScreen(screenId);
    });
  });

  // FAB click
  fab.addEventListener('click', () => {
    showFormModal();
  });

  // Online/offline detection
  window.addEventListener('online', () => { state.offline = false; });
  window.addEventListener('offline', () => { state.offline = true; });
}

// Screen Navigation
function showScreen(screenId) {
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(`${screenId}-screen`).classList.add('active');
  updateNavActive(screenId);
}

function updateNavActive(screenId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${screenId}`) {
      item.classList.add('active');
    }
  });
}

// Welcome Screen
function loadWelcomeScreen() {
  showScreen('welcome');
  bottomNav.classList.add('hidden');
  fab.classList.add('hidden');
}

// Dashboard Screen
function showDashboard() {
  showScreen('dashboard');
  bottomNav.classList.remove('hidden');
  fab.classList.remove('hidden');
  renderDashboard();
}

// Render Dashboard Content
function renderDashboard() {
  const dashboardScreen = document.getElementById('dashboard-screen');
  dashboardScreen.innerHTML = `
    <header>
      <h1>${state.livestock === 'dairy' ? 'Dairy' : 'Poultry'} Dashboard</h1>
      <p>Welcome back! Here's your farm overview.</p>
    </header>
    <div class="kpi-cards">
      <div class="kpi-card">
        <h3>Production</h3>
        <p class="kpi-value" id="production-value">0</p>
        <p class="kpi-trend">+5% vs last month</p>
      </div>
      <div class="kpi-card">
        <h3>Income</h3>
        <p class="kpi-value" id="income-value">$0</p>
        <p class="kpi-trend">+12% vs last month</p>
      </div>
      <div class="kpi-card">
        <h3>Expenses</h3>
        <p class="kpi-value" id="expenses-value">$0</p>
        <p class="kpi-trend">-3% vs last month</p>
      </div>
      <div class="kpi-card">
        <h3>Profit</h3>
        <p class="kpi-value" id="profit-value">$0</p>
        <p class="kpi-trend">+20% vs last month</p>
      </div>
    </div>
    <div class="charts-container">
      <canvas id="production-chart"></canvas>
      <canvas id="finance-chart"></canvas>
    </div>
    <div class="insights">
      <h2>Smart Insights</h2>
      <ul id="insights-list"></ul>
    </div>
  `;

  // Load data and render charts
  loadDashboardData();
}

// Load data from IndexedDB
async function loadDashboardData() {
  // Placeholder: Fetch data from IndexedDB and update KPIs/charts
  console.log('Loading dashboard data for', state.livestock);
  // Example: updateKPI('production-value', '1,200 L');
  // renderCharts();
}

// Form Modal
function showFormModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Add New Record</h2>
        <button class="modal-close"><i class="fas fa-times"></i></button>
        <div class="form-options">
          <button class="form-option" data-form="production">
            <i class="fas fa-chart-line"></i>
            <span>Production Record</span>
          </button>
          <button class="form-option" data-form="financial">
            <i class="fas fa-money-bill-wave"></i>
            <span>Financial Transaction</span>
          </button>
          <button class="form-option" data-form="health">
            <i class="fas fa-heartbeat"></i>
            <span>Health Record</span>
          </button>
        </div>
      </div>
    </div>
  `;
  modalContainer.classList.remove('hidden');

  // Close modal
  modalContainer.querySelector('.modal-close').addEventListener('click', () => {
    modalContainer.classList.add('hidden');
  });

  // Form option selection
  modalContainer.querySelectorAll('.form-option').forEach(option => {
    option.addEventListener('click', () => {
      const formType = option.dataset.form;
      openForm(formType);
    });
  });
}

// Open specific form
function openForm(formType) {
  // Implement form rendering based on formType
  console.log('Opening form:', formType);
  // This would call functions from forms.js
}
