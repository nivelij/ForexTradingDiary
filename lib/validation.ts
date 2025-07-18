import { CURRENCY_PAIRS, TRADE_DIRECTIONS, TRADE_OUTCOMES } from "./constants"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface TradeFormData {
  accountId: string
  currencyPair: string
  direction: string
  rationale: string
  outcome: string
  profitLoss: string
  retrospective: string
}

export interface AccountFormData {
  name: string
  currency: string
  initialBalance: string
}

/**
 * Validates trade form data
 */
export const validateTradeForm = (data: TradeFormData): ValidationResult => {
  const errors: string[] = []

  // Account ID validation
  if (!data.accountId || data.accountId.trim() === '') {
    errors.push('Account is required')
  }

  // Currency pair validation
  if (!data.currencyPair || data.currencyPair.trim() === '') {
    errors.push('Currency pair is required')
  } else if (!CURRENCY_PAIRS.includes(data.currencyPair as any)) {
    errors.push('Invalid currency pair')
  }

  // Direction validation
  if (!data.direction || data.direction.trim() === '') {
    errors.push('Direction is required')
  } else if (!TRADE_DIRECTIONS.includes(data.direction as any)) {
    errors.push('Invalid direction')
  }

  // Rationale validation
  if (!data.rationale || data.rationale.trim() === '') {
    errors.push('Rationale is required')
  } else if (data.rationale.trim().length < 10) {
    errors.push('Rationale must be at least 10 characters')
  }

  // Outcome validation
  if (!data.outcome || data.outcome.trim() === '') {
    errors.push('Outcome is required')
  } else if (!TRADE_OUTCOMES.includes(data.outcome as any)) {
    errors.push('Invalid outcome')
  }

  // Profit/Loss validation for closed trades
  if (data.outcome && data.outcome !== 'OPEN') {
    if (!data.profitLoss || data.profitLoss.trim() === '') {
      errors.push('Profit/Loss is required for closed trades')
    } else {
      const profitLossNum = parseFloat(data.profitLoss)
      if (isNaN(profitLossNum)) {
        errors.push('Profit/Loss must be a valid number')
      }
    }

    // Retrospective validation for closed trades
    if (!data.retrospective || data.retrospective.trim() === '') {
      errors.push('Retrospective is required for closed trades')
    } else if (data.retrospective.trim().length < 10) {
      errors.push('Retrospective must be at least 10 characters')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates account form data
 */
export const validateAccountForm = (data: AccountFormData): ValidationResult => {
  const errors: string[] = []

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.push('Account name is required')
  } else if (data.name.trim().length < 2) {
    errors.push('Account name must be at least 2 characters')
  }

  // Currency validation
  if (!data.currency || data.currency.trim() === '') {
    errors.push('Currency is required')
  } else if (data.currency.length !== 3) {
    errors.push('Currency must be a 3-letter code (e.g., USD, EUR)')
  }

  // Initial balance validation
  if (!data.initialBalance || data.initialBalance.trim() === '') {
    errors.push('Initial balance is required')
  } else {
    const balance = parseFloat(data.initialBalance)
    if (isNaN(balance)) {
      errors.push('Initial balance must be a valid number')
    } else if (balance < 0) {
      errors.push('Initial balance cannot be negative')
    } else if (balance > 1000000) {
      errors.push('Initial balance cannot exceed 1,000,000')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validates minimum length
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`
  }
  return null
}

/**
 * Validates maximum length
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`
  }
  return null
}

/**
 * Validates number format
 */
export const validateNumber = (value: string, fieldName: string): string | null => {
  if (value && isNaN(parseFloat(value))) {
    return `${fieldName} must be a valid number`
  }
  return null
}

/**
 * Validates positive number
 */
export const validatePositiveNumber = (value: string, fieldName: string): string | null => {
  const num = parseFloat(value)
  if (value && (!isNaN(num) && num < 0)) {
    return `${fieldName} must be a positive number`
  }
  return null
}