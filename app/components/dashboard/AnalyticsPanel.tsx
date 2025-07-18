"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TradingAccount } from "@/lib/types"
import type { AnalyticsData } from "@/lib/analytics"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsPanelProps {
  analytics: AnalyticsData
  account: TradingAccount
}

export function AnalyticsPanel({ analytics, account }: AnalyticsPanelProps) {
  return (
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
  )
}