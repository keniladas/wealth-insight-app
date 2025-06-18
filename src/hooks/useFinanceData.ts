
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

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance_transactions');
    const savedBudgets = localStorage.getItem('finance_budgets');
    const savedInvestments = localStorage.getItem('finance_investments');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finance_investments', JSON.stringify(investments));
  }, [investments]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      setBudgets(prev => 
        prev.map(budget => 
          budget.category === transaction.category && 
          budget.month === new Date(transaction.date).toISOString().slice(0, 7)
            ? { ...budget, spent: budget.spent + transaction.amount }
            : budget
        )
      );
    }
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
    };
    setBudgets(prev => [newBudget, ...prev]);
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'current_value'>) => {
    const newInvestment = {
      ...investment,
      id: Date.now().toString(),
      current_value: investment.amount * (1 + investment.return_rate / 100),
    };
    setInvestments(prev => [newInvestment, ...prev]);
  };

  return {
    transactions,
    budgets,
    investments,
    addTransaction,
    addBudget,
    addInvestment,
  };
};
