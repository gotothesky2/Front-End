import React from 'react';
import '../styles/TestResult.css';

const testData = [
  {
    semester: '1-1학기',
    aptitude: [
      '2019년 03월 01일 - 23시 55분 02초',
      '2019년 03월 02일 - 04시 09분 08초',
      '2019년 05월 31일 - 17시 09분 08초',
    ],
    interest: [
      '2019년 03월 01일 - 23시 55분 02초',
    ],
  },
  {
    semester: '1-2학기',
    aptitude: [],
    interest: [],
  },
  {
    semester: '2-1학기',
    aptitude: [],
    interest: [],
  },
  {
    semester: '2-2학기',
    aptitude: [],
    interest: [],
  },
  {
    semester: '3-1학기',
    aptitude: [],
    interest: [],
  },
];

const TestResult = () => (
  <div className="test-results">
    <h2 className="main-title">적성 검사 결과</h2>
    {testData.map((semesterData, idx) => (
      <div key={idx} className="semester-container">
        <h3 className="semester-title">{semesterData.semester}</h3>
        <div className="big-box">
            {/* 직업 적성 검사 */}
            <div className="category-wrapper">
            <div className="category-title">• 직업 적성 검사</div>
            <div className="category-box">
                <div className="pdf-list">
                {semesterData.aptitude.map((date, i) => (
                    <div key={i} className="pdf-item">
                    <img src="/icon/pdf_icon.png" alt="pdf" className="pdf-icon" />
                    <span className="pdf-date">{date}</span>
                    <img src="/icon/upload.jpg" alt="upload" className="upload-icon" />
                    </div>
                ))}
                </div>
            </div>
            </div>

            {/* 직업 흥미 검사 */}
            <div className="category-wrapper">
            <div className="category-title">• 직업 흥미 검사</div>
            <div className="category-box">
                <div className="pdf-list">
                {semesterData.aptitude.map((date, i) => (
                    <div key={i} className="pdf-item">
                    <img src="/icon/pdf_icon.png" alt="pdf" className="pdf-icon" />
                    <span className="pdf-date">{date}</span>
                    <img src="/icon/upload.jpg" alt="upload" className="upload-icon" />
                    </div>
                ))}
                </div>
            </div>
            </div>

        </div>
      </div>
    ))}
  </div>
);

export default TestResult;
