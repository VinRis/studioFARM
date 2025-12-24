import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { Search, Download, Calendar, Filter, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import EditTransactionModal from './EditTransactionModal'
import './Finance.css'

function Finance() {
  const { livestock } = useParams()
  const { state, dispatch } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editingTransaction, setEditingTransaction] = useState(null)

  const transactions = state.records[livestock].financial || []
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      Object.values(transaction).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesDate = !dateFilter || transaction.date.startsWith(dateFilter)
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter

    return matchesSearch && matchesDate && matchesType
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const profit = totalIncome - totalExpenses

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes']
    const csvData = filteredTransactions.map(transaction => [
      transaction.date,
      transaction.type,
      transaction.category,
      transaction.description,
      transaction.amount,
      transaction.notes || ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${livestock}-finance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch({
        type: 'DELETE_RECORD',
        payload: {
          livestock,
          type: 'financial',
          id
        }
      })
    }
  }

  return (
    <Layout>
      <div className="finance">
        <header className="finance-header">
          <h1>Finance</h1>
          <p>Track your income and expenses</p>
        </header>

        <div className="finance-summary">
          <div className="summary-card income">
            <div className="summary-icon">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <h3>{state.currency} {totalIncome.toLocaleString()}</h3>
              <p>Total Income</p>
            </div>
          </div>

          <div className="summary-card expense">
            <div className="summary-icon">
              <TrendingDown size={24} />
            </div>
            <div className="summary-content">
              <h3>{state.currency} {totalExpenses.toLocaleString()}</h3>
              <p>Total Expenses</p>
            </div>
          </div>

          <div className={`summary-card profit ${profit >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon">
              {profit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className="summary-content">
              <h3>{state.currency} {profit.toLocaleString()}</h3>
              <p>Net Profit</p>
            </div>
          </div>
        </div>

        <div className="finance-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
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
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <button onClick={exportToCSV} className="btn btn-outline">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found matching your criteria</p>
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className={`transaction-card ${transaction.type}`}>
                <div className="transaction-header">
                  <div className="transaction-type">
                    <span className={`type-badge ${transaction.type}`}>
                      {transaction.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {transaction.type}
                    </span>
                    <span className="transaction-category">{transaction.category}</span>
                  </div>
                  <div className="transaction-actions">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="action-btn edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="action-btn delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="transaction-content">
                  <div className="transaction-details">
                    <h4>{transaction.description}</h4>
                    <p className="transaction-date">{transaction.date}</p>
                    {transaction.notes && <p className="transaction-notes">{transaction.notes}</p>}
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}{state.currency} {transaction.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          livestock={livestock}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </Layout>
  )
}

export default Finance
