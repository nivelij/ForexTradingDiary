
"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface TradingViewButtonProps {
  currencyPair: string
}

export const TradingViewButton: React.FC<TradingViewButtonProps> = ({ currencyPair }) => {
  const handleRedirect = () => {
    const symbol = currencyPair.replace("/", "")
    const url = `https://www.tradingview.com/chart/?symbol=ICMARKETS%3A${symbol}`
    window.open(url, "_blank")
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleRedirect}
      className="bg-black text-white text-sm px-4 py-2 rounded-lg border-2 border-gray-300 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      See at Tradingview
    </Button>
  )
}
