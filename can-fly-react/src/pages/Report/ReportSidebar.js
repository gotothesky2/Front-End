import React, { useState } from 'react';
import '../../styles/ReportSidebar.css';
import '../../styles/Report.css';

const sections = [
  { id: 'aptitude', label: '적성·흥미 검사 분석 결과' },
  { id: 'grades', label: '성적 추이' },
  { id: 'interest', label: '관심 학과/학교 분석' },
  { id: 'summary', label: '종합 분석' },
];

const ReportSidebar = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleClick = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="report-sidebar">
      <h3 className='sidebar-title'>레포트 목차</h3>
      {sections.map((section) => (
        <button
          key={section.id}
          className={`report-sidebar-button ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => handleClick(section.id)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
};

export default ReportSidebar;
