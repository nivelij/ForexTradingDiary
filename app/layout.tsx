import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppWrapper } from "./components/AppWrapper"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trading Diary",
  description: "Track and analyze your forex trading performance",
  generator: 'v0.dev',
  icons: {
    icon: "/candlestick.png",
    shortcut: "/candlestick.png",
    apple: "/candlestick.png"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <AppWrapper>{children}</AppWrapper>
          <Toaster />
      </body>
    </html>
  )
}

