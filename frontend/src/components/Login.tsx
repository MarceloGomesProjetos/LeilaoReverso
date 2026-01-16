import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Envia para o seu authController.js no backend
      const response = await api.post('/auth/login', formData);
      
      // Armazena o Token para uso nos middlewares
      localStorage.setItem('@ShortWin:token', response.data.token);
      localStorage.setItem('@ShortWin:user', JSON.stringify(response.data.user));
      
      navigate('/'); // Redireciona para a Home após sucesso
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao realizar login');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-64px)] m-0 p-0 overflow-hidden">
      
      {/* LADO ESQUERDO: Visual / Branding (50%) */}
      <div className="hidden md:flex md:w-1/2 bg-blue-700 p-16 flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center text-blue-200 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar para o site
          </Link>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Bem-vindo de volta ao <span className="text-blue-300">ShortWin.</span></h1>
          <p className="text-xl text-blue-100">
            Acesse sua conta para gerenciar leilões e dar lances em tempo real monitorados por nossa IA.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Formulário de Acesso (50%) */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-24 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Entrar</h2>
            <p className="text-gray-500 font-medium">Insira suas credenciais abaixo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 mt-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center"
            >
              ACESSAR MINHA CONTA
              <LogIn className="ml-2 w-5 h-5" />
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-medium">
            Ainda não tem conta? <Link to="/register" className="text-blue-700 font-bold hover:underline">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;