"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TradingAccount, Trade } from "@/lib/types"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Target, Trophy, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>(searchParams.get("accountId") || "")
  const [selectedPair, setSelectedPair] = useState<string>("all")

  useEffect(() => {
    const loadedAccounts = storage.getAccounts()
    setAccounts(loadedAccounts)

    if (loadedAccounts.length === 0) {
      router.push("/")
      return
    }

    // Auto-select first account if none selected
    if (!selectedAccount && loadedAccounts.length > 0) {
      setSelectedAccount(loadedAccounts[0].id)
    }
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      setTrades(storage.getTradesByAccount(selectedAccount))
    }
  }, [selectedAccount])

  const filteredTrades = trades.filter((trade) => {
    if (selectedPair !== "all" && trade.currencyPair !== selectedPair) return false
    return true
  })

  const closedTrades = filteredTrades.filter((t) => t.outcome !== "OPEN")
  const winningTrades = closedTrades.filter((t) => t.outcome === "WIN")
  const losingTrades = closedTrades.filter((t) => t.outcome === "LOSS")

  // Calculate KPIs
  const totalPL = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
  const avgWin =
    winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / winningTrades.length : 0
  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)) / losingTrades.length
      : 0
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0

  const bestTrade = closedTrades.reduce(
    (best, trade) => ((trade.profitLoss || 0) > (best?.profitLoss || Number.NEGATIVE_INFINITY) ? trade : best),
    null as Trade | null,
  )

  const worstTrade = closedTrades.reduce(
    (worst, trade) => ((trade.profitLoss || 0) < (worst?.profitLoss || Number.POSITIVE_INFINITY) ? trade : worst),
    null as Trade | null,
  )

  // Get unique currency pairs
  const currencyPairs = [...new Set(trades.map((t) => t.currencyPair))].sort()

  // Performance by currency pair
  const pairPerformance = currencyPairs
    .map((pair) => {
      const pairTrades = closedTrades.filter((t) => t.currencyPair === pair)
      const pairWins = pairTrades.filter((t) => t.outcome === "WIN")
      const pairPL = pairTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
      const pairWinRate = pairTrades.length > 0 ? (pairWins.length / pairTrades.length) * 100 : 0

      return {
        pair,
        totalPL: pairPL,
        tradeCount: pairTrades.length,
        winRate: pairWinRate,
      }
    })
    .filter((p) => p.tradeCount > 0)

  const selectedAccountData = accounts.find((acc) => acc.id === selectedAccount)

  const getOutcomeBadge = (outcome: Trade["outcome"]) => {
    const variants = {
      OPEN: "secondary",
      WIN: "default",
      LOSS: "destructive",
      BREAK_EVEN: "outline",
    } as const

    return <Badge variant={variants[outcome]}>{outcome.replace("_", " ")}</Badge>
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-muted-foreground text-center mb-4">Create a trading account first to view reports</p>
            <Button onClick={() => router.push("/accounts/new")}>Create Account</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Reports</h1>
          <p className="text-muted-foreground">
            {selectedAccountData
              ? `${selectedAccountData.name} • ${selectedAccountData.currency}`
              : "Analyze your trading performance"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Account & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Account & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency Pair</label>
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pairs</SelectItem>
                  {currencyPairs.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same... */}
      {/* KPIs, Best/Worst trades, Performance by pair, Trade history table */}
      {/* (keeping the existing implementation for brevity) */}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
            {totalPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalPL, selectedAccountData?.currency || "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades.length} wins / {closedTrades.length} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(avgWin, selectedAccountData?.currency || "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(avgLoss, selectedAccountData?.currency || "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk/Reward</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Trades */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-green-600" />
              Best Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{bestTrade.currencyPair}</span>
                  <Badge variant={bestTrade.direction === "BUY" ? "default" : "secondary"}>{bestTrade.direction}</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(bestTrade.profitLoss || 0, selectedAccountData?.currency || "USD")}
                </div>
                <p className="text-sm text-muted-foreground">{new Date(bestTrade.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No closed trades yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Worst Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{worstTrade.currencyPair}</span>
                  <Badge variant={worstTrade.direction === "BUY" ? "default" : "secondary"}>
                    {worstTrade.direction}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(worstTrade.profitLoss || 0, selectedAccountData?.currency || "USD")}
                </div>
                <p className="text-sm text-muted-foreground">{new Date(worstTrade.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No closed trades yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance by Currency Pair */}
      {pairPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Currency Pair</CardTitle>
            <CardDescription>Breakdown of your trading performance for each currency pair</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pairPerformance.map((pair) => (
                <div key={pair.pair} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{pair.pair}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pair.tradeCount} trades • {pair.winRate.toFixed(1)}% win rate
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${pair.totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(pair.totalPL, selectedAccountData?.currency || "USD")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Detailed view of all your trades for this account</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trades found for this account</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{new Date(trade.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{trade.currencyPair}</TableCell>
                      <TableCell>
                        <Badge variant={trade.direction === "BUY" ? "default" : "secondary"}>{trade.direction}</Badge>
                      </TableCell>
                      <TableCell>{getOutcomeBadge(trade.outcome)}</TableCell>
                      <TableCell className="text-right">
                        {trade.profitLoss !== undefined ? (
                          <span className={trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(trade.profitLoss, selectedAccountData?.currency || "USD")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
