import React, { useState } from 'react';
import '../styles/AptitudeTest.css';

const AptitudeTest = () => {
  const questions = [
    "몸을 구부리는 동작을 잘 할 수 있다.",
    "힘이 드는 동작을 잘 할 수 있다.",
    "운동기구(각종 도구)를 능숙하게 사용할 수 있다.",
    "새로운 동작을 쉽게 배울 수 있다.",
    "몸의 균형을 잘 잡을 수 있다.",
    "여러 신체 부위를 동시에 움직이는 동작을 할 수 있다.",
    "운동경기 상황을 판단하고 대응할 수 있다.",
    "운동할 때 효과적인 방법으로 할 수 있다."
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  const handleSelect = (qIdx, value) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="aptitude-container">
      <div className="banner-text-only">
        <h2>직업 적성 검사</h2>
        <p>
          나의 잠재된 능력을 발견하고, 진로의 방향을 명확히 설정해보세요.<br/>
          직업 적성 검사는 내가 무엇을 잘할 수 있는지를 과학적으로 분석해, 
          전공 선택과 진로 탐색에 객관적인 기준을 제공합니다.
          입시 과정에서 자신에게 맞는 계열과 학과를 선택하는 데 결정적인 역할을 하며, 
          장기적으로는 전공 몰입도와 진로 만족도를 높이는 데 큰 도움이 됩니다.
        </p>
      </div>

      <div className="questions-wrapper">
        <h3>신체·운동능력</h3>
        <p className="small-guide">기초체력을 바탕으로 효율적으로 몸을 움직이고 동작을 학습할 수 있는 능력 나의 신체·운동능력은 어느 정도일까요? 해당되는 번호를 선택하세요.</p>
        <hr></hr>
        {questions.map((q, idx) => (
          <div key={idx} className="question-block">
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
          <button className="next-button">다음 페이지 &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
