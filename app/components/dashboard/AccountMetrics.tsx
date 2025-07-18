"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, BarChart3, Activity } from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics"

interface AccountMetricsProps {
  analytics: AnalyticsData
}

export function AccountMetrics({ analytics }: AccountMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-blue-600">{(analytics.winRate || 0).toFixed(1)}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTrades || 0}</p>
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
              <p className="text-2xl font-bold text-orange-600">{analytics.openTrades || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}