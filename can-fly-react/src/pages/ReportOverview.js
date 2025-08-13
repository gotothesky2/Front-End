import React from 'react';
import '../styles/ReportOverview.css';

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

const ReportOverview = () => (
  <div className="test-results">
    <h2 className="main-title">적성 검사 결과</h2>
    {testData.map((semesterData, idx) => (
      <div key={idx} className="semester-container">
        <h3 className="semester-title">{semesterData.semester}</h3>
        <div className="big-box">
            {/* 1학기 */}
            <div className="category-wrapper">
            <div className="category-title">• 1학기</div>
            <div className="category-box">
                <div className="pdf-list">
                {semesterData.aptitude.map((date, i) => (
                <div className="pdf-item">
                <span className="pdf-date">{date}</span>
                <img
                    src="/icon/right_arrow.jpg"
                    alt="arrow"
                    className="arrow-icon rotated"
                />
                </div>

                ))}
                </div>
            </div>
            </div>

            {/* 2학기 */}
            <div className="category-wrapper">
            <div className="category-title">• 2학기</div>
            <div className="category-box">
                <div className="pdf-list">
                {semesterData.interest.map((date, i) => (  
                <div className="pdf-item">
                    <span className="pdf-date">{date}</span>
                    <img
                        src="/icon/right_arrow.jpg"
                        alt="arrow"
                        className="arrow-icon rotated"
                    />
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

export default ReportOverview;
