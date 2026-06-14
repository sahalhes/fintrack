'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useCurrency } from '@/context/CurrencyContext';
import { useTransactions } from '@/context/TransactionContext';
import { TRANSACTION_CATEGORIES, type TransactionType } from '@/types/transaction';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

type FilterMode = 'category' | 'date';

export const TransactionTracker = () => {
  const { formatCurrency } = useCurrency();
  const { transactions, addTransaction, deleteTransaction, isLoading } = useTransactions();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>(TRANSACTION_CATEGORIES[1]);
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const effectiveCategory = category === 'Custom' ? customCategory.trim() : category;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filterMode === 'category' && selectedCategory !== 'All' && transaction.category !== selectedCategory) {
        return false;
      }

      if (filterMode === 'date') {
        const transactionDate = transaction.date.toISOString().split('T')[0];
        if (startDate && transactionDate < startDate) return false;
        if (endDate && transactionDate > endDate) return false;
      }

      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, filterMode, selectedCategory, startDate, endDate]);

  const summary = useMemo(() => {
    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const net = income - expense;

    const spendingByCategory = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const topSpendingCategory = Object.entries(spendingByCategory)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      income,
      expense,
      net,
      topSpendingCategory,
      spendingByCategory,
    };
  }, [transactions]);

  const chartData = useMemo(() => ({
    labels: Object.keys(summary.spendingByCategory),
    datasets: [
      {
        label: 'Spending',
        data: Object.values(summary.spendingByCategory),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  }), [summary.spendingByCategory]);

  const netBalanceChartData = useMemo(() => {
    const daily = transactions
      .slice()
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .reduce((acc, transaction) => {
        const dateKey = transaction.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
          acc[dateKey].income += transaction.amount;
        } else {
          acc[dateKey].expense += transaction.amount;
        }
        return acc;
      }, {} as Record<string, { income: number; expense: number }>);

    const labels = Object.keys(daily).sort();
    let runningNet = 0;

    return {
      labels,
      datasets: [
        {
          label: 'Net Balance',
          data: labels.map((label) => {
            runningNet += (daily[label]?.income || 0) - (daily[label]?.expense || 0);
            return runningNet;
          }),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [transactions]);

  const insight = useMemo(() => {
    if (!transactions.length) return 'Add a few transactions to see a spending insight.';
    if (summary.expense === 0) return 'No expenses yet, which keeps your net balance positive.';
    if (summary.income > summary.expense) return 'Your income is currently ahead of your spending.';
    if (summary.topSpendingCategory) {
      return `Your highest spending category is ${summary.topSpendingCategory[0]}.`;
    }
    return 'Your spending is spread evenly across categories.';
  }, [transactions.length, summary.expense, summary.income, summary.topSpendingCategory]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !effectiveCategory) return;

    addTransaction({
      amount: parsedAmount,
      category: effectiveCategory,
      type,
      date: new Date(date),
      note: note.trim() || undefined,
    });

    setAmount('');
    setCategory(TRANSACTION_CATEGORIES[1]);
    setCustomCategory('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };

  if (isLoading) {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-2">Personal Finance Tracker</h1>
          <p className="text-gray-600 dark:text-neutral-400">Log transactions, review spending, and keep the layout simple.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Amount</label>
            <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Type</label>
            <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Category</label>
            <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" value={category} onChange={(e) => setCategory(e.target.value)}>
              {TRANSACTION_CATEGORIES.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Date</label>
            <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          {category === 'Custom' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Custom category</label>
              <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="e.g. Books" required />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Note</label>
            <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors" type="submit">Add Transaction</button>
          </div>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-800 dark:text-blue-300">Total income</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(summary.income)}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-800 dark:text-red-300">Total expense</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(summary.expense)}</div>
        </div>
        <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-gray-200 dark:border-neutral-600">
          <div className="text-sm text-gray-800 dark:text-neutral-200">Net balance</div>
          <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(summary.net)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-800 dark:text-green-300">Top spending category</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.topSpendingCategory ? summary.topSpendingCategory[0] : 'None'}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-col sm:flex-row">
          <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100">Spending by category</h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Simple bar chart for expense categories.</p>
        </div>
        {Object.keys(summary.spendingByCategory).length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-neutral-400">No expense data yet.</div>
        ) : (
          <div className="h-80">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } } }} />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-col sm:flex-row">
          <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100">Net Balance Over Time</h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Cumulative income minus expense.</p>
        </div>
        {netBalanceChartData.labels.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-neutral-400">No transaction history yet.</div>
        ) : (
          <div className="h-80">
            <Line
              data={netBalanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { ticks: { color: '#6b7280' } },
                  y: {
                    ticks: {
                      color: '#6b7280',
                      callback: function (value: number | string) {
                        return formatCurrency(Number(value));
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100 mb-2">Insight</h2>
        <p className="text-gray-600 dark:text-neutral-400">{insight}</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-col sm:flex-row">
          <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-100">Transactions</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFilterMode('category')} className={`px-3 py-1 rounded-md text-sm ${filterMode === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200'}`}>Category</button>
            <button type="button" onClick={() => setFilterMode('date')} className={`px-3 py-1 rounded-md text-sm ${filterMode === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200'}`}>Date range</button>
          </div>
        </div>

        {filterMode === 'category' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Filter by category</label>
            <select className="w-full md:w-80 px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All</option>
              {[...new Set(transactions.map(transaction => transaction.category))].map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">Start date</label>
              <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-neutral-300">End date</label>
              <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-neutral-400">No transactions yet.</div>
          ) : filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-gray-50 dark:bg-neutral-700/50">
              <div>
                <div className="font-medium text-gray-800 dark:text-neutral-200">{transaction.category} {transaction.note ? `- ${transaction.note}` : ''}</div>
                <div className="text-sm text-gray-500 dark:text-neutral-400">{transaction.date.toLocaleDateString()} · {transaction.type}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</div>
                <button type="button" onClick={() => deleteTransaction(transaction.id)} className="text-sm text-gray-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
