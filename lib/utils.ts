import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string, abbreviated: boolean = false): string {
  if (abbreviated && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 1,
    })
    return formatter.format(amount)
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function generateId(): string {
  return crypto.randomUUID()
}
