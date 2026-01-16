import React from 'react';
import { Zap, BrainCircuit, ShieldCheck, TrendingDown } from 'lucide-react';

const features = [
  {
    title: 'Leilão em Tempo Real',
    description: 'Sinta a adrenalina da competição com atualizações instantâneas via WebSockets. Sem recarregar a página.',
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
  },
  {
    title: 'Inteligência Artificial',
    description: 'Nossa IA sugere lances estratégicos e analisa o comportamento do mercado para você nunca perder uma oportunidade.',
    icon: <BrainCircuit className="w-8 h-8 text-blue-400" />,
  },
  {
    title: 'Segurança Anti-Fraude',
    description: 'Algoritmos avançados detectam comportamentos suspeitos e lances automatizados (bots) em milissegundos.',
    icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
  },
  {
    title: 'Menor Preço Vence',
    description: 'Modelo de leilão reverso otimizado para garantir economia máxima aos compradores e competitividade aos fornecedores.',
    icon: <TrendingDown className="w-8 h-8 text-red-400" />,
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Por que escolher a ShortWin?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Combinamos transparência, velocidade e inteligência artificial para revolucionar o processo de compras e suprimentos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-8 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4 bg-white w-14 h-14 rounded-lg flex items-center justify-center shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;