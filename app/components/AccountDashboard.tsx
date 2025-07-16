"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import Link from "next/link"
import type { TradingAccount, Trade } from "@/lib/types"
import { getAccounts, getTradesByAccount } from "@/services/api"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NewTradeModal } from "./NewTradeModal"
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
        
        // Still using mock trades for now
        setTrades(mockTrades)
        
        // Calculate comprehensive analytics using mock data
        const closedTrades = mockTrades.filter((t) => t.outcome !== "OPEN")
    const winningTrades = closedTrades.filter((t) => t.outcome === "WIN")
    const losingTrades = closedTrades.filter((t) => t.outcome === "LOSS")

    const totalPL = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0))

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
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((trade) => {
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
      (best, trade) => ((trade.profitLoss || 0) > (best?.profitLoss || Number.NEGATIVE_INFINITY) ? trade : best),
      null as Trade | null,
    )

    const worstTrade = closedTrades.reduce(
      (worst, trade) => ((trade.profitLoss || 0) < (worst?.profitLoss || Number.POSITIVE_INFINITY) ? trade : worst),
      null as Trade | null,
    )

    // Monthly performance
    const monthlyData = new Map<string, { profit: number; trades: number; wins: number }>()
    closedTrades.forEach((trade) => {
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
    closedTrades.forEach((trade) => {
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
    const variants = {
      OPEN: "secondary",
      WIN: "default",
      LOSS: "destructive",
      BREAK_EVEN: "outline",
    } as const

    return <Badge variant={variants[outcome]}>{outcome.replace("_", " ")}</Badge>
  }

  if (!account) {
    return <Loading message="Loading account data..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
          <p className="text-muted-foreground">Trading Dashboard • {account.currency}</p>
        </div>
        <Button onClick={() => setIsNewTradeModalOpen(true)} className="hidden sm:flex">
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </div>

      {/* New Trade Button - Mobile */}
      <div className="sm:hidden">
        <Button onClick={() => setIsNewTradeModalOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </div>

      {/* Account Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(account.currentBalance, account.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Initial Balance</p>
              <p className="text-lg">{formatCurrency(account.initialBalance, account.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total P/L</p>
              <p
                className={`text-lg font-semibold ${analytics.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(analytics.totalProfitLoss, account.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">P/L %</p>
              <p
                className={`text-lg font-semibold ${analytics.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {((analytics.totalProfitLoss / account.initialBalance) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-lg font-semibold">{analytics.winRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.totalTrades - analytics.openTrades} closed trades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Advanced Analytics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Trading Streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Trading Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Consecutive Wins</span>
              <span className="font-semibold text-green-600">{analytics.consecutiveWins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Consecutive Losses</span>
              <span className="font-semibold text-red-600">{analytics.consecutiveLosses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Trades</span>
              <span className="font-semibold">{analytics.totalTrades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Open Trades</span>
              <span className="font-semibold">{analytics.openTrades}</span>
            </div>
          </CardContent>
        </Card>

        {/* Trading Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Trading Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="font-semibold">{analytics.tradingFrequency.daily} trades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="font-semibold">{analytics.tradingFrequency.weekly} trades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold">{analytics.tradingFrequency.monthly} trades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg per Month</span>
              <span className="font-semibold">
                {analytics.totalTrades > 0
                  ? Math.round(analytics.totalTrades / Math.max(1, analytics.monthlyPerformance.length))
                  : 0}{" "}
                trades
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Best/Worst Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Trade Extremes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.bestTrade ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Best Trade</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{analytics.bestTrade.currencyPair}</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(analytics.bestTrade.profitLoss || 0, account.currency)}
                  </span>
                </div>
              </div>
            ) : null}

            {analytics.worstTrade ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Worst Trade</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{analytics.worstTrade.currencyPair}</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(analytics.worstTrade.profitLoss || 0, account.currency)}
                  </span>
                </div>
              </div>
            ) : null}

            {!analytics.bestTrade && !analytics.worstTrade && (
              <p className="text-sm text-muted-foreground">No closed trades yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      {analytics.monthlyPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Your trading performance over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyPerformance.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {new Date(month.month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {month.trades} trades • {month.winRate.toFixed(1)}% win rate
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(month.profit, account.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency Pair Performance */}
      {analytics.currencyPairPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currency Pair Performance</CardTitle>
            <CardDescription>Breakdown of your trading performance by currency pair</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.currencyPairPerformance.slice(0, 5).map((pair) => (
                <div key={pair.pair} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{pair.pair}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pair.trades} trades • {pair.winRate.toFixed(1)}% win rate • Avg:{" "}
                      {formatCurrency(pair.avgProfit, account.currency)}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${pair.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(pair.profit, account.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your latest trading activity</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/reports?accountId=${accountId}`}>View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No trades recorded yet</p>
              <Button onClick={() => setIsNewTradeModalOpen(true)}>
                Record Your First Trade
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <Link key={trade.id} href={`/trade/${trade.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {trade.direction === "BUY" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trade.currencyPair}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trade.profitLoss !== undefined && (
                        <span
                          className={`text-sm font-medium ${trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(trade.profitLoss, account.currency)}
                        </span>
                      )}
                      {getOutcomeBadge(trade.outcome)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Trade Modal */}
      {account && (
        <NewTradeModal
          open={isNewTradeModalOpen}
          onOpenChange={setIsNewTradeModalOpen}
          accountId={accountId}
          account={account}
          onTradeCreated={handleTradeCreated}
        />
      )}
    </div>
  )
}
