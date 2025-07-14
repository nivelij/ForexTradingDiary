"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Navigation } from "./Navigation"
import { storage } from "@/lib/storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const loadedAccounts = storage.getAccounts()
    setAccounts(loadedAccounts)

    // Get selected account from storage
    const savedAccountId = storage.getSelectedAccountId()

    if (loadedAccounts.length === 0) {
      // No accounts exist, redirect to create account unless already there
      if (pathname !== "/accounts/new") {
        router.push("/accounts/new")
      }
    } else if (savedAccountId && loadedAccounts.find((acc) => acc.id === savedAccountId)) {
      // Valid saved account exists
      setSelectedAccountId(savedAccountId)
    } else {
      // Auto-select first account if no valid saved account
      setSelectedAccountId(loadedAccounts[0].id)
      storage.setSelectedAccountId(loadedAccounts[0].id)
    }

    setIsLoading(false)
  }, [pathname, router])

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId)
    storage.setSelectedAccountId(accountId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show account creation prompt if no accounts exist
  if (accounts.length === 0 && pathname !== "/accounts/new") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation selectedAccountId="" onAccountChange={handleAccountChange} />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Forex Trading Diary</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first trading account to start tracking your forex trades
                </p>
                <Button asChild>
                  <Link href="/accounts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation selectedAccountId={selectedAccountId} onAccountChange={handleAccountChange} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
    </div>
  )
}
