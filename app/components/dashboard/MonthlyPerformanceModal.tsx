"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import type { AnalyticsData } from "@/lib/analytics"

interface MonthlyPerformanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthData: AnalyticsData["monthlyPerformance"][0] | null
  accountCurrency: string
}

export function MonthlyPerformanceModal({ open, onOpenChange, monthData, accountCurrency }: MonthlyPerformanceModalProps) {
  if (!monthData) return null

  // A more readable month format, adding '-02' to avoid timezone issues.
  const formattedMonth = new Date(monthData.month + "-02").toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Performance for {formattedMonth}</DialogTitle>
          <DialogDescription>A detailed breakdown of your trading performance for this month.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 text-muted-foreground">Total Profit/Loss</td>
                <td className={`py-2 text-right font-semibold ${monthData.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(monthData.profit, accountCurrency)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-muted-foreground">Total Trades</td>
                <td className="py-2 text-right font-semibold">{monthData.trades}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-muted-foreground">Win Rate</td>
                <td className="py-2 text-right font-semibold">{`${monthData.winRate.toFixed(1)}%`}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-muted-foreground">Average Win / Loss</td>
                <td className="py-2 text-right font-semibold">
                  <span className="text-green-600">+{formatCurrency(monthData.avgWin, accountCurrency)}</span>
                  <span> / </span>
                  <span className="text-red-600">-{formatCurrency(monthData.avgLoss, accountCurrency)}</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Maximum Win / Loss</td>
                <td className="py-2 text-right font-semibold">
                  <span className="text-green-600">+{formatCurrency(monthData.maxProfit, accountCurrency)}</span>
                  <span> / </span>
                  <span className="text-red-600">-{formatCurrency(monthData.maxLoss, accountCurrency)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
