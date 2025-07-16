"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
} from "lucide-react"
import type { TradingAccount, Trade } from "@/lib/types"
import { getAccounts, getTrades } from "@/services/api"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { NewTradeModal } from "./NewTradeModal"
import { TradeDetailsModal } from "./TradeDetailsModal"
import { Loading } from "./Loading"

interface AccountDashboardProps {
  accountId: string
}


const mockTrades: Trade[] = [
  {
    id: 'trade-1',
    accountId: 'mock-account-1',
    currencyPair: 'EUR/USD',
    direction: 'BUY',
    rationale: 'Strong upward trend with good support levels',
    outcome: 'WIN',
    profitLoss: 250,
    retrospective: 'Good entry point, held position well',
    screenshots: [],
    openDate: '2024-01-20T09:30:00Z',
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
  },
  {
    id: 'trade-2',
    accountId: 'mock-account-1',
    currencyPair: 'GBP/USD',
    direction: 'SELL',
    rationale: 'Bearish pattern formation',
    outcome: 'LOSS',
    profitLoss: -150,
    retrospective: 'Stop loss triggered too early',
    screenshots: [],
    openDate: '2024-01-22T11:15:00Z',
    createdAt: '2024-01-22T11:15:00Z',
    updatedAt: '2024-01-22T14:20:00Z',
  },
  {
    id: 'trade-3',
    accountId: 'mock-account-1',
    currencyPair: 'USD/JPY',
    direction: 'BUY',
    rationale: 'Breakout above resistance',
    outcome: 'WIN',
    profitLoss: 320,
    retrospective: 'Perfect timing on the breakout',
    screenshots: [],
    openDate: '2024-01-25T08:00:00Z',
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-25T16:30:00Z',
  },
  {
    id: 'trade-4',
    accountId: 'mock-account-1',
    currencyPair: 'AUD/USD',
    direction: 'SELL',
    rationale: 'Commodity weakness affecting AUD',
    outcome: 'OPEN',
    profitLoss: undefined,
    retrospective: undefined,
    screenshots: [],
    openDate: '2024-01-28T10:45:00Z',
    createdAt: '2024-01-28T10:45:00Z',
    updatedAt: '2024-01-28T10:45:00Z',
  },
  {
    id: 'trade-5',
    accountId: 'mock-account-1',
    currencyPair: 'EUR/GBP',
    direction: 'BUY',
    rationale: 'ECB policy divergence',
    outcome: 'WIN',
    profitLoss: 180,
    retrospective: 'Good fundamental analysis',
    screenshots: [],
    openDate: '2024-01-30T13:20:00Z',
    createdAt: '2024-01-30T13:20:00Z',
    updatedAt: '2024-01-30T17:10:00Z',
  },
];

interface AnalyticsData {
  totalProfitLoss: number
  winRate: number
  totalTrades: number
  openTrades: number
  avgWin: number
  avgLoss: number
  riskRewardRatio: number
  profitFactor: number
  consecutiveWins: number
  consecutiveLosses: number
  bestTrade: Trade | null
  worstTrade: Trade | null
  monthlyPerformance: Array<{
    month: string
    profit: number
    trades: number
    winRate: number
  }>
  currencyPairPerformance: Array<{
    pair: string
    profit: number
    trades: number
    winRate: number
    avgProfit: number
  }>
  tradingFrequency: {
    daily: number
    weekly: number
    monthly: number
  }
}

