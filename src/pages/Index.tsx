
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';
import BudgetManager from '@/components/BudgetManager';
import InvestmentTracker from '@/components/InvestmentTracker';
import Reports from '@/components/Reports';
import AuthModal from '@/components/AuthModal';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, logout } = useAuth();
  const { transactions, budgets, investments, addTransaction, addBudget, addInvestment } = useFinanceData();

  console.log('Index render - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Sistema de Gestão Financeira
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Controle suas finanças pessoais de forma inteligente e eficiente
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="text-blue-600 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    📊
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-600 text-sm">Visualize seus gastos com gráficos interativos</p>
              </Card>

              <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="text-purple-600 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    🎯
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Controle de Orçamento</h3>
                <p className="text-gray-600 text-sm">Defina metas e receba alertas inteligentes</p>
              </Card>

              <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="text-green-600 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    💰
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Gestão de Investimentos</h3>
                <p className="text-gray-600 text-sm">Acompanhe sua carteira de investimentos</p>
              </Card>
            </div>

            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Começar Agora
            </Button>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestão Financeira
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.name}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              transactions={transactions}
              budgets={budgets}
              investments={investments}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionForm onAddTransaction={addTransaction} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetManager 
              budgets={budgets}
              onAddBudget={addBudget}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentTracker 
              investments={investments}
              onAddInvestment={addInvestment}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Reports 
              transactions={transactions}
              budgets={budgets}
              investments={investments}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
