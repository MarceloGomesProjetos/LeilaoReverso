import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gavel, Clock, TrendingDown, BrainCircuit, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const AuctionRoom = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState<any>(null);
    const [bidValue, setBidValue] = useState('');
    const [bids, setBids] = useState<any[]>([]);

    useEffect(() => {
        // Conecta ao servidor (ajuste a URL se o seu backend estiver em outra porta)
        const socket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('@ShortWin:token')
            }
        });

        // Entra na "sala" específica deste leilão para não receber lances de outros produtos
        socket.emit('join_auction', id);

        // Escuta quando um novo lance é confirmado pelo backend
        socket.on('bid_received', (newBid) => {
            // 1. Atualiza o preço atual no topo da tela
            setAuction((prev: any) => ({
                ...prev,
                current_price: newBid.amount
            }));

            // 2. Adiciona o lance no topo da lista de histórico
            setBids((prevBids) => [newBid, ...prevBids]);

            // 3. Notificação discreta
            toast.success('Novo lance recebido!', { icon: '🔔', duration: 2000 });
        });

        // Limpa a conexão ao fechar a página (importante para performance!)
        return () => {
            socket.disconnect();
        };
    }, [id]);

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        const loading = toast.loading('Processando lance...');
        try {
            // Envia o lance para o bidController.js
            await api.post('/bids', { auction_id: id, amount: Number(bidValue) });
            toast.dismiss(loading);
            toast.success('Lance enviado com sucesso!');
            setBidValue('');
        } catch (error: any) {
            toast.dismiss(loading);
            toast.error(error.response?.data?.error || "Lance inválido");
        }
    };

    if (!auction) return <div className="p-10">Carregando sala de leilão...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] w-full bg-white overflow-hidden">

            {/* LADO ESQUERDO: Informações do Produto (60%) */}
            <div className="w-full md:w-3/5 p-8 lg:p-16 overflow-y-auto border-r border-gray-100">
                <div className="mb-8">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full uppercase tracking-widest">
                        {auction.category}
                    </span>
                    <h1 className="text-4xl font-black text-blue-900 mt-4 leading-tight">{auction.title}</h1>
                    <p className="text-gray-500 mt-4 text-lg leading-relaxed">{auction.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <span className="text-gray-500 text-sm block mb-1">Preço Inicial (Teto)</span>
                        <span className="text-2xl font-bold text-gray-900">R$ {auction.initial_price.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <span className="text-blue-600 text-sm block mb-1 font-bold">Lance Atual (Menor)</span>
                        <span className="text-3xl font-black text-blue-700 tracking-tighter">
                            R$ {auction.current_price?.toLocaleString('pt-BR') || auction.initial_price.toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Histórico de Lances em Tempo Real */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Gavel className="w-5 h-5 mr-2 text-blue-700" />
                        Lances em Tempo Real
                    </h3>

                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {bids.length > 0 ? (
                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                {bids.map((bid, index) => (
                                    <div
                                        key={bid.id || index}
                                        className={`p-4 flex justify-between items-center transition-all duration-500 animate-in fade-in slide-in-from-top-2 ${index === 0 ? 'bg-blue-50/50' : 'bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 border border-blue-200">
                                                {bid.user_name?.substring(0, 2).toUpperCase() || 'FR'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{bid.user_name || 'Fornecedor'}</p>
                                                <p className="text-xs text-gray-400">Há poucos segundos</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-blue-700">
                                                R$ {Number(bid.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Estado Vazio */
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gavel className="text-gray-300 w-8 h-8" />
                                </div>
                                <p className="text-gray-500 font-medium">Aguardando o primeiro lance...</p>
                                <p className="text-xs text-gray-400 mt-1">Os lances aparecerão aqui automaticamente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: Painel de Controle e IA (40%) */}
            <div className="w-full md:w-2/5 bg-gray-50 p-8 lg:p-16 flex flex-col justify-between">
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                            <BrainCircuit className="w-5 h-5 mr-2 text-blue-600" /> Sugestão da IA
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Baseado na competitividade atual, sugerimos um lance de <span className="font-bold text-blue-700">R$ {(auction.current_price * 0.98).toFixed(2)}</span> para aumentar suas chances.
                        </p>
                        <div className="flex items-center text-xs text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                            <ShieldCheck className="w-4 h-4 mr-1" /> Proteção Anti-Bot Ativa
                        </div>
                    </div>

                    <form onSubmit={handlePlaceBid} className="space-y-4">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Seu Novo Lance</label>
                        <div className="relative">
                            <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input
                                type="number"
                                value={bidValue}
                                onChange={(e) => setBidValue(e.target.value)}
                                placeholder="Insira um valor menor"
                                className="w-full pl-12 pr-4 py-5 text-xl font-bold bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-5 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest"
                        >
                            Confirmar Lance
                        </button>
                    </form>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between text-gray-500">
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-orange-500" />
                        <span className="font-medium">Tempo restante: 02h 15m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionRoom;