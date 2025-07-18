"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Trade, TradingAccount } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { getOutcomeBadgeVariant, getOutcomeDisplayText, getProfitLossClassName, getDirectionIconClassName, getDirectionIconColorClassName } from "@/lib/ui-utils"

interface RecentTradesProps {
  trades: Trade[]
  account: TradingAccount
  onTradeClick: (tradeId: string) => void
}

export function RecentTrades({ trades, account, onTradeClick }: RecentTradesProps) {
  const getOutcomeBadge = (outcome: Trade["outcome"]) => {
    return <Badge variant={getOutcomeBadgeVariant(outcome)}>{getOutcomeDisplayText(outcome)}</Badge>
  }

  const recentTrades = trades
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
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
              onClick={() => onTradeClick(trade.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getDirectionIconClassName(trade.direction)}`}>
                  {trade.direction === 'BUY' ? (
                    <ArrowUpRight className={`h-4 w-4 ${getDirectionIconColorClassName(trade.direction)}`} />
                  ) : (
                    <ArrowDownRight className={`h-4 w-4 ${getDirectionIconColorClassName(trade.direction)}`} />
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
                  <p className={`font-medium ${getProfitLossClassName(trade.profitLoss)}`}>
                    {formatCurrency(trade.profitLoss, account.currency)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}