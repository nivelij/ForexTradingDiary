"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TradingAccount } from "@/lib/types"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Plus, Settings, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getAccounts } from "@/services/api"
import { mapApiAccountsToTradingAccounts } from "@/lib/mappers"
import { handleAccountError } from "@/lib/error-utils"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const fetchedAccounts = await getAccounts()
        const mappedAccounts = mapApiAccountsToTradingAccounts(fetchedAccounts)
        setAccounts(mappedAccounts)
      } catch (error) {
        handleAccountError(error, 'fetch accounts', () => setAccounts(storage.getAccounts()))
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccounts()
  }, [])

  const handleDeleteAccount = (accountId: string) => {
    storage.deleteAccount(accountId)
    setAccounts(storage.getAccounts())
    toast({
      title: "Account deleted",
      description: "The trading account and all its trades have been removed.",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Accounts</h1>
            <p className="text-muted-foreground">Manage your forex trading accounts</p>
          </div>
        </div>
        
        {/* New Account Button - Mobile */}
        <div className="sm:hidden">
          <Button asChild className="w-full">
            <Link href="/accounts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black mb-4"></div>
            <p className="text-muted-foreground">Loading accounts...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Accounts</h1>
          <p className="text-muted-foreground">Manage your forex trading accounts</p>
        </div>
      </div>

      {/* New Account Button - Mobile */}
      <div className="sm:hidden">
        <Button asChild className="w-full">
          <Link href="/accounts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Link>
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first trading account to start tracking your forex trades
            </p>
            <Button asChild>
              <Link href="/accounts/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const profitLoss = account.currentBalance - account.initialBalance
            const profitLossPercentage = (profitLoss / account.initialBalance) * 100
            const isProfit = profitLoss >= 0
            const trades = storage.getTradesByAccount(account.id)

            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the account "{account.name}" and all its trades. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAccount(account.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardDescription>Created {new Date(account.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-semibold">{formatCurrency(account.currentBalance, account.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Initial Balance</span>
                      <span className="text-sm">{formatCurrency(account.initialBalance, account.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">P/L</span>
                      <div className={`flex items-center ${isProfit ? "text-green-600" : "text-red-600"}`}>
                        {isProfit ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        <span className="font-medium">{formatCurrency(Math.abs(profitLoss), account.currency)}</span>
                        <span className="text-sm ml-1">({profitLossPercentage.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Trades</span>
                      <span>{trades.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
