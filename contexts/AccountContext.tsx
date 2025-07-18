"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { TradingAccount } from '@/lib/types'
import { getAccounts } from '@/services/api'
import { mapApiAccountsToTradingAccounts } from '@/lib/mappers'
import { handleAccountError } from '@/lib/error-utils'
import { storage } from '@/lib/storage'

interface AccountState {
  accounts: TradingAccount[]
  selectedAccountId: string | null
  loading: boolean
  error: string | null
}

type AccountAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACCOUNTS'; payload: TradingAccount[] }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ACCOUNT'; payload: TradingAccount }
  | { type: 'UPDATE_ACCOUNT'; payload: TradingAccount }
  | { type: 'DELETE_ACCOUNT'; payload: string }

const initialState: AccountState = {
  accounts: [],
  selectedAccountId: null,
  loading: true,
  error: null
}

const accountReducer = (state: AccountState, action: AccountAction): AccountState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload, loading: false, error: null }
    case 'SET_SELECTED_ACCOUNT':
      return { ...state, selectedAccountId: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] }
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        )
      }
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        selectedAccountId: state.selectedAccountId === action.payload ? null : state.selectedAccountId
      }
    default:
      return state
  }
}

interface AccountContextValue extends AccountState {
  selectAccount: (accountId: string | null) => void
  refreshAccounts: () => Promise<void>
  addAccount: (account: TradingAccount) => void
  updateAccount: (account: TradingAccount) => void
  deleteAccount: (accountId: string) => void
  getSelectedAccount: () => TradingAccount | null
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}

interface AccountProviderProps {
  children: ReactNode
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState)

  const selectAccount = (accountId: string | null) => {
    dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: accountId })
  }

  const refreshAccounts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const fetchedAccounts = await getAccounts()
      const mappedAccounts = mapApiAccountsToTradingAccounts(fetchedAccounts)
      dispatch({ type: 'SET_ACCOUNTS', payload: mappedAccounts })
      
      // Auto-select first account if none selected
      if (!state.selectedAccountId && mappedAccounts.length > 0) {
        dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: mappedAccounts[0].id })
      }
    } catch (error) {
      handleAccountError(error, 'fetch accounts', () => {
        const fallbackAccounts = storage.getAccounts()
        dispatch({ type: 'SET_ACCOUNTS', payload: fallbackAccounts })
        
        if (!state.selectedAccountId && fallbackAccounts.length > 0) {
          dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: fallbackAccounts[0].id })
        }
      })
    }
  }

  const addAccount = (account: TradingAccount) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: account })
  }

  const updateAccount = (account: TradingAccount) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account })
  }

  const deleteAccount = (accountId: string) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: accountId })
  }

  const getSelectedAccount = (): TradingAccount | null => {
    return state.accounts.find(account => account.id === state.selectedAccountId) || null
  }

  // Load accounts on mount
  useEffect(() => {
    refreshAccounts()
  }, [])

  const value: AccountContextValue = {
    ...state,
    selectAccount,
    refreshAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getSelectedAccount
  }

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
}