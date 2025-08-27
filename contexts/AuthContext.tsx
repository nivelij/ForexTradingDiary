"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { isAuthenticated, setAuthCookie, removeAuthCookie, validateCredentials, getCurrentUser } from '@/lib/auth'

interface AuthContextType {
  isLoggedIn: boolean
  currentUser: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      if (authenticated) {
        setCurrentUser(getCurrentUser())
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const isValid = await validateCredentials(username, password)
      
      if (isValid) {
        setAuthCookie()
        setIsLoggedIn(true)
        setCurrentUser(getCurrentUser())
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    removeAuthCookie()
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  const value: AuthContextType = {
    isLoggedIn,
    currentUser,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}