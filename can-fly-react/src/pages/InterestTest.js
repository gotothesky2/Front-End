import React, { useState, useRef, useEffect } from 'react';
import '../styles/InterestTest.css';
import { useNavigate } from 'react-router-dom';

const InterestTest = () => {
  const navigate = useNavigate();

  const questionSets = [
    { title: "일반 흥미", questions: Array.from({ length: 20 }, (_, i) => `일반 흥미 문제 ${i + 1}`) },
    { title: "일반 흥미", questions: Array.from({ length: 20 }, (_, i) => `일반 흥미 문제 ${i + 21}`) },
    { title: "일반 흥미", questions: Array.from({ length: 20 }, (_, i) => `일반 흥미 문제 ${i + 41}`) },
    { title: "선호 직업", questions: Array.from({ length: 20 }, (_, i) => `선호 직업 문제 ${i + 61}`) },
    { title: "선호 직업", questions: Array.from({ length: 20 }, (_, i) => `선호 직업 문제 ${i + 81}`) },
    { title: "선호 직업", questions: Array.from({ length: 20 }, (_, i) => `선호 직업 문제 ${i + 101}`) },
  ];

  const [page, setPage] = useState(0);
  const questions = questionSets[page].questions;
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const questionRefs = useRef([]);

  useEffect(() => {
    setAnswers(Array(questions.length).fill(null));
  }, [page]);

  const handleSelect = (qIdx, value) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const checkUnansweredAndScroll = () => {
    const unansweredIndex = answers.findIndex(ans => ans === null);
    if (unansweredIndex !== -1) {
      window.alert(`${unansweredIndex + 1}번 문항을 답변하지 않았습니다.\n답변해주세요.`);
      questionRefs.current[unansweredIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      if (page < questionSets.length - 1) {
        setPage(page + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // 마지막 페이지면 다음 페이지(interesttestpage7)로 이동
        navigate('/interesttestpage7');
      }
    }
  };

  return (
    <div className="interest-container">
      <div className="banner-with-image">
        <div className="banner-text">
          <h2>직업 흥미 검사</h2>
          <p>
            내가 진짜 ‘좋아하는 일’은 무엇일까? 흥미는 진로의 원동력입니다.<br/>
            직업 흥미 검사는 개인의 성격과 관심사를 바탕으로, 즐겁게 몰입할 수 있는 직업군과 전공 분야를 탐색하는 과정입니다.
            입시에서 전공 적합성과 자기소개서 작성에 활용 가능하며, 흥미 기반의 선택은 진로 방황을 줄이고 학업 만족도를 높이는 데 기여합니다.
          </p>
        </div>
        <img src="/img/직업흥미검사_버튼.png" alt="직업 흥미 검사" className="banner-image" />
      </div>

      <div className="questions-wrapper">
        <h3>{questionSets[page].title} 페이지</h3>
        <p className="small-guide">각 항목을 잘 읽고 자신에게 해당하는 정도를 선택해주세요.</p>
        <hr></hr>
        {questions.map((q, idx) => (
          <div 
            key={idx} 
            className="question-block"
            ref={el => questionRefs.current[idx] = el}
          >
            <div className="question-text">{idx + 1}. {q}</div>
            <div className="circle-options">
              {[1,2,3,4,5].map((value, i) => (
                <div key={value} className="circle-container">
                  <div 
                    className={`circle ${answers[idx] === value ? 'selected' : ''}`}
                    onClick={() => handleSelect(idx, value)}
                  ></div>
                  {i === 0 && <div className="circle-label">〈 매우 싫어한다</div>}
                  {i === 4 && <div className="circle-label">매우 좋아한다 〉</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="button-group">
          <button className="save-button">임시 저장</button>
          <button className="next-button" onClick={checkUnansweredAndScroll}>
            다음 페이지 &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestTest;
