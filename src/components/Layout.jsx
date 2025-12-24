import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Home, History, DollarSign, Heart, FileText, Settings, Plus, X } from 'lucide-react'
import AddRecordModal from './AddRecordModal'
import './Layout.css'

const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
  { id: 'history', icon: History, label: 'History', path: '/history' },
  { id: 'finance', icon: DollarSign, label: 'Finance', path: '/finance' },
  { id: 'health', icon: Heart, label: 'Health', path: '/health' },
  { id: 'reports', icon: FileText, label: 'Reports', path: '/reports' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
]

function Layout({ children }) {
  const { livestock } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [showAddModal, setShowAddModal] = useState(false)

  const currentPath = location.pathname.split('/')[1]

  const handleNavigation = (path) => {
    navigate(`${path}/${livestock}`)
  }

  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav">
        <div className="nav-items">
          {navigationItems.slice(0, 2).map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.id
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}

          <button 
            className="fab"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={24} />
          </button>

          {navigationItems.slice(2).map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.id
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {showAddModal && (
        <AddRecordModal 
          livestock={livestock}
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  )
}

export default Layout
