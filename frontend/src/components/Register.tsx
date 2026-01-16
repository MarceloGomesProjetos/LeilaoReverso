import React, { useState } from 'react';
import { User, Building2, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Certifique-se que o caminho está correto
import toast from 'react-hot-toast';



const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'buyer' | 'supplier'>('buyer');
  
  // 1. Estado para armazenar os valores dos inputs
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    password: ''
  });

  // 2. Função para atualizar o estado conforme o usuário digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Função de submissão para o backend
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Criamos uma promessa para mostrar um loading enquanto o banco processa
  const loadingToast = toast.loading('Criando sua conta...');

  try {
    await api.post('/auth/register', { ...formData, user_type: userType });
    
    // Remove o loading e mostra o sucesso
    toast.dismiss(loadingToast);
    toast.success('Bem-vindo ao ShortWin! Cadastro realizado.', {
      duration: 4000,
      icon: '🚀',
    });

    setTimeout(() => navigate('/login'), 2000);
  } catch (error: any) {
    toast.dismiss(loadingToast);
    const message = error.response?.data?.error || 'Erro ao realizar cadastro';
    toast.error(message);
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* LADO ESQUERDO: Painel de Informações */}
      <div className="w-full md:w-1/2 lg:w-1/3 bg-blue-700 p-12 lg:p-20 text-white flex flex-col justify-center">
        <div className="max-w-md mx-auto md:mx-0">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Junte-se ao ShortWin</h2>
          <p className="text-blue-100 text-lg mb-8">
            Escolha seu perfil e comece a economizar ou a vender de forma inteligente com nossa IA.
          </p>
          <ul className="space-y-6 text-base">
            <li className="flex items-center"><ArrowRight className="w-5 h-5 mr-3 text-blue-300" /> Leilões em tempo real</li>
            <li className="flex items-center"><ArrowRight className="w-5 h-5 mr-3 text-blue-300" /> Proteção anti-bot</li>
            <li className="flex items-center"><ArrowRight className="w-5 h-5 mr-3 text-blue-300" /> Sugestões de lances</li>
          </ul>
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="w-full md:w-1/2 lg:w-2/3 bg-white p-12 lg:p-20 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-8 md:hidden">Crie sua conta</h2>
            
            {/* Seletor de Perfil */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-10 border border-gray-200">
              <button
                type="button"
                onClick={() => setUserType('buyer')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${userType === 'buyer' ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sou Comprador
              </button>
              <button
                type="button"
                onClick={() => setUserType('supplier')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${userType === 'supplier' ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sou Fornecedor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="João Silva" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="ShortWin Tech" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="contato@empresa.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Telefone/WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="(11) 99999-9999" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 uppercase tracking-wider">
              Criar minha conta agora
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;