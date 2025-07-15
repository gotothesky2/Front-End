import React, { useState, useRef, useEffect } from 'react';
import '../styles/AptitudeTest.css';

const AptitudeTest = () => {
  const questionSets = [
    { title: "신체·운동능력", questions: ["몸을 구부리는 동작을 잘 할 수 있다.", "힘이 드는 동작을 잘 할 수 있다.", "운동기구를 능숙하게 사용한다.", "새로운 동작을 쉽게 배운다.", "몸의 균형을 잘 잡는다.", "여러 부위를 동시에 움직인다.", "상황을 잘 판단하고 대응한다.", "효과적인 방법으로 운동한다."] },
    { title: "손재능", questions: ["손재능 문제1", "손재능 문제2", "손재능 문제3", "손재능 문제4", "손재능 문제5", "손재능 문제6", "손재능 문제7", "손재능 문제8"] },
    { title: "공간지각력", questions: ["공간지각 문제1", "공간지각 문제2","공간지각 문제3","공간지각 문제4","공간지각 문제5","공간지각 문제6","공간지각 문제7","공간지각 문제8"] },
    { title: "음악능력", questions: ["음악 문제1", "음악 문제2","음악 문제3","음악 문제4","음악 문제5","음악 문제6","음악 문제7","음악 문제8"] },
    { title: "창의력", questions: ["창의력 문제1", "창의력 문제2","창의력 문제3","창의력 문제4","창의력 문제5","창의력 문제6","창의력 문제7","창의력 문제8"] },
    { title: "언어능력", questions: ["언어 문제1", "언어 문제2","언어 문제3","언어 문제4","언어 문제5","언어 문제6","언어 문제7","언어 문제8"] },
    { title: "수리·논리력", questions: ["수리 문제1", "수리 문제2","수리 문제3","수리 문제4","수리 문제5","수리 문제6","수리 문제7","수리 문제8"] },
    { title: "자기성찰능력", questions: ["자기성찰 문제1", "자기성찰 문제2","자기성찰 문제3","자기성찰 문제4","자기성찰 문제5","자기성찰 문제6","자기성찰 문제7","자기성찰 문제8"] },
    { title: "대인관계능력", questions: ["대인 문제1", "대인 문제2","대인 문제3","대인 문제4","대인 문제5","대인 문제6","대인 문제7","대인 문제8"] },
    { title: "자연친화력", questions: ["자연 문제1", "자연 문제2","자연 문제3","자연 문제4","자연 문제5","자연 문제6","자연 문제7","자연 문제8"] },
    { title: "예술시각능력", questions: ["예술 문제1", "예술 문제2","예술 문제3","예술 문제4","예술 문제5","예술 문제6","예술 문제7","예술 문제8  "] }
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
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="aptitude-container">
      <div className="banner-with-image">
        <div className="banner-text">
          <h2>직업 적성 검사</h2>
          <p>
            나의 잠재된 능력을 발견하고, 진로의 방향을 명확히 설정해보세요.<br/>
            직업 적성 검사는 내가 무엇을 잘할 수 있는지를 과학적으로 분석해, 
            전공 선택과 진로 탐색에 객관적인 기준을 제공합니다.
          </p>
        </div>
        <img src="/img/직업적성검사_버튼.png" alt="직업 적성 검사" className="banner-image" />
      </div>

      <div className="questions-wrapper">
        <h3>{questionSets[page].title}</h3>
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
              <div className="option-label">〈 전혀 그렇지 않다</div>
              <div className="options-group">
                {[1,2,3,4,5,6,7].map(value => (
                  <div 
                    key={value}
                    className={`circle ${answers[idx] === value ? 'selected' : ''}`}
                    onClick={() => handleSelect(idx, value)}
                  ></div>
                ))}
              </div>
              <div className="option-label">매우 그렇다 〉</div>
            </div>
          </div>
        ))}

        <div className="button-group">
          <button className="save-button">임시 저장</button>
          {page < questionSets.length - 1 && (
            <button className="next-button" onClick={checkUnansweredAndScroll}>
              다음 페이지 &gt;
            </button>
          )}
          {page === questionSets.length -1 && (
            <button className="next-button">제출하기</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
