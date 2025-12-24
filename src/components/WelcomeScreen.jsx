import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, Download, Upload, LogIn } from 'lucide-react'
import LoginModal from './LoginModal'
import './WelcomeScreen.css'

const livestockOptions = [
  {
    id: 'dairy',
    name: 'Dairy Cattle',
    image: 'https://images.pexels.com/photos/35270800/pexels-photo-35270800.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    color: '#4CAF50',
    description: 'Manage your dairy cows and milk production'
  },
  {
    id: 'poultry',
    name: 'Poultry',
    image: 'https://images.pexels.com/photos/35299301/pexels-photo-35299301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    color: '#FF9800',
    description: 'Track chickens, eggs, and poultry health'
  },
  {
    id: 'pigs',
    name: 'Pigs',
    image: 'https://images.pexels.com/photos/66627/pexels-photo-66627.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    color: '#E91E63',
    description: 'Monitor pig farming and breeding'
  },
  {
    id: 'goats',
    name: 'Goats & Sheep',
    image: 'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    color: '#9C27B0',
    description: 'Manage goats, sheep, and wool production'
  }
]

function WelcomeScreen() {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  const handleLivestockSelect = (livestock) => {
    navigate(`/dashboard/${livestock}`)
  }

  const handleBackup = () => {
    const data = localStorage.getItem('farmAppData')
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `farm-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleRestore = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            localStorage.setItem('farmAppData', JSON.stringify(data))
            window.location.reload()
          } catch (error) {
            alert('Invalid backup file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-background"></div>
      <div className="welcome-content">
        <header className="welcome-header">
          <h1 className="welcome-title">Farm Management</h1>
          <p className="welcome-subtitle">Choose your livestock to get started</p>
        </header>

        <div className="livestock-grid">
          {livestockOptions.map((option) => (
            <div
              key={option.id}
              className="livestock-card"
              onClick={() => handleLivestockSelect(option.id)}
              style={{ '--accent-color': option.color }}
            >
              <div className="livestock-image">
                <img src={option.image} alt={option.name} />
                <div className="livestock-overlay"></div>
              </div>
              <div className="livestock-info">
                <h3>{option.name}</h3>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="welcome-actions">
          <div className="backup-actions">
            <button className="btn btn-outline" onClick={handleBackup}>
              <Download size={20} />
              Backup Data
            </button>
            <button className="btn btn-outline" onClick={handleRestore}>
              <Upload size={20} />
              Restore Data
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
            <LogIn size={20} />
            Cloud Sync
          </button>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default WelcomeScreen
