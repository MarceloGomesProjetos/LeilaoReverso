import React, { useState } from 'react';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams(); // Captura o token da URL enviado por e-mail
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('As senhas não coincidem');
    }

    const loading = toast.loading('Atualizando sua senha...');

    try {
      // Envia a nova senha e o token para o backend
      await api.post('/auth/reset-password', { token, password });
      
      toast.dismiss(loading);
      toast.success('Senha alterada com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast.dismiss(loading);
      toast.error(error.response?.data?.error || 'Erro ao redefinir senha');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-700 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-blue-900">Nova Senha</h2>
          <p className="text-gray-500 mt-2">Crie uma senha forte e segura para sua conta corporativa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Confirmar Senha</label>
            <div className="relative">
              <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center">
            REDEFINIR SENHA <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;