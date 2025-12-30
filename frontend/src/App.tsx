import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';

import Marketplace from './pages/Marketplace';
import AiDetect from './pages/AiDetect';
import IoT from './pages/IoT';

// Placeholder Components for other pages

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Community from './pages/Community';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showHeader = location.pathname !== '/' && location.pathname !== '/signup';

  return (
    <>
      {showHeader && <Header />}
      <main className={showHeader ? "" : ""}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/iot" element={<IoT />} />
          <Route path="/ai-detect" element={<AiDetect />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
