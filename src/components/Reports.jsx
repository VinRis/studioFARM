import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Heart } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import './Reports.css'

function Reports() {
  const { livestock } = useParams()
  const { state } = useApp()
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const records = state.records[livestock]
  const livestockName = livestock.charAt(0).toUpperCase() + livestock.slice(1)

  const generateProductionReport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(46, 125, 50)
    doc.text(`${livestockName} Production Report`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 45, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })

    // Production Summary
    const productionRecords = records.production.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )
    
    const totalProduction = productionRecords.reduce((sum, record) => sum + record.quantity, 0)
    const avgDaily = productionRecords.length > 0 ? totalProduction / productionRecords.length : 0

    doc.setFontSize(16)
    doc.setTextColor(46, 125, 50)
    doc.text('Production Summary', 20, 80)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Production: ${totalProduction.toLocaleString()} units`, 20, 95)
    doc.text(`Average Daily Production: ${avgDaily.toFixed(2)} units`, 20, 105)
    doc.text(`Number of Records: ${productionRecords.length}`, 20, 115)

    // Production Table
    if (productionRecords.length > 0) {
      const tableData = productionRecords.map(record => [
        record.date,
        record.quantity.toString(),
        record.unit,
        record.notes || '-'
      ])

      doc.autoTable({
        head: [['Date', 'Quantity', 'Unit', 'Notes']],
        body: tableData,
        startY: 130,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 10 }
      })
    }

    doc.save(`${livestock}-production-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const generateFinancialReport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(46, 125, 50)
    doc.text(`${livestockName} Financial Report`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 45, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })

    // Financial Summary
    const financialRecords = records.financial.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )
    
    const totalIncome = financialRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const totalExpenses = financialRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const profit = totalIncome - totalExpenses

    doc.setFontSize(16)
    doc.setTextColor(46, 125, 50)
    doc.text('Financial Summary', 20, 80)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Income: ${state.currency} ${totalIncome.toLocaleString()}`, 20, 95)
    doc.text(`Total Expenses: ${state.currency} ${totalExpenses.toLocaleString()}`, 20, 105)
    doc.text(`Net Profit: ${state.currency} ${profit.toLocaleString()}`, 20, 115)
    doc.text(`Profit Margin: ${totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0}%`, 20, 125)

    // Financial Table
    if (financialRecords.length > 0) {
      const tableData = financialRecords.map(record => [
        record.date,
        record.type,
        record.category,
        record.description,
        `${state.currency} ${record.amount.toLocaleString()}`
      ])

      doc.autoTable({
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: tableData,
        startY: 140,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 10 }
      })
    }

    doc.save(`${livestock}-financial-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const generateHealthReport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(46, 125, 50)
    doc.text(`${livestockName} Health Report`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 45, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })

    // Health Summary
    const healthRecords = records.health.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )
    
    const totalHealthCost = healthRecords.reduce((sum, record) => sum + (record.cost || 0), 0)
    const treatmentTypes = [...new Set(healthRecords.map(record => record.type))]

    doc.setFontSize(16)
    doc.setTextColor(46, 125, 50)
    doc.text('Health Summary', 20, 80)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Health Events: ${healthRecords.length}`, 20, 95)
    doc.text(`Total Health Costs: ${state.currency} ${totalHealthCost.toLocaleString()}`, 20, 105)
    doc.text(`Treatment Types: ${treatmentTypes.join(', ')}`, 20, 115)

    // Health Table
    if (healthRecords.length > 0) {
      const tableData = healthRecords.map(record => [
        record.date,
        record.type,
        record.condition,
        record.treatment,
        record.veterinarian || '-',
        `${state.currency} ${(record.cost || 0).toLocaleString()}`
      ])

      doc.autoTable({
        head: [['Date', 'Type', 'Condition', 'Treatment', 'Veterinarian', 'Cost']],
        body: tableData,
        startY: 130,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 9 }
      })
    }

    doc.save(`${livestock}-health-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const generateComprehensiveReport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    
    // Header
    doc.setFontSize(24)
    doc.setTextColor(46, 125, 50)
    doc.text(`${livestockName} Comprehensive Report`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, 45, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })

    // Executive Summary
    doc.setFontSize(18)
    doc.setTextColor(46, 125, 50)
    doc.text('Executive Summary', 20, 80)

    const productionRecords = records.production.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )
    const financialRecords = records.financial.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )
    const healthRecords = records.health.filter(record => 
      record.date >= dateRange.start && record.date <= dateRange.end
    )

    const totalProduction = productionRecords.reduce((sum, record) => sum + record.quantity, 0)
    const totalIncome = financialRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)
    const totalExpenses = financialRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)
    const profit = totalIncome - totalExpenses

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`• Total Production: ${totalProduction.toLocaleString()} units`, 25, 100)
    doc.text(`• Total Revenue: ${state.currency} ${totalIncome.toLocaleString()}`, 25, 110)
    doc.text(`• Total Expenses: ${state.currency} ${totalExpenses.toLocaleString()}`, 25, 120)
    doc.text(`• Net Profit: ${state.currency} ${profit.toLocaleString()}`, 25, 130)
    doc.text(`• Health Events: ${healthRecords.length}`, 25, 140)

    // Key Performance Indicators
    doc.setFontSize(16)
    doc.setTextColor(46, 125, 50)
    doc.text('Key Performance Indicators', 20, 165)

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    const avgDaily = productionRecords.length > 0 ? totalProduction / productionRecords.length : 0
    const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0
    const healthCostRatio = totalIncome > 0 ? ((healthRecords.reduce((sum, record) => sum + (record.cost || 0), 0) / totalIncome) * 100).toFixed(2) : 0

    doc.text(`• Average Daily Production: ${avgDaily.toFixed(2)} units`, 25, 180)
    doc.text(`• Profit Margin: ${profitMargin}%`, 25, 190)
    doc.text(`• Health Cost Ratio: ${healthCostRatio}%`, 25, 200)

    doc.save(`${livestock}-comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const reportTypes = [
    {
      id: 'production',
      title: 'Production Report',
      description: 'Detailed production metrics and trends',
      icon: TrendingUp,
      color: '#4CAF50',
      action: generateProductionReport
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Income, expenses, and profitability analysis',
      icon: DollarSign,
      color: '#FF9800',
      action: generateFinancialReport
    },
    {
      id: 'health',
      title: 'Health Report',
      description: 'Health events, treatments, and costs',
      icon: Heart,
      color: '#E91E63',
      action: generateHealthReport
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Report',
      description: 'Complete overview for investors and banks',
      icon: FileText,
      color: '#2196F3',
      action: generateComprehensiveReport
    }
  ]

  return (
    <Layout>
      <div className="reports">
        <header className="reports-header">
          <h1>Reports</h1>
          <p>Generate professional reports for your {livestock} operation</p>
        </header>

        <div className="date-range-selector">
          <h3>Report Period</h3>
          <div className="date-inputs">
            <div className="date-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="input"
              />
            </div>
            <div className="date-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="reports-grid">
          {reportTypes.map((report) => {
            const Icon = report.icon
            return (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div className="report-icon" style={{ backgroundColor: `${report.color}20` }}>
                    <Icon size={32} color={report.color} />
                  </div>
                  <h3>{report.title}</h3>
                </div>
                <p>{report.description}</p>
                <button
                  onClick={report.action}
                  className="btn btn-primary"
                  style={{ backgroundColor: report.color, width: '100%' }}
                >
                  <Download size={16} />
                  Generate PDF
                </button>
              </div>
            )
          })}
        </div>

        <div className="report-preview">
          <h3>Report Preview</h3>
          <div className="preview-stats">
            <div className="stat-card">
              <h4>Production Records</h4>
              <p>{records.production.filter(record => 
                record.date >= dateRange.start && record.date <= dateRange.end
              ).length} records</p>
            </div>
            <div className="stat-card">
              <h4>Financial Records</h4>
              <p>{records.financial.filter(record => 
                record.date >= dateRange.start && record.date <= dateRange.end
              ).length} transactions</p>
            </div>
            <div className="stat-card">
              <h4>Health Records</h4>
              <p>{records.health.filter(record => 
                record.date >= dateRange.start && record.date <= dateRange.end
              ).length} events</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Reports
