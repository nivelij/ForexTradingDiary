"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Calendar, BarChart3 } from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics"
import type { Trade } from "@/lib/types"

interface MonthlyPerformanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthData: AnalyticsData["monthlyPerformance"][0] | null
  accountCurrency: string
  trades: Trade[]
}

export function MonthlyPerformanceModal({ open, onOpenChange, monthData, accountCurrency, trades }: MonthlyPerformanceModalProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'calendar'>('summary')

  // Calculate daily profit/loss for the selected month
  const dailyData = useMemo(() => {
    if (!monthData) return new Map()
    
    const monthTrades = trades.filter((trade) => {
      const tradeDate = new Date(trade.updatedAt || trade.createdAt)
      const tradeYear = tradeDate.getFullYear()
      const tradeMonth = tradeDate.getMonth() + 1 // getMonth() is 0-indexed
      const tradeMonthStr = `${tradeYear}-${tradeMonth.toString().padStart(2, '0')}`
      return tradeMonthStr === monthData.month && trade.outcome !== "OPEN"
    })

    // Group trades by date (using updatedAt for closed trades)
    const dailyMap = new Map<string, { profit: number; trades: Trade[] }>()
    
    monthTrades.forEach((trade) => {
      const tradeDate = new Date(trade.updatedAt || trade.createdAt)
      const year = tradeDate.getFullYear()
      const month = (tradeDate.getMonth() + 1).toString().padStart(2, '0')
      const day = tradeDate.getDate().toString().padStart(2, '0')
      const dateKey = `${year}-${month}-${day}` // Local date, not UTC
      const existing = dailyMap.get(dateKey) || { profit: 0, trades: [] }
      
      dailyMap.set(dateKey, {
        profit: existing.profit + (trade.profitLoss || 0),
        trades: [...existing.trades, trade]
      })
    })

    return dailyMap
  }, [trades, monthData])

  // Generate calendar days for the month (weekdays only, properly positioned)
  const calendarDays = useMemo(() => {
    if (!monthData) return []
    
    const year = parseInt(monthData.month.split('-')[0])
    const month = parseInt(monthData.month.split('-')[1]) - 1 // JavaScript months are 0-indexed
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const currentDate = new Date(firstDay)
    
    // Generate all days in the month, including weekdays from previous/next months to fill the grid
    while (currentDate <= lastDay) {
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Only include Monday (1) through Friday (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Use local date components to avoid timezone issues
        const year = currentDate.getFullYear()
        const monthNum = (currentDate.getMonth() + 1).toString().padStart(2, '0')
        const day = currentDate.getDate().toString().padStart(2, '0')
        const dateStr = `${year}-${monthNum}-${day}`
        
        const isCurrentMonth = currentDate.getMonth() === month
        const dayData = dailyData.get(dateStr)
        
        days.push({
          date: new Date(currentDate),
          dateStr,
          isCurrentMonth,
          profit: dayData?.profit || 0,
          trades: dayData?.trades || [],
          hasActivity: Boolean(dayData),
          dayOfWeek: dayOfWeek // Add day of week for positioning
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Now we need to create a proper grid with empty slots for proper positioning
    const weeks = []
    let currentWeek = new Array(5).fill(null) // Mon, Tue, Wed, Thu, Fri
    
    days.forEach(day => {
      const position = day.dayOfWeek - 1 // Convert 1-5 to 0-4 (Mon-Fri)
      currentWeek[position] = day
      
      // If it's Friday or the last day, push the week and start a new one
      if (day.dayOfWeek === 5 || day === days[days.length - 1]) {
        weeks.push([...currentWeek])
        currentWeek = new Array(5).fill(null)
      }
    })
    
    // Flatten weeks back to a single array for rendering
    return weeks.flat()
  }, [monthData, dailyData])

  if (!monthData) return null

  // A more readable month format, adding '-02' to avoid timezone issues.
  const formattedMonth = new Date(monthData.month + "-02").toLocaleString("default", { month: "long", year: "numeric" })

  const renderSummaryView = () => (
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
  )

  const renderCalendarView = () => (
    <div className="mt-4">
      {/* Calendar header */}
      <div className="grid grid-cols-5 gap-1 mb-2 text-xs font-medium text-gray-600">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
          <div key={day} className="text-center p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-1">
        {calendarDays.map((day, index) => {
          // Handle empty slots in the grid
          if (!day) {
            return (
              <div
                key={index}
                className="min-h-[60px] md:min-h-[80px] p-1 border border-transparent rounded-sm"
              />
            )
          }
          
          const hasProfit = day.profit > 0
          const hasLoss = day.profit < 0
          
          return (
            <div
              key={index}
              className={`
                relative min-h-[60px] md:min-h-[80px] p-1 border border-gray-200 rounded-sm flex flex-col
                ${!day.isCurrentMonth ? 'bg-gray-100 text-gray-500' : 'bg-white'}
                ${day.hasActivity ? 'ring-2 ring-inset' : ''}
                ${hasProfit ? 'ring-green-300 bg-green-50' : ''}
                ${hasLoss ? 'ring-red-300 bg-red-50' : ''}
                ${day.hasActivity && day.profit === 0 ? 'ring-gray-300 bg-gray-50' : ''}
              `}
            >
              {/* Date number */}
              <div className="text-xs font-medium flex-shrink-0">
                {day.date.getDate()}
              </div>
              
              {/* Profit/Loss amount */}
              {day.hasActivity && (
                <div className="text-xs mt-1 flex-grow flex flex-col justify-center min-h-0">
                  <div className={`font-semibold leading-tight break-all text-[10px] md:text-xs ${
                    hasProfit ? 'text-green-700' : hasLoss ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {hasProfit ? '+' : ''}{formatCurrency(day.profit, accountCurrency, true)}
                  </div>
                  <div className="text-gray-500 text-[9px] md:text-[10px] leading-tight">
                    {day.trades.length} trade{day.trades.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-green-300 bg-green-50 rounded"></div>
          <span>Profitable Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-red-300 bg-red-50 rounded"></div>
          <span>Loss Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-gray-300 bg-gray-50 rounded"></div>
          <span>Break-even Day</span>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Performance for {formattedMonth}</DialogTitle>
          <DialogDescription>A detailed breakdown of your trading performance for this month.</DialogDescription>
        </DialogHeader>
        
        {/* View toggle buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={viewMode === 'summary' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('summary')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Summary
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
        </div>
        
        {viewMode === 'summary' ? renderSummaryView() : renderCalendarView()}
      </DialogContent>
    </Dialog>
  )
}