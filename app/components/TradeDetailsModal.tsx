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
import { getOutcomeBadgeVariant, getOutcomeDisplayText } from "@/lib/ui-utils"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { handleFileChange as handleImageUpload } from "@/lib/image-utils"
import { ImagePreview } from "./ImagePreview"
import { TradingViewButton } from "./TradingViewButton"

interface Trade {
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
  screenshots: string[]
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
  screenshots: string[]
  screenshotFileNames: string[]
}


export function TradeDetailsModal({ open, onOpenChange, trade, accountCurrency, onTradeUpdated }: TradeDetailsModalProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [formData, setFormData] = useState<TradeFormData>({
    currency_pair: "",
    direction: "BUY",
    rationale: "",
    outcome: "OPEN",
    profit_loss: "",
    retrospective: "",
    created_at: new Date(),
    screenshots: [],
    screenshotFileNames: [],
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
        screenshots: trade.screenshots || [],
        screenshotFileNames: trade.screenshots?.map((_, i) => `screenshot_${i + 1}.png`) || [],
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
        screenshots: formData.screenshots.filter(s => s.startsWith('data:image/')), // Only send new base64 encoded screenshots
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setFormData, true)
  }

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
      screenshotFileNames: prev.screenshotFileNames.filter((_, i) => i !== index),
    }))
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
                  {getOutcomeDisplayText(trade.outcome)}
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

          {/* Screenshots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Screenshots</h3>
            {isEditing ? (
              <div>
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

                {formData.screenshotFileNames.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {formData.screenshotFileNames.map((fileName, index) => (
                      <div key={index} className="relative flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground truncate">{fileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={() => removeScreenshot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trade.screenshots && trade.screenshots.length > 0 ? (
                  trade.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="relative flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedImage(screenshot)
                        setIsPreviewOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground truncate">{`screenshot_${index + 1}.png`}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No screenshots available.</p>
                )}
              </div>
            )}
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
            {isOpen && !isEditing && (
              <TradingViewButton type="button" currencyPair={trade.currency_pair} />
            )}
          </div>
        </form>
      </DialogContent>
      <ImagePreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageUrl={selectedImage}
      />
    </Dialog>
  )
}