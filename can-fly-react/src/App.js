import React from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from './components/Footer';
import Header from './components/Header';

function App() {
  return (
  
    <Router>
       <Header/>
      <Routes>
       
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer/>
    </Router>
    
  
  );
}

export default App;