export function AccountDashboard({ accountId }: AccountDashboardProps) {
  const [account, setAccount] = useState<TradingAccount | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [isTradeDetailsModalOpen, setIsTradeDetailsModalOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProfitLoss: 0,
    winRate: 0,
    totalTrades: 0,
    openTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    riskRewardRatio: 0,
    profitFactor: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
    bestTrade: null,
    worstTrade: null,
    monthlyPerformance: [],
    currencyPairPerformance: [],
    tradingFrequency: { daily: 0, weekly: 0, monthly: 0 },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all accounts from API and find the one with matching ID
        const accounts = await getAccounts()
        const selectedAccount = accounts.find((acc: any) => acc.id === accountId)
        if (selectedAccount) {
          // Map API response to TradingAccount format
          const mappedAccount: TradingAccount = {
            id: selectedAccount.id,
            name: selectedAccount.name,
            currency: selectedAccount.currency,
            initialBalance: parseFloat(selectedAccount.initial_balance),
            currentBalance: parseFloat(selectedAccount.current_balance),
            createdAt: selectedAccount.created_at,
          }
          setAccount(mappedAccount)
        }
        
        // Fetch trades from API
        const allTrades = await getTrades()
        const apiTrades = allTrades.filter((trade: any) => trade.account_id === accountId)
        // Map API trades to the expected format
        const mappedTrades = apiTrades.map((trade: any) => ({
          id: trade.id,
          accountId: trade.account_id,
          currencyPair: trade.currency_pair,
          direction: trade.direction,
          rationale: trade.rationale,
          outcome: trade.outcome,
          profitLoss: trade.profit_loss ? parseFloat(trade.profit_loss) : undefined,
          retrospective: trade.retrospective,
          screenshots: [], // API doesn't include screenshots yet
          openDate: trade.created_at,
          createdAt: trade.created_at,
          updatedAt: trade.updated_at,
        }))
        setTrades(mappedTrades)
        
        // Calculate comprehensive analytics using API data
        const closedTrades = mappedTrades.filter((t: Trade) => t.outcome !== "OPEN")
    const winningTrades = closedTrades.filter((t: Trade) => t.outcome === "WIN")
    const losingTrades = closedTrades.filter((t: Trade) => t.outcome === "LOSS")

    const totalPL = closedTrades.reduce((sum: number, trade: Trade) => sum + (trade.profitLoss || 0), 0)
    const totalWins = winningTrades.reduce((sum: number, t: Trade) => sum + (t.profitLoss || 0), 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum: number, t: Trade) => sum + (t.profitLoss || 0), 0))

    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Number.POSITIVE_INFINITY : 0


    // Calculate consecutive wins/losses
    let currentWinStreak = 0
    let currentLossStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0

    closedTrades
      .sort((a: Trade, b: Trade) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((trade: Trade) => {
        if (trade.outcome === "WIN") {
          currentWinStreak++
          currentLossStreak = 0
          maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
        } else if (trade.outcome === "LOSS") {
          currentLossStreak++
          currentWinStreak = 0
          maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
        } else {
          currentWinStreak = 0
          currentLossStreak = 0
        }
      })

    // Best and worst trades
    const bestTrade = closedTrades.reduce(
      (best: Trade | null, trade: Trade) => ((trade.profitLoss || 0) > (best?.profitLoss || Number.NEGATIVE_INFINITY) ? trade : best),
      null as Trade | null,
    )

    const worstTrade = closedTrades.reduce(
      (worst: Trade | null, trade: Trade) => ((trade.profitLoss || 0) < (worst?.profitLoss || Number.POSITIVE_INFINITY) ? trade : worst),
      null as Trade | null,
    )

    // Monthly performance
    const monthlyData = new Map<string, { profit: number; trades: number; wins: number }>()
    closedTrades.forEach((trade: Trade) => {
      const month = new Date(trade.createdAt).toISOString().slice(0, 7) // YYYY-MM
      const existing = monthlyData.get(month) || { profit: 0, trades: 0, wins: 0 }
      monthlyData.set(month, {
        profit: existing.profit + (trade.profitLoss || 0),
        trades: existing.trades + 1,
        wins: existing.wins + (trade.outcome === "WIN" ? 1 : 0),
      })
    })

    const monthlyPerformance = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        profit: data.profit,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6) // Last 6 months

    // Currency pair performance
    const pairData = new Map<string, { profit: number; trades: number; wins: number }>()
    closedTrades.forEach((trade: Trade) => {
      const existing = pairData.get(trade.currencyPair) || { profit: 0, trades: 0, wins: 0 }
      pairData.set(trade.currencyPair, {
        profit: existing.profit + (trade.profitLoss || 0),
        trades: existing.trades + 1,
        wins: existing.wins + (trade.outcome === "WIN" ? 1 : 0),
      })
    })

    const currencyPairPerformance = Array.from(pairData.entries())
      .map(([pair, data]) => ({
        pair,
        profit: data.profit,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        avgProfit: data.trades > 0 ? data.profit / data.trades : 0,
      }))
      .sort((a, b) => b.profit - a.profit)

    // Trading frequency
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    const dailyTrades = mockTrades.filter((t) => now.getTime() - new Date(t.createdAt).getTime() <= oneDay).length

    const weeklyTrades = mockTrades.filter((t) => now.getTime() - new Date(t.createdAt).getTime() <= oneWeek).length

    const monthlyTrades = mockTrades.filter(
      (t) => now.getTime() - new Date(t.createdAt).getTime() <= oneMonth,
    ).length

    setAnalytics({
      totalProfitLoss: totalPL,
      winRate,
      totalTrades: mockTrades.length,
      openTrades: mockTrades.filter((t) => t.outcome === "OPEN").length,
      avgWin,
      avgLoss,
      riskRewardRatio,
      profitFactor,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      bestTrade,
      worstTrade,
      monthlyPerformance,
      currencyPairPerformance,
      tradingFrequency: {
        daily: dailyTrades,
        weekly: weeklyTrades,
        monthly: monthlyTrades,
      },
    })
    } catch (error) {
        console.error('Error fetching account data:', error)
        // Don't set account data if API fails - let the component handle the null state
      }
    }
    
    fetchData()
  }, [accountId])

  const handleTradeCreated = () => {
    // Refresh the dashboard data when a new trade is created
    window.location.reload()
  }

  const recentTrades = trades
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getOutcomeBadge = (outcome: Trade["outcome"]) => {
    const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
      OPEN: "secondary",
      WIN: "default", 
      LOSS: "destructive",
      BREAK_EVEN: "outline",
    }

    return <Badge variant={variants[outcome]}>{outcome.replace("_", " ")}</Badge>
  }

  if (!account) {
    return <Loading message="Loading account data..." />
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <Button onClick={() => setIsNewTradeModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Trade
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Trading Account Dashboard
          </p>
        </div>

        {/* Account Details */}
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.winRate.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trades</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalTrades}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Trades</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.openTrades}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your most recent trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div 
                    key={trade.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTrade(trade);
                      setIsTradeDetailsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        trade.direction === 'BUY' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.direction === 'BUY' ? (
                          <ArrowUpRight className={`h-4 w-4 ${
                            trade.direction === 'BUY' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trade.currencyPair}</p>
                        <p className="text-sm text-gray-600">{trade.direction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getOutcomeBadge(trade.outcome)}
                      {trade.profitLoss !== undefined && (
                        <p className={`font-medium ${
                          trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(trade.profitLoss, account.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Advanced trading metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Win</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(analytics.avgWin, account.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Loss</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(analytics.avgLoss, account.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Risk:Reward</span>
                  <span className="text-sm font-medium">
                    1:{analytics.riskRewardRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Profit Factor</span>
                  <span className="text-sm font-medium">
                    {analytics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : analytics.profitFactor.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Streaks</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Best Win Streak</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics.consecutiveWins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Worst Loss Streak</span>
                    <span className="text-sm font-medium text-red-600">
                      {analytics.consecutiveLosses}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Best/Worst Trades</h4>
                <div className="space-y-2">
                  {analytics.bestTrade && (
                    <div className="text-sm">
                      <span className="text-gray-600">Best: </span>
                      <span className="font-medium text-green-600">
                        {analytics.bestTrade.currencyPair} {formatCurrency(analytics.bestTrade.profitLoss || 0, account.currency)}
                      </span>
                    </div>
                  )}
                  {analytics.worstTrade && (
                    <div className="text-sm">
                      <span className="text-gray-600">Worst: </span>
                      <span className="font-medium text-red-600">
                        {analytics.worstTrade.currencyPair} {formatCurrency(analytics.worstTrade.profitLoss || 0, account.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
                {analytics.monthlyPerformance.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-600">{month.trades} trades | {month.winRate.toFixed(1)}% win rate</p>
                    </div>
                    <p className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(month.profit, account.currency)}
                    </p>
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
                {analytics.currencyPairPerformance.slice(0, 8).map((pair) => (
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
                        Avg: {formatCurrency(pair.avgProfit, account.currency)}
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
      />
    </div>
  )
}
