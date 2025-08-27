/**
 * Authentication utilities for the trading diary app
 * Note: This is a simple implementation for personal use only
 */

// Hardcoded credentials (for personal use only)
const VALID_USERNAME = 'hans'
const VALID_PASSWORD = 'password12345'
const AUTH_COOKIE_NAME = 'trading_diary_auth'
const COOKIE_DURATION_DAYS = 30

/**
 * Generate SHA-256 hash of the input string
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Generate the expected hash for validation
 */
async function getExpectedHash(): Promise<string> {
  return await sha256(`${VALID_USERNAME}:${VALID_PASSWORD}`)
}

/**
 * Validate user credentials against the expected hash
 */
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  if (username !== VALID_USERNAME) {
    return false
  }
  
  const inputHash = await sha256(`${username}:${password}`)
  const expectedHash = await getExpectedHash()
  
  return inputHash === expectedHash
}

/**
 * Set authentication cookie with 30-day expiration
 */
export function setAuthCookie(): void {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + COOKIE_DURATION_DAYS)
  
  document.cookie = `${AUTH_COOKIE_NAME}=authenticated; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
}

/**
 * Check if user is authenticated by checking the cookie
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false // Server-side rendering
  }
  
  const cookies = document.cookie.split(';')
  const authCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`)
  )
  
  return authCookie?.includes('authenticated') || false
}

/**
 * Remove authentication cookie (logout)
 */
export function removeAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

/**
 * Get current username (since we only have one user)
 */
export function getCurrentUser(): string {
  return VALID_USERNAME
}