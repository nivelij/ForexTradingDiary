"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Navigation } from "./Navigation"
import { AccountProvider, useAccount } from "@/contexts/AccountContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Loading } from "./Loading"

interface AppWrapperProps {
  children: React.ReactNode
}

const AppContent: React.FC<AppWrapperProps> = ({ children }) => {
  const { accounts, selectedAccountId, loading, selectAccount } = useAccount()
  const pathname = usePathname()

  if (loading) {
    return <Loading message="Loading accounts..." />
  }

  // Show account creation prompt if no accounts exist
  if (accounts.length === 0 && pathname !== "/accounts/new") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation selectedAccountId="" onAccountChange={selectAccount} />
        <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image src="/candlestick.png" alt="Trading Diary" width={48} height={48} className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Trading Diary</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first trading account to start tracking your forex trades
                </p>
                <Button asChild>
                  <Link href="/accounts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="border-t mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hans Kristanto
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation selectedAccountId={selectedAccountId || ''} onAccountChange={selectAccount} />
      <main className="w-full px-4 py-6 md:container md:mx-auto md:max-w-7xl flex-1">{children}</main>
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hans Kristanto
        </div>
      </footer>
    </div>
  )
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <AccountProvider>
      <AppContent>{children}</AppContent>
    </AccountProvider>
  )
}
