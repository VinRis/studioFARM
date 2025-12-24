import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function ProductionForm({ livestock, onClose }) {
  const { dispatch } = useApp()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: getDefaultUnit(livestock),
    notes: ''
  })

  function getDefaultUnit(livestock) {
    switch (livestock) {
      case 'dairy': return 'liters'
      case 'poultry': return 'eggs'
      case 'pigs': return 'kg'
      case 'goats': return 'liters'
      default: return 'units'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        livestock,
        type: 'production',
        data: {
          ...formData,
          quantity: parseFloat(formData.quantity),
          timestamp: new Date().toISOString()
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Production Record</h2>
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
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              className="input"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              step="0.1"
              min="0"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Unit
            </label>
            <select
              name="unit"
              className="input"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="liters">Liters</option>
              <option value="eggs">Eggs</option>
              <option value="kg">Kilograms</option>
              <option value="units">Units</option>
            </select>
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductionForm
