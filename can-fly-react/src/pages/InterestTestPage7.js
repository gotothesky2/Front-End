import React, { useState, useRef } from 'react';
import '../styles/InterestTestPage7.css';

const InterestTestPage7 = () => {
  const [answers, setAnswers] = useState({
    1: Array(8).fill(null),
    2: [null, null, null],
    3: ["", ""],
    4: [["", ""], ["", ""]],
    5: Array(8).fill(null),
    6: Array(9).fill(null)
  });

  const [selectedJobIdx, setSelectedJobIdx] = useState([null, null]);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState([[], []]);
  
  const [showJobModal, setShowJobModal] = useState({open: false, index: null});
  const [showSubjectModal, setShowSubjectModal] = useState({open: false, group: null, idx: null});

  const questionRefs = useRef({});

  const handleSelect = (section, idx, value) => {
    const newAnswers = { ...answers };
    newAnswers[section][idx] = value;
    setAnswers(newAnswers);
  };

  const handleBoxSelect = (section, idx, value) => {
    const newAnswers = { ...answers };
    newAnswers[section][idx] = value;
    setAnswers(newAnswers);
  };

  const checkAndSubmit = () => {
    for (let section in answers) {
      const arr = answers[section];
      const idx = Array.isArray(arr[0]) ? arr.flat().findIndex(v => v === "" || v === null)
        : arr.findIndex(v => v === "" || v === null);
      if (idx !== -1) {
        alert(`${section}번 문항을 답해주세요.`);
        return;
      }
    }
    alert("제출되었습니다.");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  return (
    <div className="interest7-container">
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

        {/* 1번 */}
        <div className="section">
          <div className="section-title">1. 아래 질문에 응답해주세요</div>
          {Array.from({length:8}, (_,i)=>( 
            <div key={i}>
              <div className="question-text">{`1-${i+1}. 질문 내용`}</div>
              <div className="circle-options-7">
                {[1,2,3,4,5].map((val,j)=>( 
                  <div key={val} className="circle-container-7">
                    <div 
                      className={`circle-7 ${answers[1][i]===val ? 'selected':''}`}
                      onClick={()=>handleSelect(1,i,val)}
                    ></div>
                    {j===0&&<div className="circle-label-7">〈 매우 싫어한다</div>}
                    {j===2&&<div className="circle-label-7">보통</div>}
                    {j===4&&<div className="circle-label-7">매우 좋아한다 〉</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 2번 */}
        <div className="section">
          <div className="section-title">2. 아래 질문에 응답해주세요</div>
          <div>
            <div className="question-text">2-1. 결정 여부</div>
            <div className="box-options-7">
              {["결정함","결정못함"].map(opt=>( 
                <div key={opt} className={`box-7 ${answers[2][0]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,0,opt)}
                >{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-2. 추가 질문</div>
            <div className="box-options-7">
              {["결정함","결정못함"].map(opt=>( 
                <div key={opt} className={`box-7 ${answers[2][1]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,1,opt)}
                >{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-3. 계열 선택</div>
            <div className="box-options-7 small">
              {["인문","사회","교육","공학","자연","의학","예체능"].map(opt=>( 
                <div key={opt} className={`box-7 ${answers[2][2]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,2,opt)}
                >{opt}</div>
              ))}
            </div>
          </div>
        </div>

        {/* 3번 */}
        <div className="section">
          <div className="section-title">3. 아래 질문에 응답해주세요</div>
          {["나의 희망 직업","부모님이 원하는 직업"].map((label,idx)=>( 
            <div key={idx}>
              <div className="question-text">{`3-${idx+1}. ${label}`}</div>
              <div className="job-select-7">
                <div className="job-box-7" onClick={()=>setShowJobModal({open:true,index:idx})}>
                  {answers[3][idx] || `직업을 선택해주세요.`}
                </div>
                <button onClick={()=>setShowJobModal({open:true,index:idx})}>직업 선택</button>
              </div>
            </div>
          ))}
        </div>

        {/* 4번 */}
        <div className="section">
          <div className="section-title">4. 아래 질문에 응답해주세요</div>
          {["가장 좋아하는 과목","가장 싫어하는 과목"].map((label,gidx)=>( 
            <div key={gidx}>
              <div className="question-text">{`4-${gidx+1}. ${label}`}</div>
              <div className="subject-select-7">
                {["1순위","2순위"].map((_,idx)=>( 
                  <div key={idx} className="subject-box-7" onClick={()=>setShowSubjectModal({open:true,group:gidx,idx})}>
                    {answers[4][gidx][idx] || `${idx+1}순위 과목`}
                  </div>
                ))}
                <button onClick={()=>setShowSubjectModal({open:true,group:gidx,idx:0})}>과목 선택</button>
              </div>
            </div>
          ))}
        </div>

        {/* 5번 */}
        <div className="section">
          <div className="section-title">5. 아래 질문에 응답해주세요</div>
          {Array.from({length:8}, (_,i)=>( 
            <div key={i}>
              <div className="question-text">{`5-${i+1}. 질문 내용`}</div>
              <div className="circle-options-7">
                {[1,2,3,4,5].map((val,j)=>( 
                  <div key={val} className="circle-container-7">
                    <div 
                      className={`circle-7 ${answers[5][i]===val ? 'selected':''}`}
                      onClick={()=>handleSelect(5,i,val)}
                    ></div>
                    {j===0&&<div className="circle-label-7">〈 매우 불만족</div>}
                    {j===2&&<div className="circle-label-7">보통</div>}
                    {j===4&&<div className="circle-label-7">매우 만족 〉</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 6번 */}
        <div className="section">
          <div className="section-title">6. 아래 질문에 응답해주세요</div>
          {Array.from({length:9}, (_,i)=>( 
            <div key={i}>
              <div className="question-text">{`6-${i+1}. 질문 내용`}</div>
              <div className="circle-options-7">
                {[1,2,3,4,5,6].map((val,j)=>( 
                  <div key={val} className="circle-container-7">
                    <div 
                      className={`circle-7 ${answers[6][i]===val ? 'selected':''}`}
                      onClick={()=>handleSelect(6,i,val)}
                    ></div>
                    {j===0&&<div className="circle-label-7">〈 하위권</div>}
                    {j===2&&<div className="circle-label-7">중위권</div>}
                    {j===4&&<div className="circle-label-7">상위권 〉</div>}
                    {j===5&&<div className="circle-label-7">배우지 않음</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button className="save-button">임시 저장</button>
          <button className="next-button" onClick={checkAndSubmit}>제출하기</button>
        </div>
      </div>

      {/* 모달 */}
      {showJobModal.open && (
        <div className="modal">
          <div className="modal-content">
            <h4>직업 선택</h4>
            <div className="modal-list">
              {Array.from({length:62}).map((_,i)=>( 
                <button key={i} onClick={()=>{
                  const newAnswers = {...answers};
                  newAnswers[3][showJobModal.index] = `직업 ${i+1}`;
                  setAnswers(newAnswers);
                  setShowJobModal({open:false,index:null});
                }}>
                  직업 {i+1}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowJobModal({open:false,index:null})}>닫기</button>
          </div>
        </div>
      )}

      {showSubjectModal.open && (
        <div className="modal">
          <div className="modal-content">
            <h4>과목 선택</h4>
            <div className="modal-list">
              {["국어","수학","영어","과학","사회","예체능"].map((subj,i)=>( 
                <button key={i} onClick={()=>{
                  const newAnswers = {...answers};
                  newAnswers[4][showSubjectModal.group][showSubjectModal.idx] = subj;
                  setAnswers(newAnswers);
                  setShowSubjectModal({open:false,group:null,idx:null});
                }}>
                  {subj}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowSubjectModal({open:false,group:null,idx:null})}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestTestPage7;
