import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useAuctionSocket = (auctionId: string) => {
  const [lastBid, setLastBid] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000'); // URL do seu backend

    // Entra na sala específica do leilão
    newSocket.emit('join_auction', auctionId);

    // Escuta novos lances disparados pelo backend
    newSocket.on('bid_updated', (bid) => {
      setLastBid(bid);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auctionId]);

  return { lastBid };
};