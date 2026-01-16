import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Verifica se existe um token para saber se o usuário está logado
  const isAuthenticated = !!localStorage.getItem('@ShortWin:token');
  const user = JSON.parse(localStorage.getItem('@ShortWin:user') || '{}');

  const handleLogout = () => {
    // Remove os dados do localStorage
    localStorage.removeItem('@ShortWin:token');
    localStorage.removeItem('@ShortWin:user');
    
    toast.success('Sessão encerrada com sucesso!');
    navigate('/login'); // Redireciona para o login
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50 w-full px-6 lg:px-12">
      <div className="flex justify-between items-center h-16">
        
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Short<span className="text-blue-300">Win</span>
          </Link>

          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
            <Link to="/quem-somos" className="hover:text-blue-200 transition-colors">Quem Somos</Link>
            <Link to="/servicos" className="hover:text-blue-200 transition-colors">Serviços</Link>
            <Link to="/produtos" className="hover:text-blue-200 transition-colors">Produtos</Link>
            <Link to="/faq" className="hover:text-blue-200 transition-colors">FAQ's</Link>
            
            {isAuthenticated && (
              <Link to="/dashboard" className="hover:text-blue-200 transition-colors font-bold text-blue-200">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium hover:bg-blue-800 rounded-md transition-all">
                Entrar
              </Link>
              <Link to="/register" className="bg-white text-blue-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-50 transition-all shadow-sm">
                Cadastrar
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm font-medium border-r border-blue-600 pr-6">
                <User className="w-4 h-4 mr-2" />
                <span>{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center text-sm font-bold text-red-200 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;