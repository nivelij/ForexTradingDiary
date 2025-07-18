"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useAccount } from "@/contexts/AccountContext"

interface AccountSelectorProps {
  selectedAccountId: string
  onAccountChange: (accountId: string | null) => void
}

export function AccountSelector({ selectedAccountId, onAccountChange }: AccountSelectorProps) {
  const { accounts, loading } = useAccount()

  const handleAccountChange = (accountId: string) => {
    onAccountChange(accountId)
  }

  if (loading) {
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
