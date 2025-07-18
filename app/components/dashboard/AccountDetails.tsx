"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TradingAccount } from "@/lib/types"
import type { AnalyticsData } from "@/lib/analytics"
import { formatCurrency } from "@/lib/utils"

interface AccountDetailsProps {
  account: TradingAccount
  analytics: AnalyticsData
}

export function AccountDetails({ account, analytics }: AccountDetailsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>Current account balance and performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm font-medium text-gray-600">Current Balance</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              {formatCurrency(account.currentBalance, account.currency)}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm font-medium text-gray-600">Initial Balance</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              {formatCurrency(account.initialBalance, account.currency)}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm font-medium text-gray-600">Total P&L</p>
            <p className={`text-lg md:text-2xl font-bold ${analytics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.totalProfitLoss, account.currency)}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm font-medium text-gray-600">Total P&L (%)</p>
            <p className={`text-lg md:text-2xl font-bold ${analytics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {account.initialBalance > 0 ? ((analytics.totalProfitLoss / account.initialBalance) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}