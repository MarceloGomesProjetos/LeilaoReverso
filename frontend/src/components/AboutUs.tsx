import React from 'react';
import { Building, Target, Users, Zap } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-white">
      {/* Seção Hero */}
      <div className="relative bg-blue-800 text-white py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-900 opacity-50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Sobre a ShortWin</h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-blue-200">
            Revolucionando a forma como empresas adquirem produtos e serviços através da tecnologia de leilão reverso inteligente.
          </p>
        </div>
      </div>

      {/* Seção de Missão, Visão e Valores */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mx-auto mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900">Nossa Missão</h2>
              <p className="mt-4 text-gray-600">
                Democratizar o acesso a negociações justas e eficientes, conectando compradores e fornecedores em uma plataforma transparente que gera economia real e valor para todos.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900">Nossa Visão</h2>
              <p className="mt-4 text-gray-600">
                Ser a principal referência em leilões reversos na América Latina, reconhecida pela inovação, segurança e pelo impacto positivo que geramos nos negócios de nossos clientes.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900">Nossos Valores</h2>
              <p className="mt-4 text-gray-600">
                Transparência, Integridade, Inovação, Foco no Cliente e Paixão por Resultados. Estes são os pilares que guiam cada uma de nossas decisões e ações.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção "Nossa História" */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Nossa História</h2>
              <p className="text-gray-600 mb-4">
                Fundada em 2023 por um grupo de entusiastas de tecnologia e especialistas em compras corporativas, a ShortWin nasceu da percepção de que muitas empresas ainda utilizavam métodos arcaicos e ineficientes para adquirir bens e serviços.
              </p>
              <p className="text-gray-600">
                Vimos a oportunidade de aplicar a tecnologia para criar um ambiente de negociação mais dinâmico, justo e vantajoso. Começamos com uma ideia simples: inverter a lógica do leilão para que o poder de negociação ficasse nas mãos do comprador, incentivando a competição saudável entre fornecedores. Hoje, somos uma plataforma robusta que atende centenas de empresas em todo o Brasil.
              </p>
            </div>
            <div className="flex justify-center">
              <Building className="w-64 h-64 text-blue-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
