"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Trade, TradingAccount } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { getOutcomeBadgeVariant, getOutcomeDisplayText, getProfitLossClassName, getDirectionIconClassName, getDirectionIconColorClassName } from "@/lib/ui-utils"

interface OpenTradesProps {
  trades: Trade[]
  account: TradingAccount
  onTradeClick: (tradeId: string) => void
}

export function OpenTrades({ trades, account, onTradeClick }: OpenTradesProps) {
  const getOutcomeBadge = (outcome: Trade["outcome"]) => {
    return <Badge variant={getOutcomeBadgeVariant(outcome)}>{getOutcomeDisplayText(outcome)}</Badge>
  }

  const openTrades = trades
    .filter(trade => trade.outcome === 'OPEN')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Open Trades</CardTitle>
        <CardDescription>Your currently active trades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {openTrades.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No open trades currently</p>
          ) : (
            openTrades.map((trade) => (
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
                  {trade.profitLoss !== undefined && trade.profitLoss !== null && (
                    <p className={`font-medium ${getProfitLossClassName(trade.profitLoss)}`}>
                      {formatCurrency(trade.profitLoss, account.currency)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}