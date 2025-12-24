import React, { useState } from 'react'
import { X, Plus, DollarSign, Heart, TrendingUp } from 'lucide-react'
import ProductionForm from './forms/ProductionForm'
import FinancialForm from './forms/FinancialForm'
import HealthForm from './forms/HealthForm'

const recordTypes = [
  {
    id: 'production',
    title: 'Production Record',
    description: 'Track daily production metrics',
    icon: TrendingUp,
    color: '#4CAF50'
  },
  {
    id: 'financial',
    title: 'Financial Transaction',
    description: 'Record income and expenses',
    icon: DollarSign,
    color: '#FF9800'
  },
  {
    id: 'health',
    title: 'Health Record',
    description: 'Log health events and treatments',
    icon: Heart,
    color: '#E91E63'
  }
]

function AddRecordModal({ livestock, onClose }) {
  const [selectedType, setSelectedType] = useState(null)

  const renderForm = () => {
    switch (selectedType) {
      case 'production':
        return <ProductionForm livestock={livestock} onClose={onClose} />
      case 'financial':
        return <FinancialForm livestock={livestock} onClose={onClose} />
      case 'health':
        return <HealthForm livestock={livestock} onClose={onClose} />
      default:
        return null
    }
  }

  if (selectedType) {
    return renderForm()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Plus size={24} color="var(--primary-color)" />
            Add New Record
          </h2>
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

        <div style={{ display: 'grid', gap: '16px' }}>
          {recordTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  background: 'var(--surface-color)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = type.color
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-color)'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${type.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={type.color} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                    {type.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {type.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AddRecordModal
