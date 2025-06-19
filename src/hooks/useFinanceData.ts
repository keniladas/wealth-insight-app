// This file is deprecated - use useSupabaseFinanceData instead
// Keeping for backward compatibility during transition

import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface Investment {
  id: string;
  type: string;
  amount: number;
  date: string;
  return_rate: number;
  current_value: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: 'savings' | 'investment' | 'debt_payment' | 'emergency_fund' | 'other';
  description: string;
  created_date: string;
}

// Deprecated hook - kept for backward compatibility
export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  // Legacy localStorage functionality - will be removed
  useEffect(() => {
    console.warn('useFinanceData is deprecated. Please use useSupabaseFinanceData instead.');
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    console.warn('This function is deprecated. Use useSupabaseFinanceData instead.');
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    console.warn('This function is deprecated. Use useSupabaseFinanceData instead.');
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'current_value'>) => {
    console.warn('This function is deprecated. Use useSupabaseFinanceData instead.');
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'created_date'>) => {
    console.warn('This function is deprecated. Use useSupabaseFinanceData instead.');
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    console.warn('This function is deprecated. Use useSupabaseFinanceData instead.');
  };

  return {
    transactions,
    budgets,
    investments,
    goals,
    addTransaction,
    addBudget,
    addInvestment,
    addGoal,
    updateGoalProgress,
  };
};
