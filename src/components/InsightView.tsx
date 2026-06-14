'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { useTransactions } from '@/context/TransactionContext';

type InsightResponse = {
  insight?: string;
  error?: string;
};

export const InsightView = () => {
  const { formatCurrency } = useCurrency();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const [data, setData] = useState<InsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const spendingByCategory = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(spendingByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const recentTransactions = transactions
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 12)
      .map((transaction) => ({
        category: transaction.category,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date.toISOString(),
      }));

    return {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      topCategories,
      recentTransactions,
    };
  }, [transactions]);

  useEffect(() => {
    if (isTransactionsLoading) return;

    let isMounted = true;

    const loadInsight = async () => {
      try {
        const response = await fetch('/api/insight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ summary }),
        });
        const json = (await response.json()) as InsightResponse;
        if (!isMounted) return;

        if (!response.ok) {
          setError(json.error || 'Unable to load insights.');
          setData(json);
        } else {
          setData(json);
          setError('');
        }
      } catch {
        if (isMounted) {
          setError('Unable to load insights.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInsight();

    return () => {
      isMounted = false;
    };
  }, [isTransactionsLoading, summary]);

  if (isTransactionsLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
          <div className="text-center py-12 text-gray-500 dark:text-neutral-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-2">Insight</h1>
          <p className="text-gray-600 dark:text-neutral-400">Simple AI summary of your recent spending.</p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500 dark:text-neutral-400">Loading insight...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-800 dark:text-blue-300">Income</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(summary.totalIncome)}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-800 dark:text-red-300">Expense</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(summary.totalExpense)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-gray-200 dark:border-neutral-600">
                <div className="text-sm text-gray-800 dark:text-neutral-200">Net</div>
                <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(summary.net)}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-800 dark:text-green-300">Top category</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.topCategories[0]?.category || 'None'}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 border dark:border-neutral-600">
              <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100 mb-3">AI insight</h2>
              <p className="text-gray-700 dark:text-neutral-300 whitespace-pre-line">{data?.insight || error || 'No insight available.'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 border dark:border-neutral-600">
              <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100 mb-3">Top spending</h2>
              {summary.topCategories.length ? (
                <div className="space-y-2">
                  {summary.topCategories.map((item) => (
                    <div key={item.category} className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-md px-3 py-2">
                      <span className="text-gray-700 dark:text-neutral-200">{item.category}</span>
                      <span className="font-semibold text-gray-900 dark:text-neutral-100">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-neutral-400">No expense data yet.</div>
              )}
            </div>

            {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
};
