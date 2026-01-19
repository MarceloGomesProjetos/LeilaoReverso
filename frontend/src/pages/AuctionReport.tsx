import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BrainCircuit, ShieldAlert, CheckCircle2, Award, Download, TrendingDown } from 'lucide-react';
import api from '../services/api';

const AuctionReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      // Rota que aciona o aiService.js para analisar o leilão
      const response = await api.get(`/auctions/${id}/report`);
      setReport(response.data);
    };
    fetchReport();
  }, [id]);

  if (!report) return <div className="p-10">Gerando análise de IA...</div>;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8 lg:p-16">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO DO RELATÓRIO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <BrainCircuit className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest text-sm">Relatório de Inteligência IA</span>
            </div>
            <h1 className="text-4xl font-black text-blue-900">{report.auction_title}</h1>
            <p className="text-gray-500">Leilão finalizado em {new Date(report.end_date).toLocaleDateString()}</p>
          </div>
          <button className="flex items-center px-6 py-3 bg-white border-2 border-blue-700 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all">
            <Download className="w-5 h-5 mr-2" /> Exportar PDF
          </button>
        </div>

        {/* CARDS DE INSIGHTS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <TrendingDown className="text-green-500 w-8 h-8 mb-4" />
            <span className="text-gray-500 font-medium">Economia Gerada</span>
            <p className="text-3xl font-black text-gray-900 mt-1">R$ {report.savings.toLocaleString('pt-BR')}</p>
            <p className="text-green-600 text-sm font-bold">-{report.savings_percent}% em relação ao teto</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <CheckCircle2 className="text-blue-500 w-8 h-8 mb-4" />
            <span className="text-gray-500 font-medium">Lances Analisados</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{report.total_bids}</p>
            <p className="text-gray-400 text-sm italic font-medium">Todos validados por IA</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <ShieldAlert className="text-orange-500 w-8 h-8 mb-4" />
            <span className="text-gray-500 font-medium">Risco de Compliance</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{report.risk_score}/10</p>
            <p className="text-orange-600 text-sm font-bold">Risco Baixo Detectado</p>
          </div>
        </div>

        {/* RECOMENDAÇÃO DA IA */}
        <div className="bg-blue-900 text-white p-10 rounded-3xl mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Award className="w-7 h-7 mr-3 text-yellow-400" /> Fornecedor Recomendado
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-4xl font-black mb-2">{report.recommended_supplier.name}</p>
                <p className="text-blue-200 max-w-xl text-lg">
                  "Nossa IA recomenda este fornecedor não apenas pelo preço, mas pela consistência nos lances e histórico de entregas positivas no setor de {report.category}."
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm uppercase font-bold text-blue-300">Melhor Lance Final</span>
                <p className="text-5xl font-black text-white">R$ {report.recommended_supplier.bid_amount.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
          <BrainCircuit className="absolute right-[-50px] top-[-50px] w-96 h-96 text-blue-800 opacity-20" />
        </div>

      </div>
    </div>
  );
};

export default AuctionReport;