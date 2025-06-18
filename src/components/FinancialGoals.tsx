
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FinancialGoal } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Calendar, TrendingUp } from 'lucide-react';

interface FinancialGoalsProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'created_date'>) => void;
  onUpdateProgress: (goalId: string, amount: number) => void;
}

const FinancialGoals: React.FC<FinancialGoalsProps> = ({ goals, onAddGoal, onUpdateProgress }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'savings' as 'savings' | 'investment' | 'debt_payment' | 'emergency_fund' | 'other',
    description: '',
  });
  const [contributionAmount, setContributionAmount] = useState<{ [key: string]: string }>({});
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_amount || !formData.target_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const goal: Omit<FinancialGoal, 'id' | 'created_date'> = {
      title: formData.title,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      target_date: formData.target_date,
      category: formData.category,
      description: formData.description,
    };

    onAddGoal(goal);

    toast({
      title: "Meta criada!",
      description: `Meta "${formData.title}" criada com sucesso.`,
    });

    // Reset form
    setFormData({
      title: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      category: 'savings',
      description: '',
    });
    setShowForm(false);
  };

  const handleContribution = (goalId: string) => {
    const amount = parseFloat(contributionAmount[goalId]);
    if (amount && amount > 0) {
      onUpdateProgress(goalId, amount);
      setContributionAmount({ ...contributionAmount, [goalId]: '' });
      toast({
        title: "Progresso atualizado!",
        description: `Contribuição de Kz ${amount.toLocaleString('pt-BR')} adicionada à meta.`,
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'debt_payment': return '💳';
      case 'emergency_fund': return '🚨';
      default: return '🎯';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'savings': return 'Poupança';
      case 'investment': return 'Investimento';
      case 'debt_payment': return 'Pagamento de Dívida';
      case 'emergency_fund': return 'Fundo de Emergência';
      default: return 'Outros';
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" />
          Metas Financeiras
        </h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Criar Nova Meta Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título da Meta</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Comprar um carro"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">💰 Poupança</SelectItem>
                      <SelectItem value="investment">📈 Investimento</SelectItem>
                      <SelectItem value="debt_payment">💳 Pagamento de Dívida</SelectItem>
                      <SelectItem value="emergency_fund">🚨 Fundo de Emergência</SelectItem>
                      <SelectItem value="other">🎯 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="target_amount">Valor Alvo (Kz)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="current_amount">Valor Atual (Kz)</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="target_date">Data Alvo</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva sua meta financeira..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
                  Criar Meta
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const daysRemaining = getDaysRemaining(goal.target_date);
          const isOverdue = daysRemaining < 0;
          const isCompleted = progress >= 100;

          return (
            <Card key={goal.id} className={`border-0 shadow-lg ${isCompleted ? 'bg-green-50' : isOverdue ? 'bg-red-50' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                  <div>
                    <div className="font-semibold">{goal.title}</div>
                    <div className="text-sm text-gray-500">{getCategoryName(goal.category)}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Atual</div>
                    <div className="font-semibold">Kz {goal.current_amount.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Meta</div>
                    <div className="font-semibold">Kz {goal.target_amount.toLocaleString('pt-BR')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className={isOverdue ? 'text-red-600' : daysRemaining <= 30 ? 'text-orange-600' : 'text-gray-600'}>
                    {isOverdue ? `${Math.abs(daysRemaining)} dias em atraso` : 
                     daysRemaining === 0 ? 'Meta vence hoje!' :
                     `${daysRemaining} dias restantes`}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600">{goal.description}</p>
                )}

                {!isCompleted && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Valor da contribuição"
                      value={contributionAmount[goal.id] || ''}
                      onChange={(e) => setContributionAmount({ ...contributionAmount, [goal.id]: e.target.value })}
                    />
                    <Button 
                      onClick={() => handleContribution(goal.id)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {isCompleted && (
                  <div className="text-center py-2">
                    <span className="text-green-600 font-semibold">🎉 Meta Alcançada!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta financeira</h3>
            <p className="text-gray-600 mb-4">Comece definindo suas metas financeiras para alcançar seus objetivos.</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialGoals;
