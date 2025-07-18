import { toast } from "@/hooks/use-toast"

export interface ErrorHandlerOptions {
  showToast?: boolean
  fallbackMessage?: string
  onError?: (error: Error) => void
}

/**
 * Standardized error handling utility
 */
export const handleError = (
  error: unknown,
  context: string,
  options: ErrorHandlerOptions = {}
): void => {
  const {
    showToast = true,
    fallbackMessage = "An unexpected error occurred",
    onError
  } = options

  // Convert error to Error object
  const errorObj = error instanceof Error ? error : new Error(String(error))
  
  // Log error for debugging
  console.error(`Error in ${context}:`, errorObj)
  
  // Show toast notification if enabled
  if (showToast) {
    toast({
      title: "Error",
      description: errorObj.message || fallbackMessage,
      variant: "destructive",
    })
  }
  
  // Execute custom error handler if provided
  if (onError) {
    onError(errorObj)
  }
}

/**
 * Generic API error handler
 */
export const handleApiError = (
  error: unknown,
  operation: string,
  fallbackAction?: () => void
): void => {
  handleError(error, `API ${operation}`, {
    fallbackMessage: `Failed to ${operation.toLowerCase()}. Please try again.`,
    onError: fallbackAction
  })
}

/**
 * Account-specific error handler
 */
export const handleAccountError = (
  error: unknown,
  operation: string,
  fallbackAccounts?: () => void
): void => {
  handleError(error, `Account ${operation}`, {
    fallbackMessage: `Failed to ${operation.toLowerCase()} accounts. Falling back to local storage.`,
    onError: fallbackAccounts
  })
}

/**
 * Trade-specific error handler
 */
export const handleTradeError = (
  error: unknown,
  operation: string,
  onRetry?: () => void
): void => {
  handleError(error, `Trade ${operation}`, {
    fallbackMessage: `Failed to ${operation.toLowerCase()} trade. Please try again.`,
    onError: onRetry
  })
}

/**
 * Form validation error handler
 */
export const handleValidationError = (
  fieldName: string,
  message: string
): void => {
  toast({
    title: "Validation Error",
    description: `${fieldName}: ${message}`,
    variant: "destructive",
  })
}

/**
 * Network error handler
 */
export const handleNetworkError = (
  error: unknown,
  operation: string,
  onRetry?: () => void
): void => {
  const isNetworkError = error instanceof TypeError && error.message.includes('fetch')
  
  if (isNetworkError) {
    handleError(error, `Network ${operation}`, {
      fallbackMessage: "Network error. Please check your connection and try again.",
      onError: onRetry
    })
  } else {
    handleError(error, operation, { onError: onRetry })
  }
}