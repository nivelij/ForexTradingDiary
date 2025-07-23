"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { TradingAccount } from "@/lib/types"
import type { AnalyticsData } from "@/lib/analytics"

interface EquityCurveProps {
  analytics: AnalyticsData
  account: TradingAccount
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "hsl(var(--chart-1))",
  },
}

export function EquityCurve({ analytics, account }: EquityCurveProps) {
  const { equityCurve } = analytics

  if (!equityCurve || equityCurve.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Balance progression over trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No closed trades available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate Y-axis domain - start from lowest balance
  const minBalance = Math.min(...equityCurve.map(point => point.balance))
  const maxBalance = Math.max(...equityCurve.map(point => point.balance))
  const padding = (maxBalance - minBalance) * 0.1 // 10% padding
  const yAxisDomain = [
    Math.max(0, minBalance - padding), // Don't go below 0
    maxBalance + padding
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
        <CardDescription>Balance progression from initial balance to current</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={equityCurve}>
            <XAxis 
              dataKey="tradeNumber" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={yAxisDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, account.currency, true)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    formatCurrency(Number(value), account.currency),
                    ""
                  ]}
                  labelFormatter={(label) => `Trade ${label}`}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--color-balance)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}