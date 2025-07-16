"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { TradingAccount } from "@/lib/types"
import { getAccounts } from "@/services/api"

interface AccountSelectorProps {
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}

export function AccountSelector({ selectedAccountId, onAccountChange }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const apiAccounts = await getAccounts()
        setAccounts(apiAccounts || [])
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
        setAccounts([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAccounts()
  }, [])

  const handleAccountChange = (accountId: string) => {
    onAccountChange(accountId)
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full md:w-[200px]" />
  }

  if (accounts.length === 0) {
    return (
      <Button asChild size="sm">
        <Link href="/accounts/new">
          <Plus className="h-4 w-4 mr-2" />
          Create Account
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Select value={selectedAccountId} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} ({account.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
