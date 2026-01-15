import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import api from '../services/api'; // Sua instância do Axios

const AuctionRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { lastBid } = useAuctionSocket(id!);
  const [auction, setAuction] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<number | null>(null);

  // Carrega dados iniciais do leilão
  useEffect(() => {
    const loadData = async () => {
      const res = await api.get(`/auctions/${id}`);
      setAuction(res.data);
    };
    loadData();
  }, [id]);

  // Busca sugestão da IA quando o preço muda ou ao carregar
  const fetchSuggestion = async () => {
    try {
      const res = await api.get(`/auctions/${id}/suggest`);
      setSuggestion(res.data.suggested_amount);
    } catch (err) {
      console.error("Erro ao buscar sugestão da IA");
    }
  };

  useEffect(() => {
    fetchSuggestion();
    if (lastBid) {
      setAuction((prev: any) => ({ ...prev, current_price: lastBid.bid_amount }));
    }
  }, [lastBid]);

  if (!auction) return <p>Carregando...</p>;

  return (
    <div className="auction-container">
      <h1>{auction.title}</h1>
      <div className="price-card">
        <h2>Preço Atual: R$ {auction.current_price}</h2>
        <p>Lances totais: {auction.bid_count || 0}</p>
      </div>

      {/* Diferencial: Módulo de IA no Frontend */}
      {suggestion && (
        <div className="ai-suggestion-box">
          <span>🤖 Dica da IA:</span>
          <p>Para vencer agora, sugerimos um lance de: <strong>R$ {suggestion}</strong></p>
          <button onClick={() => {/* Preencher formulário com o valor */}}>
            Usar Sugestão
          </button>
        </div>
      )}

      {/* Lista de lances em tempo real viria aqui */}
    </div>
  );
};

export default AuctionRoom;