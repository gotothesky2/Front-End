import React from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Report from './pages/Report/Report';
import StudentGrade from './pages/GradeInput/StudentGrade';
import ExamGrade from './pages/GradeInput/ExamGrade';
import Footer from './components/Footer';
import Header from './components/Header';
import Mypage from './pages/Mypage/Mypage';
import TestSelectPage from './pages/TestSelectPage';
import AptitudeTest from './pages/AptitudeTest';
import InterestTest from './pages/InterestTest';
import InterestTestPage7 from './pages/InterestTestPage7';
import TokenChargePage from './pages/TokenChargePage';
import TestCompletePage from './pages/TestCompletePage';
import TestResult from './pages/TestResult';
import Departmentselection from './pages/Departmentselection/Departmentselection';
import ReportOverview from './pages/ReportOverview';
import { CookiesProvider } from "react-cookie";


function App() {
  return (
  <CookiesProvider>
    <Router>
       <Header/>
     
      <Routes>
        <Route path='/Mypage' element ={<Mypage />} />
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestSelectPage />} />
        <Route path="/aptitudetest" element={<AptitudeTest />} />
        <Route path='/report/:id' element={<Report />} />
        <Route path="/gradeinput" element={<StudentGrade />} />
        <Route path="/gradeinput/exam" element={<ExamGrade />} />
        <Route path="/interesttest" element={<InterestTest />} />
        <Route path="/interesttestpage7" element={<InterestTestPage7 />} />
        <Route path="/tokencharge" element={<TokenChargePage />} />
        <Route path="/testcomplete" element={<TestCompletePage/>}/>
        <Route path="/Departmentselection" element={<Departmentselection/>}/>
        <Route path="/testresult" element={<TestResult/>}/>
        <Route path="/reportoverview" element={<ReportOverview/>}/>
      </Routes>
      <Footer/>
    </Router>
  </CookiesProvider>
  
  );
}

export default App;