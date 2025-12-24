import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function HealthForm({ livestock, onClose }) {
  const { dispatch } = useApp()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'treatment',
    condition: '',
    treatment: '',
    veterinarian: '',
    cost: '',
    nextCheckup: '',
    notes: ''
  })

  const healthTypes = ['Treatment', 'Vaccination', 'Checkup', 'Surgery', 'Medication', 'Other']

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        livestock,
        type: 'health',
        data: {
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
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
          <h2 style={{ margin: 0 }}>Health Record</h2>
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
              {healthTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Condition/Issue
            </label>
            <input
              type="text"
              name="condition"
              className="input"
              value={formData.condition}
              onChange={handleChange}
              placeholder="Describe the condition"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Treatment/Action
            </label>
            <input
              type="text"
              name="treatment"
              className="input"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Treatment provided"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Veterinarian
            </label>
            <input
              type="text"
              name="veterinarian"
              className="input"
              value={formData.veterinarian}
              onChange={handleChange}
              placeholder="Veterinarian name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Cost
            </label>
            <input
              type="number"
              name="cost"
              className="input"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Treatment cost"
              step="0.01"
              min="0"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Next Checkup
            </label>
            <input
              type="date"
              name="nextCheckup"
              className="input"
              value={formData.nextCheckup}
              onChange={handleChange}
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HealthForm
