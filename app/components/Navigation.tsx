"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { AccountSelector } from "./AccountSelector"
import { Menu, Home, Settings } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Accounts", href: "/accounts", icon: Settings },
]

interface NavigationProps {
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}

export function Navigation({ selectedAccountId, onAccountChange }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 max-w-7xl">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/candlestick.png" alt="Trading Diary" width={24} height={24} className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Trading Diary</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Image src="/candlestick.png" alt="Trading Diary" width={24} height={24} className="h-6 w-6" />
              <span className="font-bold">Trading Diary</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center space-x-2 text-base font-medium transition-colors hover:text-foreground/80",
                      pathname === item.href ? "text-foreground" : "text-foreground/60",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <AccountSelector selectedAccountId={selectedAccountId} onAccountChange={onAccountChange} />
            </div>
            
          </div>
        </div>
      </div>
    </header>
  )
}
