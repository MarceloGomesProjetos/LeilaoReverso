import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AuctionList from './components/AuctionList';
import Register from './components/Register';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import CreateAuction from './components/CreateAuction';
import AuctionRoom from './components/AuctionRoom';
import Faq from './components/Faq';
import AboutUs from './components/AboutUs';


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
        </Routes>
      </div>
    </Router>
  );
}

export default App;