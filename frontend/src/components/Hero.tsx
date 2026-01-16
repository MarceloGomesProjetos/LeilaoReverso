import React from 'react';
import { ArrowRight, BarChart2, ShieldCheck } from 'lucide-react'; // Ícones para reforçar a IA e Segurança

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-blue-700 to-blue-900 text-white py-20 overflow-hidden">
      <div className="w-full flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-8">
        
        {/* Lado Esquerdo: Conteúdo de Texto */}
        <div className="md:w-1/2 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            O futuro das compras corporativas é <span className="text-blue-300">inteligente.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
            Plataforma de leilão reverso com IA integrada para garantir os menores lances e detectar fraudes em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg group">
              Começar agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-blue-600 bg-opacity-50 border border-blue-400 font-semibold rounded-lg hover:bg-opacity-70 transition-all">
              Ver demonstração
            </button>
          </div>

          {/* Badges de Confiança */}
          <div className="mt-10 flex items-center space-x-6 text-blue-200 text-sm">
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" /> Segurado por IA
            </div>
            <div className="flex items-center">
              <BarChart2 className="w-5 h-5 mr-2" /> Dados em Tempo Real
            </div>
          </div>
        </div>

        {/* Lado Direito: Elemento Visual (Abstracto ou Imagem) */}
        <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute"></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
             {/* Simulação de um Card de Leilão */}
             <div className="w-64 h-40 flex flex-col justify-center">
                <div className="h-4 w-2/3 bg-blue-300 rounded mb-4"></div>
                <div className="h-8 w-full bg-white/20 rounded mb-4"></div>
                <div className="mt-auto flex justify-between items-center">
                   <div className="h-6 w-1/3 bg-green-400 rounded"></div>
                   <div className="h-4 w-1/4 bg-blue-300 rounded"></div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;