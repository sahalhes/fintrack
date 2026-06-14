'use client';

import { BalanceSheet } from '@/components/BalanceSheet';
import ClientOnly from '@/components/ClientOnly';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/context/AuthContext';

export default function BalanceSheetPage() {
  const { user, isLoading, isAuthConfigured } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
          <div className="text-center py-12 text-gray-500 dark:text-neutral-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user && isAuthConfigured) {
    return <LoginPage />;
  }

  return (
    <ClientOnly fallback={null}>
      <BalanceSheet />
    </ClientOnly>
  );
}
