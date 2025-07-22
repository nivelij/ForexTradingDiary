"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import type { TradingAccount } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { getAccounts, createTrade } from "@/services/api"
import { mapApiAccountsToTradingAccounts } from "@/lib/mappers"
import { storage } from "@/lib/storage"
import { CURRENCY_PAIRS } from "@/lib/constants"
import { handleApiError, handleTradeError } from "@/lib/error-utils"
import { Upload, X, Image as ImageIcon } from "lucide-react"


interface TradeFormData {
  accountId: string
  currencyPair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profitLoss: string
  retrospective: string
  screenshots: File[]
  screenshotFileNames: string[]
  openDate: Date
}

export default function NewTradePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [formData, setFormData] = useState<TradeFormData>({
    accountId: searchParams.get("accountId") || "",
    currencyPair: "",
    direction: "BUY",
    rationale: "",
    outcome: "OPEN",
    profitLoss: "",
    retrospective: "",
    screenshots: [],
    screenshotFileNames: [],
    openDate: new Date(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const apiAccounts = await getAccounts()
        const mappedAccounts = mapApiAccountsToTradingAccounts(apiAccounts)
        setAccounts(mappedAccounts)

        if (mappedAccounts.length === 1 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: mappedAccounts[0].id }))
        }
      } catch (error) {
        handleApiError(error, 'load accounts')
        // Fallback to local storage if API fails
        const loadedAccounts = storage.getAccounts()
        setAccounts(loadedAccounts)

        if (loadedAccounts.length === 1 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: loadedAccounts[0].id }))
        }
      }
    }

    loadAccounts()
  }, [])

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

    const fileNames = imageFiles.map((file) => file.name)
    setFormData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, ...imageFiles],
      screenshotFileNames: [...prev.screenshotFileNames, ...fileNames],
    }))
  }

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
      screenshotFileNames: prev.screenshotFileNames.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.accountId || !formData.currencyPair || !formData.rationale) {
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
      await createTrade(tradeData)

      toast({
        title: "Trade recorded",
        description: `${formData.direction} ${formData.currencyPair} trade has been recorded.`,
      })

      router.push("/")
    } catch (error) {
      handleTradeError(error, 'create trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to create a trading account before recording trades
            </p>
            <Button onClick={() => router.push("/accounts/new")}>Create Account</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record New Trade</h1>
        <p className="text-muted-foreground">Document your forex trade setup and outcome</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
          <CardDescription>Enter the complete details of your trade</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Trade Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="account">Account *</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      {accounts.find(acc => acc.id === formData.accountId)?.currency || ''}
                    </div>
                  </div>
                </div>
              )}

              {formData.outcome !== "OPEN" && (
                <div className="space-y-2">
                  <Label htmlFor="postTradeAnalysis">Post-Trade Analysis *</Label>
                  <Textarea
                    id="postTradeAnalysis"
                    placeholder="Reflect on the trade execution, what went well, what could be improved, and lessons learned..."
                    value={formData.retrospective}
                    onChange={(e) => setFormData({ ...formData, retrospective: e.target.value })}
                    rows={4}
                    required
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Trade"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
