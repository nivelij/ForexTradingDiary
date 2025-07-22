"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import type { TradingAccount } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { createTrade } from "@/services/api"
import { Upload, X } from "lucide-react"
import { CURRENCY_PAIRS } from "@/lib/constants"
import { validateTradeForm } from "@/lib/validation"
import { handleValidationError } from "@/lib/error-utils"


interface TradeFormData {
  accountId: string
  currencyPair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profitLoss: string
  retrospective: string
  screenshots: File[]
  openDate: Date
}

interface NewTradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  account: TradingAccount
  onTradeCreated?: () => void
}

export function NewTradeModal({ open, onOpenChange, accountId, account, onTradeCreated }: NewTradeModalProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState<TradeFormData>({
    accountId: accountId,
    currencyPair: "",
    direction: "BUY",
    rationale: "",
    outcome: "OPEN",
    profitLoss: "",
    retrospective: "",
    screenshots: [],
    openDate: new Date(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed.",
        variant: "destructive",
      })
    }

    setFormData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...imageFiles],
    }))
  }

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currencyPair || !formData.rationale) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate outcome-specific fields
    if (formData.outcome !== "OPEN" && formData.outcome !== "BREAK_EVEN") {
      if (!formData.profitLoss) {
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
      // Prepare profit/loss based on outcome
      let profitLoss: number | undefined
      if (formData.outcome !== "OPEN" && formData.outcome !== "BREAK_EVEN") {
        profitLoss = Number.parseFloat(formData.profitLoss) || 0
      } else if (formData.outcome === "BREAK_EVEN") {
        profitLoss = 0
      }

      // Prepare API payload
      const tradeData = {
        account_id: formData.accountId,
        currency_pair: formData.currencyPair,
        direction: formData.direction,
        rationale: formData.rationale,
        outcome: formData.outcome,
        profit_loss: profitLoss,
        retrospective: formData.retrospective || undefined,
        created_at: formData.openDate.toISOString().split('T')[0],
      }

      // Submit to API
      const createdTrade = await createTrade(tradeData)

      toast({
        title: "Trade recorded",
        description: `${formData.direction} ${formData.currencyPair} trade has been recorded.`,
      })

      // Reset form
      setFormData({
        accountId: accountId,
        currencyPair: "",
        direction: "BUY",
        rationale: "",
        outcome: "OPEN",
        profitLoss: "",
        retrospective: "",
        screenshots: [],
        openDate: new Date(),
      })

      onOpenChange(false)
      onTradeCreated?.()
    } catch (error) {
      console.error("Error creating trade:", error)
      toast({
        title: "Error",
        description: "Failed to save trade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Trade</DialogTitle>
          <DialogDescription>
            Document your forex trade for {account.name} ({account.currency})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Trade Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openDate">Open Date *</Label>
                <DatePicker
                  date={formData.openDate}
                  onDateChange={(date) => setFormData({ ...formData, openDate: date || new Date() })}
                  placeholder="Select date"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currencyPair">Currency Pair *</Label>
                  <div className="sm:hidden">
                    <select
                      id="currencyPair"
                      value={formData.currencyPair}
                      onChange={(e) => setFormData({ ...formData, currencyPair: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select pair</option>
                      {CURRENCY_PAIRS.map((pair) => (
                        <option key={pair} value={pair}>
                          {pair}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:block">
                    <Select
                      value={formData.currencyPair}
                      onValueChange={(value) => setFormData({ ...formData, currencyPair: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_PAIRS.map((pair) => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction">Plan / Direction *</Label>
                  <div className="sm:hidden">
                    <select
                      id="direction"
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value as "BUY" | "SELL" })}
                      required
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="BUY">BUY (Long)</option>
                      <option value="SELL">SELL (Short)</option>
                    </select>
                  </div>
                  <div className="hidden sm:block">
                    <Select
                      value={formData.direction}
                      onValueChange={(value: "BUY" | "SELL") => setFormData({ ...formData, direction: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY (Long)</SelectItem>
                        <SelectItem value="SELL">SELL (Short)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale *</Label>
              <Textarea
                id="rationale"
                placeholder="Describe your strategy, setup, and reasons for entering this trade..."
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Trade Outcome */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trade Outcome</h3>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome Status *</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN") =>
                  setFormData({ ...formData, outcome: value })
                }
                required
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="retrospective">Retrospective (Optional)</Label>
              <Textarea
                id="retrospective"
                placeholder="Reflect on your trading plan, setup, or any observations..."
                value={formData.retrospective}
                onChange={(e) => setFormData({ ...formData, retrospective: e.target.value })}
                rows={3}
              />
            </div>

            {formData.outcome !== "OPEN" && formData.outcome !== "BREAK_EVEN" && (
              <div className="space-y-2">
                <Label htmlFor="profitLoss">P/L *</Label>
                <div className="relative">
                  <Input
                    id="profitLoss"
                    type="number"
                    step="0.01"
                    value={formData.profitLoss}
                    onChange={(e) => setFormData({ ...formData, profitLoss: e.target.value })}
                    placeholder="e.g., 150.00 or -75.50"
                    required
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {account.currency}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Screenshots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Screenshots (Optional)</h3>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
              <Label htmlFor="file-upload" className="cursor-pointer block">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-foreground">Upload chart screenshots</span>
                    <span className="mt-1 block text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</span>
                    <span className="mt-2 block text-xs text-primary">Click here to browse files</span>
                  </div>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </Label>
            </div>

            {formData.screenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formData.screenshots.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeScreenshot(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Trade"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}