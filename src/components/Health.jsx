import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { Search, Download, Calendar, Filter, Edit, Trash2, Bell, AlertTriangle } from 'lucide-react'
import EditHealthModal from './EditHealthModal'
import './Health.css'

function Health() {
  const { livestock } = useParams()
  const { state, dispatch } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editingRecord, setEditingRecord] = useState(null)

  const healthRecords = state.records[livestock].health || []
  
  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      Object.values(record).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesDate = !dateFilter || record.date.startsWith(dateFilter)
    const matchesType = typeFilter === 'all' || record.type === typeFilter

    return matchesSearch && matchesDate && matchesType
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  // Get upcoming health events
  const upcomingEvents = healthRecords
    .filter(record => record.nextCheckup && new Date(record.nextCheckup) > new Date())
    .sort((a, b) => new Date(a.nextCheckup) - new Date(b.nextCheckup))
    .slice(0, 5)

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Condition', 'Treatment', 'Veterinarian', 'Cost', 'Next Checkup', 'Notes']
    const csvData = filteredRecords.map(record => [
      record.date,
      record.type,
      record.condition,
      record.treatment,
      record.veterinarian || '',
      record.cost || '',
      record.nextCheckup || '',
      record.notes || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${livestock}-health-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      dispatch({
        type: 'DELETE_RECORD',
        payload: {
          livestock,
          type: 'health',
          id
        }
      })
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'treatment': return '#E91E63'
      case 'vaccination': return '#4CAF50'
      case 'checkup': return '#2196F3'
      case 'surgery': return '#FF5722'
      case 'medication': return '#9C27B0'
      default: return '#757575'
    }
  }

  const getDaysUntil = (date) => {
    const today = new Date()
    const targetDate = new Date(date)
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Layout>
      <div className="health">
        <header className="health-header">
          <h1>Health Management</h1>
          <p>Monitor and track animal health records</p>
        </header>

        {upcomingEvents.length > 0 && (
          <div className="upcoming-events">
            <h2>
              <Bell size={20} />
              Upcoming Health Events
            </h2>
            <div className="events-list">
              {upcomingEvents.map(event => {
                const daysUntil = getDaysUntil(event.nextCheckup)
                return (
                  <div key={event.id} className={`event-card ${daysUntil <= 7 ? 'urgent' : ''}`}>
                    <div className="event-icon">
                      {daysUntil <= 7 ? <AlertTriangle size={20} /> : <Calendar size={20} />}
                    </div>
                    <div className="event-details">
                      <h4>{event.condition} - Follow-up</h4>
                      <p>{event.nextCheckup} ({daysUntil} days)</p>
                    </div>
                    <div className={`event-badge ${daysUntil <= 7 ? 'urgent' : 'normal'}`}>
                      {daysUntil <= 7 ? 'Urgent' : 'Scheduled'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="health-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search health records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <Calendar size={16} />
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <Filter size={16} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-input"
              >
                <option value="all">All Types</option>
                <option value="treatment">Treatment</option>
                <option value="vaccination">Vaccination</option>
                <option value="checkup">Checkup</option>
                <option value="surgery">Surgery</option>
                <option value="medication">Medication</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button onClick={exportToCSV} className="btn btn-outline">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="health-records-list">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <p>No health records found matching your criteria</p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div key={record.id} className="health-record-card">
                <div className="record-header">
                  <div className="record-type">
                    <span 
                      className="type-indicator"
                      style={{ backgroundColor: getTypeColor(record.type) }}
                    ></span>
                    <span className="type-text">{record.type}</span>
                    <span className="record-date">{record.date}</span>
                  </div>
                  <div className="record-actions">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="action-btn edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="action-btn delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="record-content">
                  <div className="record-main">
                    <h4>{record.condition}</h4>
                    <p><strong>Treatment:</strong> {record.treatment}</p>
                    {record.veterinarian && <p><strong>Veterinarian:</strong> {record.veterinarian}</p>}
                    {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                  </div>
                  
                  <div className="record-meta">
                    {record.cost > 0 && (
                      <div className="cost-info">
                        <span className="cost-label">Cost:</span>
                        <span className="cost-value">{state.currency} {record.cost}</span>
                      </div>
                    )}
                    {record.nextCheckup && (
                      <div className="checkup-info">
                        <span className="checkup-label">Next Checkup:</span>
                        <span className="checkup-date">{record.nextCheckup}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingRecord && (
        <EditHealthModal
          record={editingRecord}
          livestock={livestock}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </Layout>
  )
}

export default Health
