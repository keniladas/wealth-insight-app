
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';

const FinancialCalculator: React.FC = () => {
  // Loan Calculator
  const [loanData, setLoanData] = useState({
    principal: '',
    rate: '',
    term: '',
  });
  const [loanResult, setLoanResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  // Investment Calculator
  const [investmentData, setInvestmentData] = useState({
    initial: '',
    monthly: '',
    rate: '',
    years: '',
  });
  const [investmentResult, setInvestmentResult] = useState<{
    finalAmount: number;
    totalContributions: number;
    totalReturns: number;
  } | null>(null);

  // Savings Calculator
  const [savingsData, setSavingsData] = useState({
    target: '',
    current: '',
    monthly: '',
    rate: '',
  });
  const [savingsResult, setSavingsResult] = useState<{
    timeToGoal: number;
    finalAmount: number;
  } | null>(null);

  const calculateLoan = () => {
    const P = parseFloat(loanData.principal);
    const r = parseFloat(loanData.rate) / 100 / 12;
    const n = parseFloat(loanData.term) * 12;

    if (P && r && n) {
      const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - P;

      setLoanResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
      });
    }
  };

  const calculateInvestment = () => {
    const P = parseFloat(investmentData.initial) || 0;
    const PMT = parseFloat(investmentData.monthly) || 0;
    const r = parseFloat(investmentData.rate) / 100 / 12;
    const n = parseFloat(investmentData.years) * 12;

    if (r && n) {
      // Future value of initial investment
      const futureValueInitial = P * Math.pow(1 + r, n);
      
      // Future value of monthly contributions
      const futureValueMonthly = PMT * ((Math.pow(1 + r, n) - 1) / r);
      
      const finalAmount = futureValueInitial + futureValueMonthly;
      const totalContributions = P + (PMT * n);
      const totalReturns = finalAmount - totalContributions;

      setInvestmentResult({
        finalAmount,
        totalContributions,
        totalReturns,
      });
    }
  };

  const calculateSavings = () => {
    const target = parseFloat(savingsData.target);
    const current = parseFloat(savingsData.current) || 0;
    const monthly = parseFloat(savingsData.monthly);
    const rate = parseFloat(savingsData.rate) / 100 / 12;

    if (target && monthly) {
      const remaining = target - current;
      
      if (rate > 0) {
        // With interest
        const timeToGoal = Math.log(1 + (remaining * rate) / monthly) / Math.log(1 + rate);
        const finalAmount = current * Math.pow(1 + rate, timeToGoal) + monthly * ((Math.pow(1 + rate, timeToGoal) - 1) / rate);
        
        setSavingsResult({
          timeToGoal,
          finalAmount,
        });
      } else {
        // Without interest
        const timeToGoal = remaining / monthly;
        setSavingsResult({
          timeToGoal,
          finalAmount: target,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Calculadora Financeira</h2>
      </div>

      <Tabs defaultValue="loan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loan" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Empréstimo
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Investimento
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Poupança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loan">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Calculadora de Empréstimo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="principal">Valor do Empréstimo (Kz)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={loanData.principal}
                    onChange={(e) => setLoanData({...loanData, principal: e.target.value})}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Taxa de Juros (% ao ano)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={loanData.rate}
                    onChange={(e) => setLoanData({...loanData, rate: e.target.value})}
                    placeholder="12"
                  />
                </div>
                <div>
                  <Label htmlFor="term">Prazo (anos)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanData.term}
                    onChange={(e) => setLoanData({...loanData, term: e.target.value})}
                    placeholder="5"
                  />
                </div>
                <Button 
                  onClick={calculateLoan}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Calcular
                </Button>
              </CardContent>
            </Card>

            {loanResult && (
              <Card className="border-0 shadow-lg bg-blue-50">
                <CardHeader>
                  <CardTitle>Resultado do Empréstimo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Prestação Mensal:</span>
                    <span className="font-semibold">Kz {loanResult.monthlyPayment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total a Pagar:</span>
                    <span className="font-semibold">Kz {loanResult.totalPayment.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Juros:</span>
                    <span className="font-semibold text-red-600">Kz {loanResult.totalInterest.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="investment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Calculadora de Investimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="initial">Investimento Inicial (Kz)</Label>
                  <Input
                    id="initial"
                    type="number"
                    value={investmentData.initial}
                    onChange={(e) => setInvestmentData({...investmentData, initial: e.target.value})}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly">Contribuição Mensal (Kz)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={investmentData.monthly}
                    onChange={(e) => setInvestmentData({...investmentData, monthly: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Taxa de Retorno (% ao ano)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={investmentData.rate}
                    onChange={(e) => setInvestmentData({...investmentData, rate: e.target.value})}
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label htmlFor="years">Período (anos)</Label>
                  <Input
                    id="years"
                    type="number"
                    value={investmentData.years}
                    onChange={(e) => setInvestmentData({...investmentData, years: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <Button 
                  onClick={calculateInvestment}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700"
                >
                  Calcular
                </Button>
              </CardContent>
            </Card>

            {investmentResult && (
              <Card className="border-0 shadow-lg bg-green-50">
                <CardHeader>
                  <CardTitle>Resultado do Investimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Valor Final:</span>
                    <span className="font-semibold text-green-600">Kz {investmentResult.finalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Investido:</span>
                    <span className="font-semibold">Kz {investmentResult.totalContributions.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganhos:</span>
                    <span className="font-semibold text-green-600">Kz {investmentResult.totalReturns.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Calculadora de Poupança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target">Meta de Poupança (Kz)</Label>
                  <Input
                    id="target"
                    type="number"
                    value={savingsData.target}
                    onChange={(e) => setSavingsData({...savingsData, target: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="current">Valor Atual (Kz)</Label>
                  <Input
                    id="current"
                    type="number"
                    value={savingsData.current}
                    onChange={(e) => setSavingsData({...savingsData, current: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly">Poupança Mensal (Kz)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={savingsData.monthly}
                    onChange={(e) => setSavingsData({...savingsData, monthly: e.target.value})}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Taxa de Juros (% ao ano)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={savingsData.rate}
                    onChange={(e) => setSavingsData({...savingsData, rate: e.target.value})}
                    placeholder="5"
                  />
                </div>
                <Button 
                  onClick={calculateSavings}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700"
                >
                  Calcular
                </Button>
              </CardContent>
            </Card>

            {savingsResult && (
              <Card className="border-0 shadow-lg bg-purple-50">
                <CardHeader>
                  <CardTitle>Resultado da Poupança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Tempo para Meta:</span>
                    <span className="font-semibold">
                      {savingsResult.timeToGoal < 1 
                        ? `${Math.ceil(savingsResult.timeToGoal * 12)} meses`
                        : `${savingsResult.timeToGoal.toFixed(1)} anos`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Final:</span>
                    <span className="font-semibold text-purple-600">Kz {savingsResult.finalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialCalculator;
