import type { TradingAccount, Trade } from "./types"

/**
 * Maps API account response to TradingAccount interface
 */
export const mapApiAccountToTradingAccount = (apiAccount: any): TradingAccount => {
  return {
    id: apiAccount.id,
    name: apiAccount.name,
    currency: apiAccount.currency,
    initialBalance: parseFloat(apiAccount.initial_balance),
    currentBalance: parseFloat(apiAccount.current_balance),
    createdAt: apiAccount.created_at,
  }
}

/**
 * Maps API trade response to Trade interface
 */
export const mapApiTradeToTrade = (apiTrade: any): Trade => {
  return {
    id: apiTrade.id,
    accountId: apiTrade.account_id,
    currencyPair: apiTrade.currency_pair,
    direction: apiTrade.direction,
    rationale: apiTrade.rationale,
    outcome: apiTrade.outcome,
    profitLoss: apiTrade.profit_loss ? parseFloat(apiTrade.profit_loss) : undefined,
    retrospective: apiTrade.retrospective,
    screenshots: [], // API doesn't include screenshots yet
    openDate: apiTrade.created_at,
    createdAt: apiTrade.created_at,
    updatedAt: apiTrade.updated_at,
  }
}

/**
 * Maps array of API accounts to TradingAccount array
 */
export const mapApiAccountsToTradingAccounts = (apiAccounts: any[]): TradingAccount[] => {
  return apiAccounts.map(mapApiAccountToTradingAccount)
}

/**
 * Maps array of API trades to Trade array
 */
export const mapApiTradesToTrades = (apiTrades: any[]): Trade[] => {
  return apiTrades.map(mapApiTradeToTrade)
}

/**
 * Filters and maps API trades by account ID
 */
export const mapApiTradesForAccount = (apiTrades: any[], accountId: string): Trade[] => {
  const filteredTrades = apiTrades.filter((trade: any) => trade.account_id === accountId)
  return mapApiTradesToTrades(filteredTrades)
}