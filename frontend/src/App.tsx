import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AuctionList from './components/AuctionList';
import PrivateRoute from './components/PrivateRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import CreateAuction from './pages/CreateAuction';
import AuctionRoom from './pages/AuctionRoom';
import Faq from './pages/Faq';
import AboutUs from './pages/AboutUs';
import ResetPassword from './pages/ResetPassword';



const HomePage = () => (
  <>
    <Hero />
    <Features />
    <AuctionList />
    {/* Footer viria aqui futuramente */}
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Toaster position='top-right' reverseOrder={false} />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/quem-somos" element={<AboutUs />} />
          {/* Rotas futuras: /auctions/:id, /dashboard */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/auctions/create' element={<CreateAuction />}/>
            <Route path="/auctions/:id" element={<AuctionRoom />} />
          </Route>
          {/* Rotas Públicas de Recuperação */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* <Route path="/forgot-password" element={<ForgotPassword />} />
           */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;