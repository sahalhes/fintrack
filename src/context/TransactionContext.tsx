'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { allowCloudSync, isCloudSyncAllowed } from '@/lib/offline';
import { Transaction } from '@/types/transaction';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (transactionId: string) => void;
  importTransactions: (entries: Transaction[]) => void;
  clearAllTransactions: () => void;
  triggerCloudSync: () => Promise<void>;
  triggerRemoveCloudData: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');

    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions.map((transaction: Transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.createdAt),
      })));
    }

    if (!isCloudSyncAllowed()) {
      setIsLoading(false);
      return;
    }

    getUserCloudTransactions()
      .then((res: { transactions: Transaction[] } | null) => {
        if (res === null) {
          allowCloudSync(false);
        } else {
          setTransactions(res.transactions.map(transaction => ({
            ...transaction,
            date: new Date(transaction.date),
            createdAt: new Date(transaction.createdAt),
          })));
          localStorage.setItem('finance-transactions', JSON.stringify(res.transactions));
          allowCloudSync(true);
        }
      })
      .catch((error) => {
        console.error('Error fetching user transactions:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const getUserCloudTransactions = async (): Promise<{ transactions: Transaction[] } | null> => {
    const response = await fetch('/api/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const saveUserCloudTransactions = async (nextTransactions: Transaction[]) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactions: nextTransactions }),
    });

    if (!response.ok) {
      throw new Error('Failed to save user transactions');
    }
  };

  const deleteUserCloudTransactions = async (): Promise<void> => {
    const response = await fetch('/api/transactions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user transactions');
    }
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      if (isCloudSyncAllowed()) {
        saveUserCloudTransactions(updated);
      }
      return updated;
    });
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => {
      const updated = prev.filter(transaction => transaction.id !== transactionId);
      if (isCloudSyncAllowed()) {
        saveUserCloudTransactions(updated);
      }
      return updated;
    });
  };

  const importTransactions = (entries: Transaction[]) => {
    setTransactions(entries.map(entry => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt),
    })));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('finance-transactions');
    if (isCloudSyncAllowed()) {
      deleteUserCloudTransactions().catch((error) => {
        console.error('Failed to clear cloud transactions:', error);
      });
    }
  };

  const triggerCloudSync = () => saveUserCloudTransactions(transactions);

  const triggerRemoveCloudData = () => deleteUserCloudTransactions();

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction,
        deleteTransaction,
        importTransactions,
        clearAllTransactions,
        triggerCloudSync,
        triggerRemoveCloudData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
