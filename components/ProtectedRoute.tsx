"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/app/components/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isLoggedIn && pathname !== '/login') {
      router.push('/login')
    }
  }, [isLoggedIn, loading, router, pathname])

  // Show loading during auth check
  if (loading) {
    return <Loading message="Checking authentication..." />
  }

  // Show login page if not authenticated
  if (!isLoggedIn && pathname !== '/login') {
    return <Loading message="Redirecting to login..." />
  }

  // Show protected content if authenticated or on login page
  return <>{children}</>
}