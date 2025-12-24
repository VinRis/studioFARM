import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  user: null,
  currency: 'USD',
  records: {
    dairy: { production: [], financial: [], health: [] },
    poultry: { production: [], financial: [], health: [] },
    pigs: { production: [], financial: [], health: [] },
    goats: { production: [], financial: [], health: [] }
  },
  notifications: []
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }
    case 'ADD_RECORD':
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.livestock]: {
            ...state.records[action.payload.livestock],
            [action.payload.type]: [
              ...state.records[action.payload.livestock][action.payload.type],
              { ...action.payload.data, id: Date.now() }
            ]
          }
        }
      }
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.livestock]: {
            ...state.records[action.payload.livestock],
            [action.payload.type]: state.records[action.payload.livestock][action.payload.type].map(
              record => record.id === action.payload.id ? { ...record, ...action.payload.data } : record
            )
          }
        }
      }
    case 'DELETE_RECORD':
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.livestock]: {
            ...state.records[action.payload.livestock],
            [action.payload.type]: state.records[action.payload.livestock][action.payload.type].filter(
              record => record.id !== action.payload.id
            )
          }
        }
      }
    case 'LOAD_DATA':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const savedData = localStorage.getItem('farmAppData')
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('farmAppData', JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
