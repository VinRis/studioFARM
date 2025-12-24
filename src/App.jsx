import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import WelcomeScreen from './components/WelcomeScreen'
import Dashboard from './components/Dashboard'
import History from './components/History'
import Finance from './components/Finance'
import Health from './components/Health'
import Reports from './components/Reports'
import Settings from './components/Settings'
import { AppProvider } from './context/AppContext'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/dashboard/:livestock" element={<Dashboard />} />
            <Route path="/history/:livestock" element={<History />} />
            <Route path="/finance/:livestock" element={<Finance />} />
            <Route path="/health/:livestock" element={<Health />} />
            <Route path="/reports/:livestock" element={<Reports />} />
            <Route path="/settings/:livestock" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  )
}

export default App
