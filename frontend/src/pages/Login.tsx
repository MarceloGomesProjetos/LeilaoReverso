import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Autenticando...');

    try {
      // Chamada para o seu AuthController.js
      const response = await api.post('/auth/login', formData);

      // Salvando os dados essenciais no navegador
      localStorage.setItem('@ShortWin:token', response.data.token);
      localStorage.setItem('@ShortWin:user', JSON.stringify(response.data.user));

      toast.dismiss(loadingToast);
      toast.success(`Bem-vindo, ${response.data.user.name}!`);

      // Redireciona para o Dashboard que acabamos de criar
      navigate('/dashboard');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const message = error.response?.data?.error || 'E-mail ou senha incorretos';
      toast.error(message);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      return toast.error('Por favor, digite seu e-mail.');
    }
    const loadingToast = toast.loading('Enviando link de recuperação...');

    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.dismiss(loadingToast);
      toast.success('Se uma conta com este e-mail existir, um link será enviado!');
      setView('login'); // Volta para a tela de login
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const message = error.response?.data?.error || 'Erro ao enviar o link. Tente novamente.';
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-64px)] m-0 p-0 overflow-hidden bg-white">

      {/* LADO ESQUERDO: Branding Full-Width */}
      <div className="hidden md:flex md:w-1/2 bg-blue-700 p-16 flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center text-blue-200 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar para o site
          </Link>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Acesse o <span className="text-blue-300">ShortWin.</span></h1>
          <p className="text-xl text-blue-100 font-medium">
            Gerencie seus leilões e acompanhe lances em tempo real com segurança garantida por IA.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="w-full md:w-1/2 p-8 md:p-24 flex items-center justify-center">
        <div className="w-full max-w-md">
          {view === 'login' ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Login</h2>
                <p className="text-gray-500">Entre com sua conta corporativa.</p>
              </div>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-gray-700">Senha</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center group"
                >
                  ENTRAR NO PAINEL
                  <LogIn className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Recuperar Senha</h3>
                <p className="text-gray-500">
                  Digite seu e-mail para receber o link de recuperação.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 mt-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center group"
              >
                ENVIAR LINK
                <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-4 text-center text-sm">
                <button type="button" onClick={() => setView('login')} className="text-blue-700 font-bold hover:underline">
                  Voltar para o Login
                </button>
              </p>
            </form>
          )}

          <p className="mt-10 text-center text-gray-500 font-medium">
            Ainda não tem conta? <Link to="/register" className="text-blue-700 font-bold hover:underline">Cadastre sua empresa</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
