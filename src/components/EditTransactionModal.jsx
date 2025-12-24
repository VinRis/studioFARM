import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'

function EditTransactionModal({ transaction, livestock, onClose }) {
  const { dispatch, state } = useApp()
  const [formData, setFormData] = useState({
    date: transaction.date,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount.toString(),
    description: transaction.description,
    notes: transaction.notes || ''
  })

  const incomeCategories = ['Sales', 'Subsidies', 'Insurance', 'Other Income']
  const expenseCategories = ['Feed', 'Veterinary', 'Equipment', 'Labor', 'Utilities', 'Other Expenses']

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'UPDATE_RECORD',
      payload: {
        livestock,
        type: 'financial',
        id: transaction.id,
        data: {
          ...formData,
          amount: parseFloat(formData.amount)
        }
      }
    })
    onClose()
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Edit Transaction</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Date
            </label>
            <input
              type="date"
              name="date"
              className="input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Type
            </label>
            <select
              name="type"
              className="input"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Category
            </label>
            <select
              name="category"
              className="input"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Amount ({state.currency})
            </label>
            <input
              type="number"
              name="amount"
              className="input"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Description
            </label>
            <input
              type="text"
              name="description"
              className="input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Notes
            </label>
            <textarea
              name="notes"
              className="input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={16} />
              Update Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTransactionModal
