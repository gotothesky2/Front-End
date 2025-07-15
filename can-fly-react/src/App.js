import React from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from './components/Footer';
import Header from './components/Header';
import TestSelectPage from './pages/TestSelectPage';
import AptitudeTest from './pages/AptitudeTest';

function App() {
  return (
  
    <Router>
       <Header/>
      <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestSelectPage />} />
        <Route path="/aptitudetest" element={<AptitudeTest />} />
      </Routes>
      <Footer/>
    </Router>
    
  
  );
}

export default App;