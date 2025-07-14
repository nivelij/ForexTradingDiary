"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TradingAccount } from "@/lib/types"
import { storage } from "@/lib/storage"
import Link from "next/link"
import { Plus, TrendingUp } from "lucide-react"
import { AccountDashboard } from "./components/AccountDashboard"

export default function HomePage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")

  useEffect(() => {
    const loadedAccounts = storage.getAccounts()
    setAccounts(loadedAccounts)

    const savedAccountId = storage.getSelectedAccountId()
    if (savedAccountId) {
      setSelectedAccountId(savedAccountId)
    }

    // Auto-select if only one account
    if (loadedAccounts.length === 1) {
      setSelectedAccountId(loadedAccounts[0].id)
    }
  }, [])

  if (accounts.length === 0) {
    return (
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
    )
  }

  if (!selectedAccountId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please select an account from the dropdown above</p>
        </div>
      </div>
    )
  }

  return <AccountDashboard accountId={selectedAccountId} />
}
