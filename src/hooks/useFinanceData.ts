
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

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance_transactions');
    const savedBudgets = localStorage.getItem('finance_budgets');
    const savedInvestments = localStorage.getItem('finance_investments');
    const savedGoals = localStorage.getItem('finance_goals');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
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

  useEffect(() => {
    localStorage.setItem('finance_goals', JSON.stringify(goals));
  }, [goals]);

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

  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'created_date'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, current_amount: Math.min(goal.current_amount + amount, goal.target_amount) }
          : goal
      )
    );
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
