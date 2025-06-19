
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Import the legacy types to maintain compatibility
import type { Transaction, Budget, Investment, FinancialGoal } from './useFinanceData';

type SupabaseTransaction = Database['public']['Tables']['transactions']['Row'];
type SupabaseBudget = Database['public']['Tables']['budgets']['Row'];
type SupabaseInvestment = Database['public']['Tables']['investments']['Row'];
type SupabaseFinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export const useSupabaseFinanceData = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('useSupabaseFinanceData - userId:', userId, 'loading:', loading);

  // Helper functions to convert Supabase types to legacy types
  const convertTransaction = (supabaseTransaction: SupabaseTransaction): Transaction => ({
    id: supabaseTransaction.id,
    type: supabaseTransaction.type as 'income' | 'expense',
    amount: Number(supabaseTransaction.amount),
    category: supabaseTransaction.category,
    description: supabaseTransaction.description || '',
    date: supabaseTransaction.date,
  });

  const convertBudget = (supabaseBudget: SupabaseBudget): Budget => ({
    id: supabaseBudget.id,
    category: supabaseBudget.category,
    limit: Number(supabaseBudget.limit_amount),
    spent: Number(supabaseBudget.spent),
    month: `${supabaseBudget.year}-${supabaseBudget.month.toString().padStart(2, '0')}`,
  });

  const convertInvestment = (supabaseInvestment: SupabaseInvestment): Investment => ({
    id: supabaseInvestment.id,
    type: supabaseInvestment.type,
    amount: Number(supabaseInvestment.amount),
    date: supabaseInvestment.date,
    return_rate: Number(supabaseInvestment.return_rate),
    current_value: Number(supabaseInvestment.current_value),
  });

  const convertGoal = (supabaseGoal: SupabaseFinancialGoal): FinancialGoal => ({
    id: supabaseGoal.id,
    title: supabaseGoal.title,
    target_amount: Number(supabaseGoal.target_amount),
    current_amount: Number(supabaseGoal.current_amount),
    target_date: supabaseGoal.target_date,
    category: supabaseGoal.category as 'savings' | 'investment' | 'debt_payment' | 'emergency_fund' | 'other',
    description: supabaseGoal.description || '',
    created_date: supabaseGoal.created_at,
  });

  useEffect(() => {
    console.log('useSupabaseFinanceData - useEffect triggered, userId:', userId);
    if (userId) {
      loadAllData();
    } else {
      console.log('useSupabaseFinanceData - No userId, setting loading to false');
      setLoading(false);
    }
  }, [userId]);

  const loadAllData = async () => {
    try {
      console.log('useSupabaseFinanceData - Starting to load all data');
      setLoading(true);
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
        loadInvestments(),
        loadGoals(),
        loadNotifications()
      ]);
      console.log('useSupabaseFinanceData - Finished loading all data');
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    console.log('useSupabaseFinanceData - Loading transactions');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    console.log('useSupabaseFinanceData - Transactions result:', { data, error });
    if (error) throw error;
    setTransactions((data || []).map(convertTransaction));
  };

  const loadBudgets = async () => {
    console.log('useSupabaseFinanceData - Loading budgets');
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('useSupabaseFinanceData - Budgets result:', { data, error });
    if (error) throw error;
    setBudgets((data || []).map(convertBudget));
  };

  const loadInvestments = async () => {
    console.log('useSupabaseFinanceData - Loading investments');
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('date', { ascending: false });
    
    console.log('useSupabaseFinanceData - Investments result:', { data, error });
    if (error) throw error;
    setInvestments((data || []).map(convertInvestment));
  };

  const loadGoals = async () => {
    console.log('useSupabaseFinanceData - Loading goals');
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('useSupabaseFinanceData - Goals result:', { data, error });
    if (error) throw error;
    setGoals((data || []).map(convertGoal));
  };

  const loadNotifications = async () => {
    console.log('useSupabaseFinanceData - Loading notifications');
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('useSupabaseFinanceData - Notifications result:', { data, error });
    if (error) throw error;
    setNotifications(data || []);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      console.log('useSupabaseFinanceData - Adding transaction:', transaction);
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [convertTransaction(data), ...prev]);
      await loadBudgets(); // Reload budgets to get updated spent amounts

      // Check for budget alerts
      if (transaction.type === 'expense') {
        await checkBudgetAlert(transaction.category, transaction.amount);
      }

      toast({
        title: "Transação adicionada!",
        description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de Kz ${transaction.amount.toLocaleString('pt-BR')} registrada com sucesso.`,
      });

      return convertTransaction(data);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    try {
      const [year, month] = budget.month.split('-').map(Number);
      
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          category: budget.category,
          limit_amount: budget.limit,
          month,
          year,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => [convertBudget(data), ...prev]);
      
      toast({
        title: "Orçamento criado!",
        description: `Orçamento de Kz ${budget.limit.toLocaleString('pt-BR')} para ${budget.category} criado.`,
      });

      return convertBudget(data);
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'current_value'>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          current_value: investment.amount, // Initial value equals investment amount
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setInvestments(prev => [convertInvestment(data), ...prev]);
      
      toast({
        title: "Investimento adicionado!",
        description: `Investimento de Kz ${investment.amount.toLocaleString('pt-BR')} em ${investment.type} registrado.`,
      });

      return convertInvestment(data);
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar investimento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'created_date'>) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{
          title: goal.title,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          target_date: goal.target_date,
          category: goal.category,
          description: goal.description,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [convertGoal(data), ...prev]);
      
      toast({
        title: "Meta criada!",
        description: `Meta "${goal.title}" de Kz ${goal.target_amount.toLocaleString('pt-BR')} criada.`,
      });

      return convertGoal(data);
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar meta.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGoalProgress = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
      
      const { data, error } = await supabase
        .from('financial_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === goalId ? convertGoal(data) : g));
      
      toast({
        title: "Progresso atualizado!",
        description: `Progresso da meta atualizado para Kz ${newAmount.toLocaleString('pt-BR')}.`,
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar progresso da meta.",
        variant: "destructive",
      });
    }
  };

  const checkBudgetAlert = async (category: string, expenseAmount: number) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const budget = budgets.find(b => 
      b.category === category && 
      b.month === `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    );

    if (budget && (budget.spent + expenseAmount) > budget.limit) {
      await createNotification({
        type: 'budget_alert',
        title: 'Orçamento Excedido!',
        message: `Você excedeu o orçamento de ${category}. Limite: Kz ${budget.limit.toLocaleString('pt-BR')}, Gasto: Kz ${(budget.spent + expenseAmount).toLocaleString('pt-BR')}.`
      });
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data, ...prev]);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'budget_alert' ? 'destructive' : 'default',
      });

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    transactions,
    budgets,
    investments,
    goals,
    notifications,
    loading,
    addTransaction,
    addBudget,
    addInvestment,
    addGoal,
    updateGoalProgress,
    createNotification,
    markNotificationAsRead,
    loadAllData
  };
};
