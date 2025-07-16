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
import type { TradingAccount, Trade } from "@/lib/types"
import { storage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

const commonPairs = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
  "CHF/JPY",
  "EUR/CHF",
  "AUD/JPY",
  "GBP/CHF",
  "EUR/AUD",
  "GBP/AUD",
  "AUD/CAD",
  "EUR/CAD",
  "GBP/CAD",
  "CAD/JPY",
]

interface TradeFormData {
  accountId: string
  currencyPair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profitLoss: string
  retrospective: string
  screenshots: File[]
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
    if (formData.outcome !== "OPEN") {
      if (!formData.profitLoss) {
        toast({
          title: "Error",
          description: "Please provide P/L amount for closed trades.",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Convert files to base64 for storage
      const screenshotUrls: string[] = []
      for (const file of formData.screenshots) {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        screenshotUrls.push(base64)
      }

      const profitLoss = formData.outcome !== "OPEN" ? Number.parseFloat(formData.profitLoss) || 0 : undefined

      const newTrade: Trade = {
        id: crypto.randomUUID(),
        accountId: formData.accountId,
        currencyPair: formData.currencyPair,
        direction: formData.direction,
        rationale: formData.rationale,
        outcome: formData.outcome,
        profitLoss,
        retrospective: formData.retrospective || undefined,
        screenshots: screenshotUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      storage.saveTrade(newTrade)

      // Update account balance if trade is closed
      if (formData.outcome !== "OPEN" && profitLoss !== undefined) {
        const newBalance = account.currentBalance + profitLoss
        storage.updateAccountBalance(account.id, newBalance)
      }

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
      })

      onOpenChange(false)
      onTradeCreated?.()
    } catch (error) {
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currencyPair">Currency Pair *</Label>
                <Select
                  value={formData.currencyPair}
                  onValueChange={(value) => setFormData({ ...formData, currencyPair: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonPairs.map((pair) => (
                      <SelectItem key={pair} value={pair}>
                        {pair}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Plan / Direction *</Label>
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

            {formData.outcome !== "OPEN" && (
              <div className="space-y-2">
                <Label htmlFor="profitLoss">
                  P/L (Profit/Loss) *
                  <span className="text-sm text-muted-foreground ml-1">
                    (Positive for profit, negative for loss)
                  </span>
                </Label>
                <Input
                  id="profitLoss"
                  type="number"
                  step="0.01"
                  value={formData.profitLoss}
                  onChange={(e) => setFormData({ ...formData, profitLoss: e.target.value })}
                  placeholder="e.g., 150.00 or -75.50"
                  required={formData.outcome !== "OPEN"}
                />
              </div>
            )}
          </div>

          {/* Screenshots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Screenshots (Optional)</h3>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-foreground">Upload chart screenshots</span>
                    <span className="mt-1 block text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              </div>
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