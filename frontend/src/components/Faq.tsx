import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'O que é um leilão reverso?',
    answer: 'É um tipo de leilão onde os vendedores competem para oferecer o menor preço por um produto ou serviço. Ao contrário de um leilão tradicional, aqui o menor lance vence.',
  },
  {
    question: 'Como posso participar de um leilão?',
    answer: 'Você precisa se cadastrar como "fornecedor". Após o login, você poderá ver os leilões ativos e enviar seus lances. Lembre-se, o objetivo é oferecer o menor preço.',
  },
  {
    question: 'Eu sou um comprador, como crio um leilão?',
    answer: 'Cadastre-se como "comprador". Em seu painel, você terá a opção de "Criar Novo Leilão", onde poderá especificar o produto ou serviço que deseja adquirir, o preço inicial (teto) e a data de término.',
  },
  {
    question: 'O que acontece se o meu lance for o menor?',
    answer: 'Se o seu lance for o menor ao final do leilão, o comprador entrará em contato com você para formalizar a transação. Nossa plataforma apenas facilita o encontro, a negociação final é entre as partes.',
  },
    {
    question: 'Posso alterar meu lance?',
    answer: 'Sim, você pode atualizar seu lance a qualquer momento enquanto o leilão estiver ativo. Se você der um lance mais baixo, ele substituirá o seu lance anterior.',
  },
    {
    question: 'A plataforma é segura?',
    answer: 'Sim. Utilizamos criptografia para proteger seus dados e um sistema de IA para detectar comportamentos suspeitos, garantindo um ambiente de negociação justo e seguro para todos.',
  },
];

const FaqItem = ({ faq, isOpen, onToggle }: { faq: any, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="border-b border-gray-200 py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={onToggle}
      >
        <h3 className="text-lg font-bold text-blue-900">{faq.question}</h3>
        {isOpen ? <ChevronUp className="w-6 h-6 text-blue-700" /> : <ChevronDown className="w-6 h-6 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 leading-relaxed animate-in fade-in duration-500">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-blue-900 sm:text-5xl">
            Perguntas Frequentes
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Tudo o que você precisa saber sobre nossa plataforma de leilão reverso.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
