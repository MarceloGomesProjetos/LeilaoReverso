import React, { useEffect, useState } from 'react';
import { Gavel, Plus, LayoutDashboard, History, Settings } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        // Tratar erro, talvez redirecionar para o login
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full bg-gray-50 m-0 p-0">
      
      {/* SIDEBAR LATERAL FIXA - 250px */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Painel {user.user_type === 'buyer' ? 'Comprador' : 'Fornecedor'}</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="flex items-center w-full p-3 text-blue-700 bg-blue-50 rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Resumo
          </button>
          <button className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <Gavel className="w-5 h-5 mr-3" /> {user.user_type === 'buyer' ? 'Meus Leilões' : 'Meus Lances'}
          </button>
          <button className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <History className="w-5 h-5 mr-3" /> Histórico
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center w-full p-3 text-gray-600 hover:text-red-600 transition-all">
            <Settings className="w-5 h-5 mr-3" /> Configurações
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL - Full Width restante */}
      <main className="flex-1 p-8 lg:p-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Olá, {user.name}!</h1>
            <p className="text-gray-500">Bem-vindo ao seu painel de negociações inteligentes.</p>
          </div>
          
          {/* Botão de ação rápida condicional */}
          {user.user_type === 'buyer' && (
            <button className="flex items-center px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Novo Leilão
            </button>
          )}
        </div>

        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-gray-500 text-sm font-medium">Leilões Ativos</span>
            <p className="text-3xl font-black text-blue-700 mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-gray-500 text-sm font-medium">Total em Negociação</span>
            <p className="text-3xl font-black text-blue-700 mt-2">R$ 45.000</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-gray-500 text-sm font-medium">Lances Recebidos</span>
            <p className="text-3xl font-black text-blue-700 mt-2">148</p>
          </div>
        </div>

        {/* TABELA DE ATIVIDADES RECENTES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="p-6 text-center py-20">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="text-blue-600 w-8 h-8" />
            </div>
            <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;