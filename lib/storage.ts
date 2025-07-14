"use client"

import type { TradingAccount, Trade } from "./types"

const ACCOUNTS_KEY = "forex-trading-accounts"
const TRADES_KEY = "forex-trading-trades"
const SELECTED_ACCOUNT_KEY = "forex-selected-account"

export const storage = {
  // Account Selection
  getSelectedAccountId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(SELECTED_ACCOUNT_KEY)
  },

  setSelectedAccountId(accountId: string): void {
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId)
  },

  clearSelectedAccountId(): void {
    localStorage.removeItem(SELECTED_ACCOUNT_KEY)
  },

  // Accounts
  getAccounts(): TradingAccount[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(ACCOUNTS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveAccount(account: TradingAccount): void {
    const accounts = this.getAccounts()
    const existingIndex = accounts.findIndex((a) => a.id === account.id)

    if (existingIndex >= 0) {
      accounts[existingIndex] = account
    } else {
      accounts.push(account)
    }

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  },

  deleteAccount(accountId: string): void {
    const accounts = this.getAccounts().filter((a) => a.id !== accountId)
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))

    // Also delete all trades for this account
    const trades = this.getTrades().filter((t) => t.accountId !== accountId)
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades))

    // Clear selected account if it was deleted
    if (this.getSelectedAccountId() === accountId) {
      this.clearSelectedAccountId()
    }
  },

  // Trades
  getTrades(): Trade[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(TRADES_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTrade(trade: Trade): void {
    const trades = this.getTrades()
    const existingIndex = trades.findIndex((t) => t.id === trade.id)

    if (existingIndex >= 0) {
      trades[existingIndex] = trade
    } else {
      trades.push(trade)
    }

    localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
  },

  deleteTrade(tradeId: string): void {
    const trades = this.getTrades().filter((t) => t.id !== tradeId)
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
  },

  // Utility methods
  getTradesByAccount(accountId: string): Trade[] {
    return this.getTrades().filter((trade) => trade.accountId === accountId)
  },

  updateAccountBalance(accountId: string, newBalance: number): void {
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.id === accountId)
    if (account) {
      account.currentBalance = newBalance
      this.saveAccount(account)
    }
  },
}
