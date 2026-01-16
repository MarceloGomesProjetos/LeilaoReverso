import React, { useState } from 'react';
import { Package, Calendar, DollarSign, Tag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    initial_price: '',
    end_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading('Publicando leilão...');

    try {
      // Envia para o auctionController.js
      await api.post('/auctions', formData);
      
      toast.dismiss(loading);
      toast.success('Leilão publicado com sucesso! 🚀');
      navigate('/dashboard');
    } catch (error: any) {
      toast.dismiss(loading);
      toast.error(error.response?.data?.error || 'Erro ao criar leilão');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-white">
      
      {/* LADO ESQUERDO: Orientações (40%) */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-blue-700 p-12 lg:p-20 text-white flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-6">Criar Novo Leilão</h2>
        <p className="text-blue-100 text-lg mb-8">
          Preencha os detalhes do item ou serviço que você deseja adquirir. Nossa IA ajudará a filtrar os melhores lances para você.
        </p>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg"><Package /></div>
            <span>Descreva bem o produto para evitar dúvidas.</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg"><DollarSign /></div>
            <span>Defina um preço inicial justo para atrair fornecedores.</span>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: Formulário (60%) */}
      <div className="w-full md:w-7/12 lg:w-8/12 p-8 lg:p-20 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Título do Leilão</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Lote de 50 Notebooks Dell"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Categoria</label>
              <input 
                required
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Preço Máximo (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="number"
                  required
                  onChange={(e) => setFormData({...formData, initial_price: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Data e Hora de Encerramento</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="datetime-local"
                required
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Descrição Detalhada</label>
            <textarea 
              required
              rows={4}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Especifique modelos, quantidades e prazos de entrega..."
            />
          </div>

          <button type="submit" className="w-full py-4 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center">
            PUBLICAR LEILÃO AGORA <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;