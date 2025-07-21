import React from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from './components/Footer';
import Header from './components/Header';
import Mypage from './pages/Mypage/Mypage';

function App() {
  return (
  
    <Router>
       <Header/>
      <Routes>
        <Route path='/Mypage' element ={<Mypage />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer/>
    </Router>
    
  
  );
}

export default App;