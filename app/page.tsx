'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountDashboard } from './components/AccountDashboard';
import { AccountSelector } from './components/AccountSelector';
import { getAccounts, getAccount } from '@/services/api';
import type { TradingAccount } from '@/lib/types';

import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accountId = searchParams.get('accountId');

    const initialize = async () => {
      setLoading(true);
      try {
        if (accountId) {
          const account = await getAccount(accountId);
          setAccounts([account]);
          setSelectedAccountId(account.id);
        } else {
          const fetchedAccounts = await getAccounts();
          setAccounts(fetchedAccounts);

          if (fetchedAccounts.length === 0) {
            router.push('/accounts/new');
          } else {
            setSelectedAccountId(fetchedAccounts[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to initialize page:', error);
        // Optionally, redirect to an error page or show a message
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [searchParams, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (accounts.length > 1 && !selectedAccountId) {
    return <AccountSelector accounts={accounts} onAccountSelected={setSelectedAccountId} />;
  }

  if (selectedAccountId) {
    return <AccountDashboard accountId={selectedAccountId} />;
  }

  return null; // Should not be reached if logic is correct
}
