"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, ArrowUp, ArrowDown } from "lucide-react"
import type { TradingAccount, Trade } from "@/lib/types"
import { getAccounts, getTrades, getTrade } from "@/services/api"
import { formatCurrency } from "@/lib/utils"
import { calculateTradeAnalytics, type AnalyticsData } from "@/lib/analytics"
import { mapApiAccountToTradingAccount, mapApiTradesForAccount } from "@/lib/mappers"
import { handleApiError } from "@/lib/error-utils"
import { NewTradeModal } from "./NewTradeModal"
import { TradeDetailsModal } from "./TradeDetailsModal"
import { Loading } from "./Loading"
import { AccountDetails } from "./dashboard/AccountDetails"
import { AccountMetrics } from "./dashboard/AccountMetrics"
import { RecentClosedTrades } from "./dashboard/RecentClosedTrades"
import { OpenTrades } from "./dashboard/OpenTrades"
import { AnalyticsPanel } from "./dashboard/AnalyticsPanel"
import { EquityCurve } from "./dashboard/EquityCurve"

import { MonthlyPerformanceModal } from "./dashboard/MonthlyPerformanceModal"
interface AccountDashboardProps {
  accountId: string
}



export function AccountDashboard({ accountId }: AccountDashboardProps) {
  const [account, setAccount] = useState<TradingAccount | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [isTradeDetailsModalOpen, setIsTradeDetailsModalOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData>({} as AnalyticsData)
  const [isMonthlyStatsModalOpen, setIsMonthlyStatsModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<AnalyticsData["monthlyPerformance"][0] | null>(null)

  const fetchData = async () => {
    try {
      // Fetch all accounts from API and find the one with matching ID
      const accounts = await getAccounts()
      const selectedAccount = accounts.find((acc: any) => acc.id === accountId)
      let mappedAccount = null
      if (selectedAccount) {
        mappedAccount = mapApiAccountToTradingAccount(selectedAccount)
        setAccount(mappedAccount)
      }
      
      // Fetch trades from API
      const allTrades = await getTrades()
      const mappedTrades = mapApiTradesForAccount(allTrades, accountId)
      setTrades(mappedTrades)
      
      // Calculate comprehensive analytics using API data
      const analyticsData = calculateTradeAnalytics(mappedTrades, mappedAccount?.initialBalance || 10000)
      setAnalytics(analyticsData)
    } catch (error) {
      handleApiError(error, 'fetch account data')
    }
  }

  const handleTradeClick = async (tradeId: string) => {
    try {
      const tradeDetails = await getTrade(tradeId)
      setSelectedTrade(tradeDetails)
      setIsTradeDetailsModalOpen(true)
    } catch (error) {
      handleApiError(error, 'fetch trade details')
    }
  }

  const handleMonthClick = (monthData: AnalyticsData["monthlyPerformance"][0]) => {
    setSelectedMonth(monthData)
    setIsMonthlyStatsModalOpen(true)
  }

  useEffect(() => {
    fetchData()
  }, [accountId])

  const handleTradeCreated = () => {
    // Refresh the dashboard data when a new trade is created
    fetchData()
  }



  if (!account) {
    return <Loading message="Loading account data..." />
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Button onClick={() => setIsNewTradeModalOpen(true)} className="flex items-center gap-2 w-full mt-4 md:w-auto md:mt-0">
              <Plus className="h-4 w-4" />
              New Trade
            </Button>
          </div>
        </div>

        {/* Account Details */}
        <AccountDetails account={account} analytics={analytics} />

        {/* Key Metrics */}
        <AccountMetrics analytics={analytics} />

        <Separator className="my-6" />

        {/* Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OpenTrades trades={trades} account={account} onTradeClick={handleTradeClick} />
          <RecentClosedTrades trades={trades} account={account} onTradeClick={handleTradeClick} />
          <AnalyticsPanel analytics={analytics} account={account} />
        </div>

        {/* Equity Curve */}
        <div className="w-full mt-6">
          <EquityCurve analytics={analytics} account={account} />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Last 6 months trading results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.monthlyPerformance?.map((month) => (
                  <div key={month.month}>
                    {/* Desktop View */}
                    <div className="hidden md:flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-gray-600">
                          {month.trades} trades | {month.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(month.profit, account.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avg: +{formatCurrency(month.avgWin, account.currency)} / -
                          {formatCurrency(month.avgLoss, account.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Max: +{formatCurrency(month.maxProfit, account.currency)} / -
                          {formatCurrency(month.maxLoss, account.currency)}
                        </p>
                      </div>
                    </div>
                    {/* Mobile View */}
                    <div
                      className="flex md:hidden items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer active:bg-gray-100"
                      onClick={() => handleMonthClick(month)}
                    >
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-gray-600">
                          {month.trades} trades | {month.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <p className={`font-medium ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(month.profit, account.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Pair Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Pair Performance</CardTitle>
              <CardDescription>Performance by trading pairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.currencyPairPerformance?.slice(0, 8).map((pair) => (
                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{pair.pair}</p>
                      <p className="text-sm text-gray-600">
                        {pair.trades} trades | {pair.winRate.toFixed(1)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${pair.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pair.profit, account.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg: {pair.avgProfit >= 0 ? "+" : ""}{formatCurrency(pair.avgProfit, account.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <NewTradeModal
        open={isNewTradeModalOpen}
        onOpenChange={setIsNewTradeModalOpen}
        onTradeCreated={handleTradeCreated}
        accountId={accountId}
        account={account}
      />
      
      <TradeDetailsModal
        open={isTradeDetailsModalOpen}
        onOpenChange={setIsTradeDetailsModalOpen}
        trade={selectedTrade}
        accountCurrency={account.currency}
        onTradeUpdated={fetchData}
      />

      <MonthlyPerformanceModal
        open={isMonthlyStatsModalOpen}
        onOpenChange={setIsMonthlyStatsModalOpen}
        monthData={selectedMonth}
        accountCurrency={account.currency}
      />
    </div>
  )
}
