import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Report from './pages/Report/Report';
import StudentGrade from './pages/GradeInput/StudentGrade';
import ExamGrade from './pages/GradeInput/ExamGrade';
import Footer from './components/Footer';
import Header from './components/Header';

function App() {
  return (
  
    <Router>
       <Header/>
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/report' element={<Report />} />
        <Route path="/gradeinput" element={<StudentGrade />} />
        <Route path="/gradeinput/exam" element={<ExamGrade />} />
      </Routes>
      <Footer/>
    </Router>
    
  
  );
}

export default App;