import type { Trade } from "./types"

export interface AnalyticsData {
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
    avgWin: number
    avgLoss: number
    maxProfit: number
    maxLoss: number
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
  equityCurve: Array<{
    tradeNumber: number
    balance: number
    currencyPair: string
  }>
}

export const calculateTradeAnalytics = (trades: Trade[], initialBalance: number = 10000): AnalyticsData => {
  const closedTrades = trades.filter((t: Trade) => t.outcome !== "OPEN")
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
  const monthlyData = new Map<
    string,
    { profit: number; trades: number; wins: number; totalWinAmount: number; totalLossAmount: number; losingTrades: number; maxProfit: number; maxLoss: number }
  >()
  closedTrades.forEach((trade: Trade) => {
    const month = new Date(trade.createdAt).toISOString().slice(0, 7) // YYYY-MM
    const existing = monthlyData.get(month) || { profit: 0, trades: 0, wins: 0, totalWinAmount: 0, totalLossAmount: 0, losingTrades: 0, maxProfit: 0, maxLoss: 0 }
    const profitLoss = trade.profitLoss || 0
    monthlyData.set(month, {
      profit: existing.profit + profitLoss,
      trades: existing.trades + 1,
      wins: existing.wins + (trade.outcome === "WIN" ? 1 : 0),
      totalWinAmount: existing.totalWinAmount + (trade.outcome === "WIN" ? profitLoss : 0),
      totalLossAmount: existing.totalLossAmount + (trade.outcome === "LOSS" ? profitLoss : 0),
      losingTrades: existing.losingTrades + (trade.outcome === "LOSS" ? 1 : 0),
      maxProfit: Math.max(existing.maxProfit, profitLoss > 0 ? profitLoss : 0),
      maxLoss: Math.min(existing.maxLoss, profitLoss < 0 ? profitLoss : 0),
    })
  })

  const monthlyPerformance = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      profit: data.profit,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgWin: data.wins > 0 ? data.totalWinAmount / data.wins : 0,
      avgLoss: data.losingTrades > 0 ? Math.abs(data.totalLossAmount / data.losingTrades) : 0,
      maxProfit: data.maxProfit,
      maxLoss: Math.abs(data.maxLoss),
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

  const dailyTrades = trades.filter((t) => now.getTime() - new Date(t.createdAt).getTime() <= oneDay).length
  const weeklyTrades = trades.filter((t) => now.getTime() - new Date(t.createdAt).getTime() <= oneWeek).length
  const monthlyTrades = trades.filter((t) => now.getTime() - new Date(t.createdAt).getTime() <= oneMonth).length

  // Calculate equity curve
  const sortedClosedTrades = closedTrades
    .sort((a: Trade, b: Trade) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const equityCurve = [
    { tradeNumber: 0, balance: initialBalance, currencyPair: "Initial" }
  ]

  let currentBalance = initialBalance
  sortedClosedTrades.forEach((trade: Trade, index: number) => {
    currentBalance += trade.profitLoss || 0
    equityCurve.push({
      tradeNumber: index + 1,
      balance: currentBalance,
      currencyPair: trade.currencyPair
    })
  })

  return {
    totalProfitLoss: totalPL,
    winRate,
    totalTrades: trades.length,
    openTrades: trades.filter((t) => t.outcome === "OPEN").length,
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
    equityCurve,
  }
}