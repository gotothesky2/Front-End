import React from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Report from './pages/Report/Report';
import StudentGrade from './pages/GradeInput/StudentGrade';
import ExamGrade from './pages/GradeInput/ExamGrade';
import Footer from './components/Footer';
import Header from './components/Header';
import TestSelectPage from './pages/TestSelectPage';
import AptitudeTest from './pages/AptitudeTest';
import InterestTest from './pages/InterestTest';
import InterestTestPage7 from './pages/InterestTestPage7';
import TokenChargePage from './pages/TokenChargePage';

function App() {
  return (
  
    <Router>
       <Header/>
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestSelectPage />} />
        <Route path="/aptitudetest" element={<AptitudeTest />} />
        <Route path='/report' element={<Report />} />
        <Route path="/gradeinput" element={<StudentGrade />} />
        <Route path="/gradeinput/exam" element={<ExamGrade />} />
        <Route path="/interesttest" element={<InterestTest />} />
        <Route path="/interesttestpage7" element={<InterestTestPage7 />} />
        <Route path="/tokencharge" element={<TokenChargePage />} />
      </Routes>
      <Footer/>
    </Router>
    
  
  );
}

export default App;