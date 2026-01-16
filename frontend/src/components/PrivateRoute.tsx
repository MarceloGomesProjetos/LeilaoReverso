import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Verifica se o token existe no localStorage
  const isAuthenticated = !!localStorage.getItem('@ShortWin:token');

  // Se estiver autenticado, renderiza a rota filha (Outlet). Se não, vai para /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;