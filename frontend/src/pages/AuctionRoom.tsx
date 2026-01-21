import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, Clock, TrendingDown, BrainCircuit, ShieldCheck, Crown, XCircle, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const AuctionRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [bidValue, setBidValue] = useState('');
    const [user, setUser] = useState<any>(null); // Estado para o usuário logado

    useEffect(() => {
        const socket = io('http://localhost:3000', {
            auth: { token: localStorage.getItem('@ShortWin:token') }
        });

        const fetchData = async () => {
            try {
                // Buscar dados do leilão e do usuário em paralelo
                const [auctionRes, userRes] = await Promise.all([
                    api.get(`/auctions/${id}`),
                    api.get('/auth/profile') // Endpoint para pegar dados do usuário logado
                ]);
                setAuction(auctionRes.data);
                setUser(userRes.data.user);
                
                // Buscar lances iniciais
                const bidsRes = await api.get(`/bids/auction/${id}`);
                setBids(bidsRes.data.bids);

            } catch (error) {
                toast.error('Falha ao carregar dados do leilão.');
                navigate('/dashboard');
            }
        };

        fetchData();

        socket.emit('join_auction', id);

        socket.on('new_bid', (newBid: any) => {
            setAuction((prev: any) => ({ ...prev, current_price: newBid.bid_amount }));
            setBids((prevBids) => [newBid, ...prevBids]);
            toast.success('Novo lance recebido!', { icon: '🔔', duration: 2000 });
        });

        return () => {
            socket.disconnect();
        };
    }, [id, navigate]);

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        const loading = toast.loading('Processando lance...');
        try {
            await api.post('/bids', { auction_id: id, bid_amount: Number(bidValue) });
            toast.dismiss(loading);
            toast.success('Lance enviado com sucesso!');
            setBidValue('');
        } catch (error: any) {
            toast.dismiss(loading);
            toast.error(error.response?.data?.error || "Lance inválido");
        }
    };

    const handleCloseAuction = async () => {
        if (!window.confirm('Tem certeza que deseja encerrar este leilão? Esta ação não pode ser desfeita.')) {
            return;
        }

        const loading = toast.loading('Encerrando leilão...');
        try {
            const response = await api.post(`/auctions/${id}/close`);
            toast.dismiss(loading);
            toast.success(response.data.message, { duration: 5000 });

            // Atualiza o estado do leilão para refletir o encerramento
            setAuction(response.data.updatedAuction);

        } catch (error: any) {
            toast.dismiss(loading);
            toast.error(error.response?.data?.details || 'Não foi possível encerrar o leilão.');
        }
    };

    if (!auction || !user) return <div className="p-10 text-center">Carregando...</div>;

    const isOwner = user?.id === auction.buyer_id;
    const isAuctionActive = auction.status === 'active';

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
                
                {/* Botão de Encerrar Leilão para o Dono */}
                {isOwner && isAuctionActive && (
                    <div className="my-8">
                        <button
                            onClick={handleCloseAuction}
                            className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center"
                        >
                            <Lock className="w-5 h-5 mr-2" /> Encerrar Leilão e Apurar Vencedor
                        </button>
                    </div>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <span className="text-gray-500 text-sm block mb-1">Preço Inicial (Teto)</span>
                        <span className="text-2xl font-bold text-gray-900">R$ {parseFloat(auction.initial_price).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <span className="text-blue-600 text-sm block mb-1 font-bold">Lance Atual (Menor)</span>
                        <span className="text-3xl font-black text-blue-700 tracking-tighter">
                            R$ {parseFloat(auction.current_price || auction.initial_price).toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Histórico de Lances em Tempo Real */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Gavel className="w-5 h-5 mr-2 text-blue-700" />
                        Histórico de Lances
                    </h3>

                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {bids.length > 0 ? (
                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                {bids.map((bid, index) => (
                                    <div
                                        key={bid.id || index}
                                        className={`p-4 flex justify-between items-center transition-all duration-500 ${index === 0 ? 'bg-blue-50/50' : 'bg-white'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 border border-blue-200">
                                                {bid.supplier_company?.substring(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{bid.supplier_company || 'Fornecedor Anônimo'}</p>
                                                <p className="text-xs text-gray-400">Lance: {new Date(bid.created_at).toLocaleTimeString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-blue-700">
                                                R$ {parseFloat(bid.bid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Gavel className="text-gray-300 w-8 h-8 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Aguardando o primeiro lance...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: Painel de Controle e IA (40%) */}
            <div className="w-full md:w-2/5 bg-gray-50 p-8 lg:p-16 flex flex-col justify-center">
                
                {!isAuctionActive ? (
                    <div className="text-center bg-white p-8 rounded-2xl shadow-md">
                        {auction.status === 'closed' && auction.winner_id ? (
                            <>
                                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800">Leilão Encerrado!</h3>
                                <p className="text-gray-600 mt-2">O lance vencedor foi de</p>
                                <p className="text-4xl font-black text-blue-700 my-2">R$ {parseFloat(auction.winning_bid_amount).toLocaleString('pt-BR')}</p>
                                <p className="text-sm text-gray-500">Parabéns ao vencedor!</p>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800">Leilão Encerrado</h3>
                                <p className="text-gray-600 mt-2">
                                    {auction.status === 'closed_without_winner' 
                                        ? "Não houve um lance único vencedor."
                                        : "Este leilão foi finalizado."
                                    }
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <form onSubmit={handlePlaceBid} className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Seu Novo Lance</label>
                            <div className="relative">
                                <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <input
                                    type="number"
                                    value={bidValue}
                                    onChange={(e) => setBidValue(e.target.value)}
                                    placeholder="Insira um valor menor"
                                    className="w-full pl-12 pr-4 py-5 text-xl font-bold bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                    disabled={!isAuctionActive}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!isAuctionActive}
                                className="w-full py-5 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest disabled:bg-gray-400 disabled:shadow-none"
                            >
                                Confirmar Lance
                            </button>
                        </form>

                         <div className="bg-white p-6 rounded-2xl shadow-sm border">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                <BrainCircuit className="w-5 h-5 mr-2 text-blue-600" /> Sugestão da IA
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Nossa IA analisa a concorrência e sugere um valor estratégico para seu lance.
                            </p>
                             <button className="w-full text-sm py-3 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-all">
                                Gerar Sugestão
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionRoom;