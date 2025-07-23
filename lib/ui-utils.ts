import type { Trade } from "./types"

export type BadgeVariant = "secondary" | "default" | "destructive" | "outline" | "success"

/**
 * Returns the appropriate badge variant for a trade outcome
 */
export const getOutcomeBadgeVariant = (outcome: Trade["outcome"]): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    OPEN: "secondary",
    WIN: "success", 
    LOSS: "destructive",
    BREAK_EVEN: "outline",
  }
  
  return variants[outcome] || "secondary"
}

/**
 * Formats profit/loss amount with appropriate styling class
 */
export const formatProfitLoss = (amount: number): { 
  formatted: string; 
  className: string 
} => {
  const isProfit = amount >= 0
  return {
    formatted: isProfit ? `+${amount.toFixed(2)}` : amount.toFixed(2),
    className: isProfit ? 'text-green-600' : 'text-red-600'
  }
}

/**
 * Gets the display text for a trade outcome
 */
export const getOutcomeDisplayText = (outcome: Trade["outcome"]): string => {
  return outcome.replace("_", " ")
}

/**
 * Returns the appropriate CSS class for profit/loss display
 */
export const getProfitLossClassName = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600'
}

/**
 * Returns the appropriate CSS class for trade direction
 */
export const getDirectionClassName = (direction: Trade["direction"]): string => {
  return direction === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

/**
 * Returns the appropriate icon background class for trade direction
 */
export const getDirectionIconClassName = (direction: Trade["direction"]): string => {
  return direction === 'BUY' ? 'bg-green-100' : 'bg-red-100'
}

/**
 * Returns the appropriate icon color class for trade direction
 */
export const getDirectionIconColorClassName = (direction: Trade["direction"]): string => {
  return direction === 'BUY' ? 'text-green-600' : 'text-red-600'
}