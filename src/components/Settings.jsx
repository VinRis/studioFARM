import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { Settings as SettingsIcon, DollarSign, Moon, Sun, LogOut, User } from 'lucide-react'
import './Settings.css'

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
]

function Settings({ theme, toggleTheme }) {
  const { livestock } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [selectedCurrency, setSelectedCurrency] = useState(state.currency)

  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode)
    dispatch({ type: 'SET_CURRENCY', payload: currencyCode })
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch({ type: 'SET_USER', payload: null })
      navigate('/')
    }
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('farmAppData')
      window.location.reload()
    }
  }

  return (
    <Layout>
      <div className="settings">
        <header className="settings-header">
          <h1>
            <SettingsIcon size={32} />
            Settings
          </h1>
          <p>Customize your farm management experience</p>
        </header>

        <div className="settings-sections">
          {/* User Profile Section */}
          {state.user && (
            <div className="settings-section">
              <div className="section-header">
                <User size={20} />
                <h2>User Profile</h2>
              </div>
              <div className="section-content">
                <div className="user-info">
                  <div className="user-avatar">
                    {state.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h3>{state.user.name}</h3>
                    <p>{state.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Currency Settings */}
          <div className="settings-section">
            <div className="section-header">
              <DollarSign size={20} />
              <h2>Currency Settings</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Select your preferred currency for financial calculations and reports
              </p>
              <div className="currency-grid">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    className={`currency-option ${selectedCurrency === currency.code ? 'selected' : ''}`}
                    onClick={() => handleCurrencyChange(currency.code)}
                  >
                    <span className="currency-symbol">{currency.symbol}</span>
                    <div className="currency-info">
                      <span className="currency-code">{currency.code}</span>
                      <span className="currency-name">{currency.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="settings-section">
            <div className="section-header">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <h2>Appearance</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Choose between light and dark mode for better viewing comfort
              </p>
              <div className="theme-toggle">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme === 'dark' && toggleTheme()}
                >
                  <Sun size={24} />
                  <span>Light Mode</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme === 'light' && toggleTheme()}
                >
                  <Moon size={24} />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="settings-section">
            <div className="section-header">
              <SettingsIcon size={20} />
              <h2>Data Management</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Manage your application data and preferences
              </p>
              <div className="data-actions">
                <button className="btn btn-outline danger" onClick={clearAllData}>
                  Clear All Data
                </button>
                <p className="warning-text">
                  Warning: This will permanently delete all your records and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="settings-section">
            <div className="section-header">
              <LogOut size={20} />
              <h2>Account</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Account management and logout options
              </p>
              <button className="btn btn-outline" onClick={handleLogout}>
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="app-info">
          <h3>Farm Management App</h3>
          <p>Version 1.0.0</p>
          <p>© 2025 Farm Management Solutions</p>
        </div>
      </div>
    </Layout>
  )
}

export default Settings
