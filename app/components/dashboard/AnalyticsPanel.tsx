"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TradingAccount } from "@/lib/types"
import type { AnalyticsData } from "@/lib/analytics"
import { formatCurrency } from "@/lib/utils"
import { BarChart } from "lucide-react" // Added BarChart

interface AnalyticsPanelProps {
  analytics: AnalyticsData
  account: TradingAccount
}

export function AnalyticsPanel({ analytics, account }: AnalyticsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"> {/* Added div for icon and title */}
          <BarChart className="h-5 w-5 text-purple-500" /> {/* Added BarChart icon */}
          <CardTitle className="text-xl">Performance Analytics</CardTitle>
        </div>
        <CardDescription>Advanced trading metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Avg Win</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(analytics.avgWin || 0, account.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Avg Loss</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(analytics.avgLoss || 0, account.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Risk:Reward</span>
            <span className="text-sm font-medium">
              1:{(analytics.riskRewardRatio || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Profit Factor</span>
            <span className="text-sm font-medium">
              {analytics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : (analytics.profitFactor || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Streaks</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Best Win Streak</span>
              <span className="text-sm font-medium text-green-600">
                {analytics.consecutiveWins || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Worst Loss Streak</span>
              <span className="text-sm font-medium text-red-600">
                {analytics.consecutiveLosses || 0}
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
  )
}