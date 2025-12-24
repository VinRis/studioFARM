import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { Search, Download, Calendar, Filter } from 'lucide-react'
import './History.css'

function History() {
  const { livestock } = useParams()
  const { state } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const records = state.records[livestock]
  const allRecords = [
    ...records.production.map(r => ({ ...r, recordType: 'production' })),
    ...records.financial.map(r => ({ ...r, recordType: 'financial' })),
    ...records.health.map(r => ({ ...r, recordType: 'health' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      Object.values(record).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesDate = !dateFilter || record.date.startsWith(dateFilter)
    const matchesType = typeFilter === 'all' || record.recordType === typeFilter

    return matchesSearch && matchesDate && matchesType
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Details', 'Amount/Quantity', 'Notes']
    const csvData = filteredRecords.map(record => [
      record.date,
      record.recordType,
      record.description || record.condition || record.unit || '',
      record.amount || record.quantity || '',
      record.notes || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${livestock}-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRecordIcon = (type) => {
    switch (type) {
      case 'production': return '📊'
      case 'financial': return '💰'
      case 'health': return '🏥'
      default: return '📝'
    }
  }

  const getRecordColor = (type) => {
    switch (type) {
      case 'production': return '#4CAF50'
      case 'financial': return '#FF9800'
      case 'health': return '#E91E63'
      default: return '#757575'
    }
  }

  return (
    <Layout>
      <div className="history">
        <header className="history-header">
          <h1>History</h1>
          <p>View and manage all your records</p>
        </header>

        <div className="history-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search records..."
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
                <option value="production">Production</option>
                <option value="financial">Financial</option>
                <option value="health">Health</option>
              </select>
            </div>

            <button onClick={exportToCSV} className="btn btn-outline">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="records-list">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <p>No records found matching your criteria</p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <div className="record-type" style={{ color: getRecordColor(record.recordType) }}>
                    <span className="record-icon">{getRecordIcon(record.recordType)}</span>
                    <span className="record-type-text">{record.recordType}</span>
                  </div>
                  <span className="record-date">{record.date}</span>
                </div>

                <div className="record-content">
                  {record.recordType === 'production' && (
                    <div className="record-details">
                      <h4>Production Record</h4>
                      <p><strong>Quantity:</strong> {record.quantity} {record.unit}</p>
                      {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                    </div>
                  )}

                  {record.recordType === 'financial' && (
                    <div className="record-details">
                      <h4>{record.type === 'income' ? 'Income' : 'Expense'}</h4>
                      <p><strong>Category:</strong> {record.category}</p>
                      <p><strong>Amount:</strong> {state.currency} {record.amount}</p>
                      <p><strong>Description:</strong> {record.description}</p>
                      {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                    </div>
                  )}

                  {record.recordType === 'health' && (
                    <div className="record-details">
                      <h4>Health Record</h4>
                      <p><strong>Type:</strong> {record.type}</p>
                      <p><strong>Condition:</strong> {record.condition}</p>
                      <p><strong>Treatment:</strong> {record.treatment}</p>
                      {record.veterinarian && <p><strong>Veterinarian:</strong> {record.veterinarian}</p>}
                      {record.cost > 0 && <p><strong>Cost:</strong> {state.currency} {record.cost}</p>}
                      {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

export default History
