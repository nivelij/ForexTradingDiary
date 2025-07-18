"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { updateTrade } from "@/services/api"

interface Trade {
  id: string
  id: string
  account_id: string
  currency_pair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profit_loss: string | null
  retrospective: string | null
  created_at: string
  updated_at: string
}

interface TradeDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trade: Trade | null
  accountCurrency: string
  onTradeUpdated?: () => void
}

interface TradeFormData {
  currency_pair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profit_loss: string
  retrospective: string
  created_at: Date
}

const getOutcomeBadgeVariant = (outcome: string) => {
  switch (outcome) {
    case "WIN":
      return "default" // Green
    case "LOSS":
      return "destructive" // Red
    case "OPEN":
      return "secondary" // Gray
    case "BREAK_EVEN":
      return "outline" // Neutral
    default:
      return "secondary"
  }
}

export function TradeDetailsModal({ open, onOpenChange, trade, accountCurrency, onTradeUpdated }: TradeDetailsModalProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TradeFormData>({
    currency_pair: "",
    direction: "BUY",
    rationale: "",
    outcome: "OPEN",
    profit_loss: "",
    retrospective: "",
    created_at: new Date(),
  })

  // Update form data when trade changes
  useEffect(() => {
    if (trade) {
      setFormData({
        currency_pair: trade.currency_pair,
        direction: trade.direction,
        rationale: trade.rationale,
        outcome: trade.outcome,
        profit_loss: trade.profit_loss || "",
        retrospective: trade.retrospective || "",
        created_at: new Date(trade.created_at),
      })
    }
  }, [trade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trade) return

    // Validate required fields
    if (!formData.rationale) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate outcome-specific fields
    if (formData.outcome !== "OPEN" && formData.outcome !== "BREAK_EVEN") {
      if (!formData.profit_loss) {
        toast({
          title: "Error",
          description: "Please provide P/L amount for trades with profit/loss.",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      await updateTrade(trade.id, {
        ...formData,
        profit_loss: formData.outcome === "OPEN" || formData.outcome === "BREAK_EVEN" ? null : parseFloat(formData.profit_loss),
      });
      
      toast({
        title: "Trade updated",
        description: "Trade has been updated successfully.",
      })

      setIsEditing(false)
      onTradeUpdated?.()
      onOpenChange(false) // Close the modal
    } catch (error) {
      console.error("Error updating trade:", error)
      toast({
        title: "Error",
        description: "Failed to update trade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsEditing(false)
    onOpenChange(false)
  }

  if (!trade) return null

  const isOpen = trade.outcome === "OPEN"
  const modalTitle = isOpen ? "Update Trade" : "Summary of Trade"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {isOpen ? "Update your trade details or close the position" : "View trade summary and details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{trade.currency_pair}</h3>
                <Badge variant={trade.direction === "BUY" ? "default" : "destructive"}>
                  {trade.direction}
                </Badge>
                <Badge variant={getOutcomeBadgeVariant(trade.outcome)}>
                  {trade.outcome}
                </Badge>
              </div>
              {isOpen && !isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Trade
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div>Last Updated: {trade.updated_at ? format(new Date(trade.updated_at), "PPP") : "Date not available"}</div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openDate">Open Date</Label>
              {isEditing ? (
                <DatePicker
                  date={formData.created_at}
                  onDateChange={(date) => setFormData({ ...formData, created_at: date || new Date() })}
                  placeholder="Select date"
                />
              ) : (
                <div className="p-2 bg-muted rounded">
                  {trade.created_at ? format(new Date(trade.created_at), "PPP") : "Date not available"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currencyPair">Currency Pair</Label>
                {isEditing ? (
                  <Input
                    id="currencyPair"
                    value={formData.currency_pair}
                    onChange={(e) => setFormData({ ...formData, currency_pair: e.target.value })}
                    required
                  />
                ) : (
                  <div className="p-2 bg-muted rounded">{trade.currency_pair}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                {isEditing ? (
                  <Select
                    value={formData.direction}
                    onValueChange={(value: "BUY" | "SELL") => setFormData({ ...formData, direction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY (Long)</SelectItem>
                      <SelectItem value="SELL">SELL (Short)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-muted rounded">{trade.direction}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale</Label>
              {isEditing ? (
                <Textarea
                  id="rationale"
                  value={formData.rationale}
                  onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                  rows={3}
                  required
                />
              ) : (
                <div className="p-2 bg-muted rounded whitespace-pre-wrap">{trade.rationale}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome Status</Label>
              {isEditing ? (
                <Select
                  value={formData.outcome}
                  onValueChange={(value: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN") => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open (Trade in progress)</SelectItem>
                    <SelectItem value="WIN">Win (Closed with profit)</SelectItem>
                    <SelectItem value="LOSS">Loss (Closed with loss)</SelectItem>
                    <SelectItem value="BREAK_EVEN">Break Even (Closed at entry)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-muted rounded">{trade.outcome}</div>
              )}
            </div>

            {(formData.outcome !== "OPEN" && formData.outcome !== "BREAK_EVEN") && (
              <div className="space-y-2">
                <Label htmlFor="profitLoss">P/L</Label>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id="profitLoss"
                      type="number"
                      step="0.01"
                      value={formData.profit_loss}
                      onChange={(e) => setFormData({ ...formData, profit_loss: e.target.value })}
                      placeholder="e.g., 150.00 or -75.50"
                      required
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {accountCurrency}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-muted rounded">
                    {trade.profit_loss ? `${trade.profit_loss} ${accountCurrency}` : "N/A"}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="retrospective">Retrospective</Label>
              {isEditing ? (
                <Textarea
                  id="retrospective"
                  value={formData.retrospective}
                  onChange={(e) => setFormData({ ...formData, retrospective: e.target.value })}
                  rows={3}
                />
              ) : (
                <div className="p-2 bg-muted rounded whitespace-pre-wrap">
                  {trade.retrospective || "No retrospective provided"}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {isEditing ? (
              <>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}