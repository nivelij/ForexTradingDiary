export interface TradingAccount {
  id: string
  name: string
  currency: string
  initialBalance: number
  currentBalance: number
  createdAt: string
}

export interface Trade {
  id: string
  accountId: string
  currencyPair: string
  direction: "BUY" | "SELL"
  rationale: string
  outcome: "OPEN" | "WIN" | "LOSS" | "BREAK_EVEN"
  profitLoss?: number
  retrospective?: string
  screenshots: string[]
  createdAt: string
  updatedAt: string
}

export interface TradeFormData {
  accountId: string
  currencyPair: string
  direction: "BUY" | "SELL"
  rationale: string
  screenshots: File[]
}

export interface TradeUpdateData {
  outcome: "WIN" | "LOSS" | "BREAK_EVEN"
  profitLoss: number
  retrospective: string
}
