import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/AptitudeTest.css';

const AptitudeTest = () => {
  const QUESTIONS_PER_PAGE = 8;
  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [page, setPage] = useState(0);
  const questionRefs = useRef([]);

useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/questions');
      console.log("✅ API 연결 성공");
      console.log("📦 응답 전체 구조:", res.data);
      console.log("🔍 첫 번째 질문 상세", res.data.RESULT[0]);  // ← 이 줄이 핵심!
      
      const questionData = res.data.RESULT;
      setAllQuestions(questionData);
      setAnswers(Array(questionData.length).fill(null));
    } catch (err) {
      console.error("❌ API 연결 실패:", err);
    }
  };
  fetchQuestions();
}, []);



  const handleSelect = (qIdx, value) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const checkUnansweredAndScroll = () => {
    const startIdx = page * QUESTIONS_PER_PAGE;
    const endIdx = startIdx + QUESTIONS_PER_PAGE;
    const unansweredIndex = answers
      .slice(startIdx, endIdx)
      .findIndex(ans => ans === null);

    if (unansweredIndex !== -1) {
      const absoluteIndex = startIdx + unansweredIndex;
      alert(`${absoluteIndex + 1}번 문항을 답변하지 않았습니다.\n답변해주세요.`);
      questionRefs.current[absoluteIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentQuestions = allQuestions.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

  // ✅ 질문 로딩 전에는 안내 메시지 출력
  if (allQuestions.length === 0) {
    return (
      <div className="aptitude-container">
        <p>문항을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="aptitude-container">
      <div className="banner-with-image">
        <div className="banner-text">
          <h2>직업 적성 검사</h2>
          <p>
            나의 잠재된 능력을 발견하고, 진로의 방향을 명확히 설정해보세요.<br />
            직업 적성 검사는 내가 무엇을 잘할 수 있는지를 과학적으로 분석해,
            전공 선택과 진로 탐색에 객관적인 기준을 제공합니다.
          </p>
        </div>
        <img src="/img/직업적성검사_버튼.png" alt="직업 적성 검사" className="banner-image" />
      </div>

      <div className="questions-wrapper">
        <h3>문항 {page * QUESTIONS_PER_PAGE + 1} ~ {(page + 1) * QUESTIONS_PER_PAGE}</h3>
        <p className="small-guide">각 항목을 잘 읽고 자신에게 해당하는 정도를 선택해주세요.</p>
        <hr />
        {currentQuestions.map((q, idx) => {
          const absoluteIndex = page * QUESTIONS_PER_PAGE + idx;

          return (
            <div
              key={absoluteIndex}
              className="question-block"
              ref={el => questionRefs.current[absoluteIndex] = el}
            >
              <div className="question-text">{absoluteIndex + 1}. {q.question}</div>
              <div className="circle-options">
                {[1, 2, 3, 4, 5, 6, 7].map((value, i) => (
                  <div key={value} className="circle-container">
                    <div
                      className={`circle ${answers[absoluteIndex] === value ? 'selected' : ''}`}
                      onClick={() => handleSelect(absoluteIndex, value)}
                    ></div>
                    {i === 0 && <div className="circle-label">〈 전혀 그렇지 않다</div>}
                    {i === 6 && <div className="circle-label">매우 그렇다 〉</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="button-group">
          <button className="save-button">임시 저장</button>
          {page < Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) - 1 && (
            <button className="next-button" onClick={checkUnansweredAndScroll}>
              다음 페이지 &gt;
            </button>
          )}
          {page === Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) - 1 && (
            <button className="next-button">제출하기</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
