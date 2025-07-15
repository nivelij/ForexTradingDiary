'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AccountDashboard } from './components/AccountDashboard';
import { AccountSelector } from './components/AccountSelector';
import { getAccounts, getAccount } from '@/services/api';
import type { TradingAccount } from '@/lib/types';

import { useSearchParams } from 'next/navigation';

function HomePageContent() {
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

          if (fetchedAccounts && fetchedAccounts.length > 0) {
            setSelectedAccountId(fetchedAccounts[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to initialize page:', error);
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
    return <AccountSelector selectedAccountId={selectedAccountId || ""} onAccountChange={setSelectedAccountId} />;
  }

  if (selectedAccountId) {
    return <AccountDashboard accountId={selectedAccountId} />;
  }

  return null; // Should not be reached if logic is correct
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
