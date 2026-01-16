import React, { useEffect, useState } from 'react';
import { Timer, Gavel, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

// Interface baseada no seu auctionController.js
interface Auction {
  id: number;
  title: string;
  category: string;
  current_price: number;
  bid_count: number;
  
  end_date: string;
  buyer_company: string;
}

const AuctionList = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    // Aqui você chamará seu endpoint: api.get('/auctions/active')
    // Por enquanto, usaremos dados fictícios para visualizar o design
    const mockData: Auction[] = [
      {
        id: 1,
        title: "Lote de Notebooks Corporativos",
        category: "Tecnologia",
        current_price: 45000.00,
        bid_count: 12,
        end_date: "2024-12-20T18:00:00Z",
        buyer_company: "Tech Corp Brasil"
      },
      {
        id: 2,
        title: "Serviço de Limpeza Industrial - Q4",
        category: "Serviços",
        current_price: 12500.00,
        bid_count: 5,
        end_date: "2024-11-15T10:00:00Z",
        buyer_company: "Logística S.A."
      }
    ];
    setAuctions(mockData);
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">Leilões Ativos</h2>
            <p className="text-gray-600">Explore as melhores oportunidades em tempo real</p>
          </div>
          <button className="bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors">Ver todos</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                    {auction.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Timer className="w-4 h-4 mr-1 text-orange-500" />
                    2h 15m
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                  {auction.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4">Empresa: {auction.buyer_company}</p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <span className="text-gray-600 text-sm block">Preço Atual</span>
                  <span className="text-2xl font-black text-blue-700">
                    R$ {auction.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Gavel className="w-4 h-4 mr-1" />
                    {auction.bid_count} lances
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Menor lance vence
                  </div>
                </div>

                <Link 
                  to={`/auctions/${auction.id}`}
                  className="block w-full text-center py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Participar do Leilão
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuctionList;