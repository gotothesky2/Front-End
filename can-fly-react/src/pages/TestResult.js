import React, { useState, useEffect } from "react";
import "../styles/TestResult.css";

import { aiGet } from "../api/aiApi";
import AIconfig from "../api/AIconfig";

const semesterList = [
  "1-1학기",
  "1-2학기",
  "2-1학기",
  "2-2학기",
  "3-1학기",
  "3-2학기",
];

const formatHmtDataBySemester = (rawData) => {
  const semesterMap = {};

  rawData.forEach((item) => {
    const { hmtGradeNum, hmtTermNum, uploadTime, DownloadUrl, id } = item;
    const semesterKey = `${hmtGradeNum}-${hmtTermNum}학기`; //

    if (!semesterMap[semesterKey]) {
      semesterMap[semesterKey] = [];
    }

    semesterMap[semesterKey].push({
      id,
      uploadTime,
      DownloadUrl,
    });
  });

  return semesterMap; // { "1-1학기": [...], "2-1학기": [...] }
};

const TestResult = () => {
  const [hmtList, setHmtList] = useState([]);
  const [cstList, setCstList] = useState([]);

  // 흥미검사 목록 조회 api
  const fetchHmtList = async () => {
    try {
      const res = await aiGet(AIconfig.INTEREST.MY_HMT);
      console.log("흥미검사 목록 조회 성공:", res);
      const formatted = formatHmtDataBySemester(res.data);
      setHmtList(formatted);
    } catch (error) {
      console.error("흥미검사 목록 조회 실패:", error);
      alert("흥미검사 목록 조회에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    fetchHmtList();
  }, []);

  return (
    <div className="test-results">
      <h2 className="main-title">적성 검사 결과</h2>
      {semesterList.map((semester, idx) => (
        <div key={idx} className="semester-container">
          <h3 className="semester-title">{semester}</h3>
          <div className="big-box">
            {/* 직업 적성 검사 */}
            <div className="category-wrapper">
              <div className="category-title">• 직업 적성 검사</div>
              <div className="category-box">
                <div className="pdf-list">
                  {cstList.map((cst, i) => (
                    <div key={i} className="pdf-item">
                      <img
                        src="/icon/pdf_icon.png"
                        alt="pdf"
                        className="pdf-icon"
                      />
                      <span className="pdf-date">{cst}</span>
                      <img
                        src="/icon/upload.jpg"
                        alt="upload"
                        className="upload-icon"
                      />
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
                  {(hmtList[semester] || []).map((pdf, i) => (
                    <div key={i} className="pdf-item">
                      <img
                        src="/icon/pdf_icon.png"
                        alt="pdf"
                        className="pdf-icon"
                      />
                      <a
                        href={pdf.DownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-date"
                      >
                        {new Date(pdf.uploadTime).toLocaleString("ko-KR")}
                      </a>
                      <img
                        src="/icon/upload.jpg"
                        alt="upload"
                        className="upload-icon"
                      />
                    </div>
                  ))}
                  {(hmtList[semester] || []).length === 0 && (
                    <div className="no-pdf">PDF 없음</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestResult;
