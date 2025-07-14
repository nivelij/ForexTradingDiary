"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Trade, TradingAccount, TradeUpdateData } from "@/lib/types"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpRight, ArrowDownRight, Calendar, DollarSign } from "lucide-react"

export default function TradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [account, setAccount] = useState<TradingAccount | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [updateData, setUpdateData] = useState<TradeUpdateData>({
    outcome: "WIN",
    profitLoss: 0,
    retrospective: "",
  })

  useEffect(() => {
    const tradeId = params.id as string
    const foundTrade = storage.getTrades().find((t) => t.id === tradeId)

    if (foundTrade) {
      setTrade(foundTrade)
      const foundAccount = storage.getAccounts().find((a) => a.id === foundTrade.accountId)
      setAccount(foundAccount || null)

      if (foundTrade.outcome !== "OPEN") {
        setUpdateData({
          outcome: foundTrade.outcome as "WIN" | "LOSS" | "BREAK_EVEN",
          profitLoss: foundTrade.profitLoss || 0,
          retrospective: foundTrade.retrospective || "",
        })
      }
    }
  }, [params.id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!trade || !account) return

    if (!updateData.retrospective.trim()) {
      toast({
        title: "Error",
        description: "Please provide a retrospective analysis.",
        variant: "destructive",
      })
      return
    }

    const updatedTrade: Trade = {
      ...trade,
      outcome: updateData.outcome,
      profitLoss: updateData.profitLoss,
      retrospective: updateData.retrospective,
      updatedAt: new Date().toISOString(),
    }

    // Update account balance
    const newBalance = account.currentBalance + updateData.profitLoss
    storage.updateAccountBalance(account.id, newBalance)

    storage.saveTrade(updatedTrade)
    setTrade(updatedTrade)
    setIsEditing(false)

    toast({
      title: "Trade updated",
      description: "Trade outcome and analysis have been saved.",
    })
  }

  const getOutcomeBadge = (outcome: Trade["outcome"]) => {
    const variants = {
      OPEN: "secondary",
      WIN: "default",
      LOSS: "destructive",
      BREAK_EVEN: "outline",
    } as const

    return <Badge variant={variants[outcome]}>{outcome.replace("_", " ")}</Badge>
  }

  if (!trade || !account) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Trade not found</h3>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Details</h1>
          <p className="text-muted-foreground">
            {trade.direction} {trade.currencyPair} • {account.name}
          </p>
        </div>
        {trade.outcome === "OPEN" && <Button onClick={() => setIsEditing(true)}>Close Trade</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {trade.direction === "BUY" ? (
                <ArrowUpRight className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <ArrowDownRight className="h-5 w-5 mr-2 text-red-600" />
              )}
              Trade Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Currency Pair</span>
              <span className="font-semibold">{trade.currencyPair}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Direction</span>
              <Badge variant={trade.direction === "BUY" ? "default" : "secondary"}>{trade.direction}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              {getOutcomeBadge(trade.outcome)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(trade.createdAt).toLocaleDateString()}
              </div>
            </div>
            {trade.profitLoss !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">P/L</span>
                <div
                  className={`flex items-center font-semibold ${
                    trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(trade.profitLoss, account.currency)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{trade.rationale}</p>
          </CardContent>
        </Card>
      </div>

      {trade.screenshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {trade.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot || "/placeholder.svg"}
                  alt={`Trade screenshot ${index + 1}`}
                  className="w-full rounded-lg border"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {trade.retrospective && (
        <Card>
          <CardHeader>
            <CardTitle>Trade Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{trade.retrospective}</p>
          </CardContent>
        </Card>
      )}

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Close Trade</CardTitle>
            <CardDescription>Record the final outcome and your analysis of this trade</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select
                    value={updateData.outcome}
                    onValueChange={(value: "WIN" | "LOSS" | "BREAK_EVEN") =>
                      setUpdateData({ ...updateData, outcome: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WIN">Win</SelectItem>
                      <SelectItem value="LOSS">Loss</SelectItem>
                      <SelectItem value="BREAK_EVEN">Break Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profitLoss">Profit/Loss ({account.currency})</Label>
                  <Input
                    id="profitLoss"
                    type="number"
                    step="0.01"
                    value={updateData.profitLoss}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        profitLoss: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter P/L amount (positive or negative)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retrospective">Trade Analysis</Label>
                <Textarea
                  id="retrospective"
                  placeholder="Reflect on the trade execution, what went well, what could be improved, and lessons learned..."
                  value={updateData.retrospective}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      retrospective: e.target.value,
                    })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">Save Trade</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
