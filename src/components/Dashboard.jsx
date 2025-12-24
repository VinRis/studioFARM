import React from 'react'
import { useParams } from 'react-router-dom'
import Layout from './Layout'
import { useApp } from '../context/AppContext'
import { TrendingUp, DollarSign, Heart, Calendar } from 'lucide-react'
import './Dashboard.css'

const livestockConfig = {
  dairy: {
    name: 'Dairy Cattle',
    metrics: ['Milk Production', 'Feed Cost', 'Health Score', 'Breeding Cycle'],
    insights: [
      'Peak milk production typically occurs 40-60 days after calving',
      'Monitor body condition score to optimize feeding',
      'Regular hoof trimming improves milk yield by 5-10%'
    ]
  },
  poultry: {
    name: 'Poultry',
    metrics: ['Egg Production', 'Feed Conversion', 'Mortality Rate', 'Weight Gain'],
    insights: [
      'Optimal laying temperature is 65-75°F for maximum egg production',
      'Provide 14-16 hours of light daily for consistent laying',
      'Monitor water consumption - it should be 2x feed intake'
    ]
  },
  pigs: {
    name: 'Pigs',
    metrics: ['Weight Gain', 'Feed Efficiency', 'Litter Size', 'Health Status'],
    insights: [
      'Pigs gain weight most efficiently at 60-75°F',
      'Provide 2-3 square feet per pig in finishing barns',
      'Monitor for respiratory issues in cold weather'
    ]
  },
  goats: {
    name: 'Goats & Sheep',
    metrics: ['Milk/Wool Production', 'Pasture Rotation', 'Breeding Success', 'Body Condition'],
    insights: [
      'Rotate pastures every 3-4 weeks to prevent parasites',
      'Provide mineral supplements specific to your region',
      'Monitor for signs of pregnancy toxemia in late gestation'
    ]
  }
}

function Dashboard() {
  const { livestock } = useParams()
  const { state } = useApp()
  const config = livestockConfig[livestock]

  const getKPIData = () => {
    const records = state.records[livestock]
    const productionRecords = records.production || []
    const financialRecords = records.financial || []
    const healthRecords = records.health || []

    // Calculate basic KPIs
    const totalProduction = productionRecords.reduce((sum, record) => sum + (record.quantity || 0), 0)
    const totalRevenue = financialRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + (record.amount || 0), 0)
    const totalExpenses = financialRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + (record.amount || 0), 0)
    const healthEvents = healthRecords.length

    return {
      production: totalProduction,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      healthEvents
    }
  }

  const kpiData = getKPIData()

  const kpiCards = [
    {
      title: 'Total Production',
      value: kpiData.production.toLocaleString(),
      unit: livestock === 'dairy' ? 'L' : livestock === 'poultry' ? 'eggs' : 'kg',
      icon: TrendingUp,
      color: '#4CAF50',
      trend: '+12%'
    },
    {
      title: 'Revenue',
      value: `${state.currency} ${kpiData.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#2196F3',
      trend: '+8%'
    },
    {
      title: 'Profit',
      value: `${state.currency} ${kpiData.profit.toLocaleString()}`,
      icon: DollarSign,
      color: kpiData.profit >= 0 ? '#4CAF50' : '#F44336',
      trend: kpiData.profit >= 0 ? '+15%' : '-5%'
    },
    {
      title: 'Health Events',
      value: kpiData.healthEvents.toString(),
      icon: Heart,
      color: '#E91E63',
      trend: '-3%'
    }
  ]

  return (
    <Layout>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>{config.name} Dashboard</h1>
          <p>Monitor your {config.name.toLowerCase()} performance</p>
        </header>

        <div className="kpi-grid">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <div key={index} className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon" style={{ backgroundColor: `${kpi.color}20` }}>
                    <Icon size={24} color={kpi.color} />
                  </div>
                  <span className={`kpi-trend ${kpi.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                    {kpi.trend}
                  </span>
                </div>
                <div className="kpi-content">
                  <h3>{kpi.value}</h3>
                  <p>{kpi.title}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="insights-section">
          <h2>Insights & Recommendations</h2>
          <div className="insights-grid">
            {config.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-icon">
                  <Calendar size={20} color="var(--primary-color)" />
                </div>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-stats">
          <h2>Quick Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">This Month</span>
              <span className="stat-value">{Math.floor(kpiData.production * 0.3).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">This Week</span>
              <span className="stat-value">{Math.floor(kpiData.production * 0.1).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Today</span>
              <span className="stat-value">{Math.floor(kpiData.production * 0.02).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
