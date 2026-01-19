import React from 'react';
import ReactMarkdown from 'react-markdown';
import logo from '../assets/logoFloripaShort-old.jpg'; // Usando seu arquivo atual

const AboutUs = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Banner de Topo Full-Width */}
      <div className="w-full bg-blue-700 py-20 px-6 text-center text-white">
        <img src={logo} alt="ShortWin Logo" className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-blue-400 shadow-xl" />
        <h1 className="text-5xl font-black mb-4">Quem Somos</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
          Transformando a complexidade do seu negócio em sistemas eficientes e escaláveis.
        </p>
      </div>

      {/* Conteúdo do Markdown com Estilização Tailwind */}
      <div className="max-w-4xl mx-auto py-16 px-6 prose prose-blue prose-lg">
        <section className="space-y-8 text-gray-700 leading-relaxed">
          <h2 className="text-3xl font-bold text-blue-900 border-b-2 border-blue-100 pb-2">Nossa Missão e Expertise</h2>
          <p>
            Nossa missão é clara: **impulsionar a excelência operacional** dos nAdeossos clientes. 
            Entendemos que o software é o motor da vantagem competitiva moderna.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-blue-700 text-xl mb-3">Desenvolvimento Customizado</h3>
              <p className="text-sm">Mergulhamos no seu fluxo de trabalho para construir sistemas que resolvem problemas específicos.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-blue-700 text-xl mb-3">Licenciamento Flexível</h3>
              <p className="text-sm">Garantimos que a solução evolua junto com o seu negócio, proporcionando controle total.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-blue-900 border-b-2 border-blue-100 pb-2">O Valor da Customização</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 my-8">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="p-4 font-bold">Benefício Estratégico</th>
                  <th className="p-4 font-bold">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 font-bold text-blue-900">Vantagem Competitiva</td>
                  <td className="p-4">Sistemas que automatizam processos únicos do seu negócio.</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-blue-900">Eficiência Máxima</td>
                  <td className="p-4">Eliminação de etapas desnecessárias e integração perfeita.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-20 p-10 bg-blue-50 rounded-3xl text-center border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Pronto para iniciar essa jornada?</h3>
          <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
            FALE CONOSCO AGORA
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;