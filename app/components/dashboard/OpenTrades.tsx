"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Radio, ListTodo } from "lucide-react" // Added ListTodo
import type { Trade, TradingAccount } from "@/lib/types"
import { getDirectionIconClassName, getDirectionIconColorClassName } from "@/lib/ui-utils"
import { CurrencyIcon } from "../CurrencyIcon"

interface OpenTradesProps {
  trades: Trade[]
  account: TradingAccount
  onTradeClick: (tradeId: string) => void
}

export function OpenTrades({ trades, account, onTradeClick }: OpenTradesProps) {

  const openTrades = trades
    .filter(trade => trade.outcome === 'OPEN')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-2"> {/* Added div for icon and title */}
          <ListTodo className="h-5 w-5 text-orange-500" /> {/* Added ListTodo icon */}
          <CardTitle className="text-xl">Open Trades</CardTitle>
        </div>
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
                  <CurrencyIcon currencyPair={trade.currencyPair} size={48} className="flex-shrink-0" />
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
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full border border-green-200">
                    <Radio className="h-3 w-3 text-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-600 animate-pulse">LIVE</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}