
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Budget, Transaction } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, AlertTriangle } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  transactions: Transaction[];
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, onAddBudget, transactions }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: new Date().toISOString().slice(0, 7),
  });

  const { toast } = useToast();

  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Contas',
    'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limit) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Check if budget already exists for this category and month
    const existingBudget = budgets.find(
      budget => budget.category === formData.category && budget.month === formData.month
    );

    if (existingBudget) {
      toast({
        title: "Erro",
        description: "Já existe um orçamento para esta categoria neste mês.",
        variant: "destructive",
      });
      return;
    }

    onAddBudget({
      category: formData.category,
      limit: parseFloat(formData.limit),
      month: formData.month,
    });

    toast({
      title: "Orçamento criado!",
      description: `Orçamento de R$ ${parseFloat(formData.limit).toLocaleString('pt-BR')} para ${formData.category} definido.`,
    });

    setFormData({
      category: '',
      limit: '',
      month: new Date().toISOString().slice(0, 7),
    });
    setShowForm(false);
  };

  // Calculate spent amount for each budget based on transactions
  const budgetsWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(transaction => 
        transaction.type === 'expense' && 
        transaction.category === budget.category &&
        transaction.date.slice(0, 7) === budget.month
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { ...budget, spent };
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthBudgets = budgetsWithSpent.filter(budget => budget.month === currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Orçamentos</h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Definir Novo Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limit">Limite (R$)</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.limit}
                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="month">Mês</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Criar Orçamento
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Month Budgets */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Orçamentos do Mês Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentMonthBudgets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum orçamento definido para este mês.
              </p>
            ) : (
              currentMonthBudgets.map(budget => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > 80 && !isOverBudget;

                return (
                  <div key={budget.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{budget.category}</h3>
                        {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {isNearLimit && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span className="text-sm text-gray-600">
                        R$ {budget.spent.toLocaleString('pt-BR')} / R$ {budget.limit.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-3 ${
                        isOverBudget ? 'bg-red-100' : 
                        isNearLimit ? 'bg-amber-100' : 'bg-gray-100'
                      }`}
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' : 
                        isNearLimit ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}% utilizado
                      </span>
                      {isOverBudget && (
                        <span className="text-red-600 font-medium">
                          R$ {(budget.spent - budget.limit).toLocaleString('pt-BR')} acima do limite
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Budgets */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Todos os Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetsWithSpent.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum orçamento criado ainda.
              </p>
            ) : (
              budgetsWithSpent.map(budget => {
                const percentage = (budget.spent / budget.limit) * 100;
                const monthName = new Date(budget.month + '-01').toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long'
                });

                return (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{budget.category}</h4>
                      <p className="text-sm text-gray-600">{monthName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {budget.spent.toLocaleString('pt-BR')} / R$ {budget.limit.toLocaleString('pt-BR')}
                      </p>
                      <p className={`text-sm ${percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                        {percentage.toFixed(1)}% utilizado
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManager;
