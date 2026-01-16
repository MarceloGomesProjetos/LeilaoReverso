import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Lado Esquerdo: Logo e Menu */}
          <div className="flex items-center space-x-8">
            {/* Logo Fixo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <span className="text-2xl font-bold tracking-tight">Short<span className="text-blue-300">Win</span></span>
            </div>

            {/* Menu de Navegação */}
            <div className="hidden md:flex space-x-6 text-sm font-medium">
              <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
              <Link to="/quem-somos" className="hover:text-blue-200 transition-colors">Quem Somos</Link>
              <Link to="/servicos" className="hover:text-blue-200 transition-colors">Serviços</Link>
              <Link to="/produtos" className="hover:text-blue-200 transition-colors">Produtos</Link>
              <Link to="/faq" className="hover:text-blue-200 transition-colors">FAQ's</Link>
            </div>
          </div>

          {/* Lado Direito: Ações de Usuário */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium hover:bg-blue-800 rounded-md transition-all"
            >
              Entrar
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-blue-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-50 transition-all shadow-sm"
            >
              Cadastrar
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;