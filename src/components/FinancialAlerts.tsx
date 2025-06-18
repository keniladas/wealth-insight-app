
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Transaction, Budget, FinancialGoal } from '@/hooks/useFinanceData';
import { AlertTriangle, TrendingDown, Target, Calendar, Bell } from 'lucide-react';

interface FinancialAlertsProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

const FinancialAlerts: React.FC<FinancialAlertsProps> = ({ transactions, budgets, goals }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date();

  // Budget alerts
  const budgetAlerts = budgets
    .filter(budget => budget.month === currentMonth)
    .map(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      const remaining = budget.limit - budget.spent;
      
      if (percentage >= 100) {
        return {
          type: 'danger' as const,
          icon: AlertTriangle,
          title: 'Orçamento Excedido',
          message: `Categoria "${budget.category}" excedeu o orçamento em Kz ${Math.abs(remaining).toLocaleString('pt-BR')}`,
          value: percentage,
        };
      } else if (percentage >= 80) {
        return {
          type: 'warning' as const,
          icon: AlertTriangle,
          title: 'Orçamento Próximo do Limite',
          message: `Categoria "${budget.category}" atingiu ${percentage.toFixed(1)}% do orçamento`,
          value: percentage,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Spending trend alerts
  const last30Days = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return transactionDate >= thirtyDaysAgo && t.type === 'expense';
  });

  const previous30Days = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo && t.type === 'expense';
  });

  const currentSpending = last30Days.reduce((sum, t) => sum + t.amount, 0);
  const previousSpending = previous30Days.reduce((sum, t) => sum + t.amount, 0);
  const spendingIncrease = previousSpending > 0 ? ((currentSpending - previousSpending) / previousSpending) * 100 : 0;

  const spendingAlerts = [];
  if (spendingIncrease > 20) {
    spendingAlerts.push({
      type: 'warning' as const,
      icon: TrendingDown,
      title: 'Aumento nos Gastos',
      message: `Seus gastos aumentaram ${spendingIncrease.toFixed(1)}% nos últimos 30 dias`,
      value: spendingIncrease,
    });
  }

  // Goal alerts
  const goalAlerts = goals.map(goal => {
    const daysToTarget = Math.ceil((new Date(goal.target_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const progress = (goal.current_amount / goal.target_amount) * 100;
    const remaining = goal.target_amount - goal.current_amount;
    
    if (daysToTarget < 0 && progress < 100) {
      return {
        type: 'danger' as const,
        icon: Target,
        title: 'Meta Vencida',
        message: `Meta "${goal.title}" venceu há ${Math.abs(daysToTarget)} dias`,
        value: progress,
      };
    } else if (daysToTarget <= 30 && daysToTarget > 0 && progress < 80) {
      return {
        type: 'warning' as const,
        icon: Calendar,
        title: 'Meta Próxima do Vencimento',
        message: `Meta "${goal.title}" vence em ${daysToTarget} dias. Restam Kz ${remaining.toLocaleString('pt-BR')}`,
        value: progress,
      };
    }
    return null;
  }).filter(Boolean);

  // Income alerts
  const currentMonthIncome = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 7);
  const lastMonthIncome = transactions
    .filter(t => t.date.startsWith(lastMonth) && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeAlerts = [];
  if (lastMonthIncome > 0 && currentMonthIncome < lastMonthIncome * 0.8) {
    incomeAlerts.push({
      type: 'warning' as const,
      icon: TrendingDown,
      title: 'Redução na Receita',
      message: `Receita deste mês está ${(((lastMonthIncome - currentMonthIncome) / lastMonthIncome) * 100).toFixed(1)}% menor que o mês anterior`,
      value: (currentMonthIncome / lastMonthIncome) * 100,
    });
  }

  const allAlerts = [...budgetAlerts, ...spendingAlerts, ...goalAlerts, ...incomeAlerts];

  if (allAlerts.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-green-50">
        <CardContent className="text-center py-8">
          <Bell className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Tudo em Ordem!</h3>
          <p className="text-green-600">Não há alertas financeiros no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Alertas Financeiros</h2>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {allAlerts.length}
        </span>
      </div>

      <div className="space-y-4">
        {allAlerts.map((alert, index) => (
          <Card 
            key={index} 
            className={`border-0 shadow-lg ${
              alert.type === 'danger' ? 'bg-red-50 border-l-4 border-l-red-500' : 
              'bg-orange-50 border-l-4 border-l-orange-500'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <alert.icon className={`w-5 h-5 mt-1 ${
                  alert.type === 'danger' ? 'text-red-500' : 'text-orange-500'
                }`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    alert.type === 'danger' ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    alert.type === 'danger' ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {alert.message}
                  </p>
                  {alert.value !== undefined && (
                    <div className="mt-3">
                      <Progress 
                        value={Math.min(alert.value, 100)} 
                        className={`h-2 ${
                          alert.type === 'danger' ? 'bg-red-100' : 'bg-orange-100'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinancialAlerts;
