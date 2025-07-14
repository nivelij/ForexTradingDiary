"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { TradingAccount } from "@/lib/types"
import { storage } from "@/lib/storage"

interface AccountSelectorProps {
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}

export function AccountSelector({ selectedAccountId, onAccountChange }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])

  useEffect(() => {
    setAccounts(storage.getAccounts())
  }, [])

  const handleAccountChange = (accountId: string) => {
    storage.setSelectedAccountId(accountId)
    onAccountChange(accountId)
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
    <div className="flex items-center gap-2">
      <Select value={selectedAccountId} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-[200px]">
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
      <Button variant="outline" size="sm" asChild>
        <Link href="/accounts">
          <Plus className="h-4 w-4 mr-2" />
          Manage
        </Link>
      </Button>
    </div>
  )
}
