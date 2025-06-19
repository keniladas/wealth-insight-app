
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Budget = Database['public']['Tables']['budgets']['Row'];
type Investment = Database['public']['Tables']['investments']['Row'];
type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export const useSupabaseFinanceData = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
  }, [userId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
        loadInvestments(),
        loadGoals(),
        loadNotifications()
      ]);
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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    setTransactions(data || []);
  };

  const loadBudgets = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setBudgets(data || []);
  };

  const loadInvestments = async () => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    setInvestments(data || []);
  };

  const loadGoals = async () => {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setGoals(data || []);
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setNotifications(data || []);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      await loadBudgets(); // Reload budgets to get updated spent amounts

      // Check for budget alerts
      if (transaction.type === 'expense') {
        await checkBudgetAlert(transaction.category, transaction.amount);
      }

      toast({
        title: "Transação adicionada!",
        description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de Kz ${transaction.amount.toLocaleString('pt-BR')} registrada com sucesso.`,
      });

      return data;
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

  const addBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'spent'>) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budget,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => [data, ...prev]);
      
      toast({
        title: "Orçamento criado!",
        description: `Orçamento de Kz ${budget.limit_amount.toLocaleString('pt-BR')} para ${budget.category} criado.`,
      });

      return data;
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

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setInvestments(prev => [data, ...prev]);
      
      toast({
        title: "Investimento adicionado!",
        description: `Investimento de Kz ${investment.amount.toLocaleString('pt-BR')} em ${investment.type} registrado.`,
      });

      return data;
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

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{
          ...goal,
          user_id: userId!
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      
      toast({
        title: "Meta criada!",
        description: `Meta "${goal.title}" de Kz ${goal.target_amount.toLocaleString('pt-BR')} criada.`,
      });

      return data;
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

      setGoals(prev => prev.map(g => g.id === goalId ? data : g));
      
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
      b.month === currentMonth && 
      b.year === currentYear
    );

    if (budget && (budget.spent + expenseAmount) > budget.limit_amount) {
      await createNotification({
        type: 'budget_alert',
        title: 'Orçamento Excedido!',
        message: `Você excedeu o orçamento de ${category}. Limite: Kz ${budget.limit_amount.toLocaleString('pt-BR')}, Gasto: Kz ${(budget.spent + expenseAmount).toLocaleString('pt-BR')}.`
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
