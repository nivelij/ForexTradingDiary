'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AccountDashboard } from './components/AccountDashboard';
import { AccountSelector } from './components/AccountSelector';
import { getAccounts, getAccount } from '@/services/api';
import type { TradingAccount } from '@/lib/types';
import { Loading } from './components/Loading';
import { mapApiAccountToTradingAccount, mapApiAccountsToTradingAccounts } from '@/lib/mappers';

import { useSearchParams } from 'next/navigation';

// Mock data for dashboard assessment
const mockAccounts: TradingAccount[] = [
  {
    id: 'mock-account-1',
    name: 'Demo Trading Account',
    currency: 'USD',
    initialBalance: 10000,
    currentBalance: 12500,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'mock-account-2', 
    name: 'Live Trading Account',
    currency: 'EUR',
    initialBalance: 5000,
    currentBalance: 4800,
    createdAt: '2024-02-01T14:30:00Z',
  }
];

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
        // Use real API calls
        if (accountId) {
          const account = await getAccount(accountId);
          if (account) {
            // Map API response to TradingAccount format
            const mappedAccount = mapApiAccountToTradingAccount(account);
            setAccounts([mappedAccount]);
            setSelectedAccountId(mappedAccount.id);
          }
        } else {
          const fetchedAccounts = await getAccounts();
          if (fetchedAccounts && fetchedAccounts.length > 0) {
            // Map API response to TradingAccount format
            const mappedAccounts = mapApiAccountsToTradingAccounts(fetchedAccounts);
            setAccounts(mappedAccounts);
            setSelectedAccountId(mappedAccounts[0].id);
          }
        }
        
        // Fallback to mock data if API fails (commented out for now)
        // if (accountId) {
        //   const account = mockAccounts.find(acc => acc.id === accountId);
        //   if (account) {
        //     setAccounts([account]);
        //     setSelectedAccountId(account.id);
        //   }
        // } else {
        //   setAccounts(mockAccounts);
        //   if (mockAccounts.length > 0) {
        //     setSelectedAccountId(mockAccounts[0].id);
        //   }
        // }
      } catch (error) {
        console.error('Failed to initialize page:', error);
        // Fallback to mock data on error
        if (accountId) {
          const account = mockAccounts.find(acc => acc.id === accountId);
          if (account) {
            setAccounts([account]);
            setSelectedAccountId(account.id);
          }
        } else {
          setAccounts(mockAccounts);
          if (mockAccounts.length > 0) {
            setSelectedAccountId(mockAccounts[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [searchParams, router]);

  if (loading) {
    return <Loading message="Loading dashboard..." />;
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
    <Suspense fallback={<Loading />}>
      <HomePageContent />
    </Suspense>
  );
}
