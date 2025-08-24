"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, History } from "lucide-react" // Added History
import type { Trade, TradingAccount } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { getProfitLossClassName, getDirectionIconClassName, getDirectionIconColorClassName } from "@/lib/ui-utils"

import { Button } from "@/components/ui/button";

interface RecentClosedTradesProps {
  trades: Trade[]
  account: TradingAccount
  onTradeClick: (tradeId: string) => void
  onSeeAllClick: () => void
}

export function RecentClosedTrades({ trades, account, onTradeClick, onSeeAllClick }: RecentClosedTradesProps) {

  const recentClosedTrades = trades
    .filter(trade => trade.outcome !== 'OPEN')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-2"> {/* Added div for icon and title */}
          <History className="h-5 w-5 text-green-500" /> {/* Added History icon */}
          <CardTitle className="text-xl">Recent Closed Trades</CardTitle>
        </div>
        <CardDescription>Your most recent completed trades</CardDescription>
        <Button onClick={onSeeAllClick} variant="outline" className="w-full mt-4">See all trades</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentClosedTrades.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No closed trades yet</p>
          ) : (
            recentClosedTrades.map((trade) => (
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
                  {trade.profitLoss !== undefined && (
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