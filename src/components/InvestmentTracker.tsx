
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Investment } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Plus, DollarSign } from 'lucide-react';

interface InvestmentTrackerProps {
  investments: Investment[];
  onAddInvestment: (investment: Omit<Investment, 'id' | 'current_value'>) => void;
}

const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ investments, onAddInvestment }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    return_rate: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();

  const investmentTypes = [
    'Tesouro Direto',
    'CDB',
    'LCI/LCA',
    'Fundos de Investimento',
    'Ações',
    'ETFs',
    'Criptomoedas',
    'Poupança',
    'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.return_rate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    onAddInvestment({
      type: formData.type,
      amount: parseFloat(formData.amount),
      return_rate: parseFloat(formData.return_rate),
      date: formData.date,
    });

    toast({
      title: "Investimento adicionado!",
      description: `Investimento de R$ ${parseFloat(formData.amount).toLocaleString('pt-BR')} em ${formData.type} registrado.`,
    });

    setFormData({
      type: '',
      amount: '',
      return_rate: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Carteira de Investimentos</h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalInvested.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCurrentValue.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              R$ {totalReturn.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm opacity-90">
              {totalReturnPercentage > 0 ? '+' : ''}{totalReturnPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Novo Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Investimento</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Valor Investido (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="return_rate">Taxa de Retorno (%)</Label>
                  <Input
                    id="return_rate"
                    type="number"
                    step="0.01"
                    value={formData.return_rate}
                    onChange={(e) => setFormData({...formData, return_rate: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Data do Investimento</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Adicionar Investimento
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Meus Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum investimento registrado ainda.
              </p>
            ) : (
              investments.map(investment => {
                const returnAmount = investment.current_value - investment.amount;
                const returnPercentage = (returnAmount / investment.amount) * 100;
                const formattedDate = new Date(investment.date).toLocaleDateString('pt-BR');

                return (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{investment.type}</h4>
                        <p className="text-sm text-gray-600">Investido em {formattedDate}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        R$ {investment.current_value.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Investido: R$ {investment.amount.toLocaleString('pt-BR')}
                      </div>
                      <div className={`text-sm font-medium ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}% 
                        ({returnPercentage >= 0 ? '+' : ''}R$ {returnAmount.toLocaleString('pt-BR')})
                      </div>
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

export default InvestmentTracker;
