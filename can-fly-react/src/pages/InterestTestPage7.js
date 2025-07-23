import React, { useState, useRef } from 'react';
import '../styles/InterestTestPage7.css';
import { useNavigate } from 'react-router-dom';


const InterestTestPage7 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    1: Array(8).fill(null),
    2: [null, null, null],
    3: ["", ""],
    4: [["", ""], ["", ""]],
    5: Array(1).fill(null),
    6: Array(9).fill(null)
  });

  const questionRefs = useRef({});
  const [showJobModal, setShowJobModal] = useState({open: false, index: null});
  const [showSubjectModal, setShowSubjectModal] = useState({open: false, section: null});
  const [tempSubjects, setTempSubjects] = useState(["", ""]);  // 팝업 내 임시 저장
  

  // ==================
  // 과목 선택 처리
  const handleSubjectClick = (idx, value) => {
    const newTemp = [...tempSubjects];
    newTemp[idx] = value;
    setTempSubjects(newTemp);

    // 둘 다 선택 시 자동 닫기 & 반영
    if (newTemp[0] && newTemp[1]) {
      const updated = {...answers};
      updated[4][showSubjectModal.section] = [...newTemp];
      setAnswers(updated);
      setShowSubjectModal({open:false, section:null});
      setTempSubjects(["", ""]);
    }
  };

  // ==================
  const handleSelect = (section, idx, value) => {
    const updated = {...answers};
    updated[section][idx] = value;
    setAnswers(updated);
  };

  const handleBoxSelect = (section, idx, value) => {
    const updated = {...answers};
    updated[section][idx] = value;
    setAnswers(updated);
  };

  const checkAndSubmit = () => {
    for (let section in answers) {
        const arr = answers[section];

        // 2차원 배열 (4번)
        if (Array.isArray(arr[0])) {
        for (let sub = 0; sub < arr.length; sub++) {
            const idx = arr[sub].findIndex(v => v === "" || v === null);
            if (idx !== -1) {
            alert(`${section}-${sub+1}-${idx+1}번 문항을 답해주세요.`);
            questionRefs.current[`${section}-${sub+1}-${idx+1}`]?.scrollIntoView({ behavior:'smooth', block:'center' });
            return;
            }
        }
        } else {
        // 1차원 배열
        const idx = arr.findIndex(v => v === "" || v === null);
        if (idx !== -1) {
            alert(`${section}-${idx+1}번 문항을 답해주세요.`);
            questionRefs.current[`${section}-${idx+1}`]?.scrollIntoView({ behavior:'smooth', block:'center' });
            return;
        }
        }
    }

    alert("제출되었습니다.");
    navigate('/test'); 
    window.scrollTo({ top: 0, behavior: "smooth" });
    };


  return (
    <div className="interest7-container">
      <div className="banner-with-image">
        <div className="banner-text">
          <h2>직업 흥미 검사</h2>
          <p>
            내가 진짜 ‘좋아하는 일’은 무엇일까? 흥미는 진로의 원동력입니다.<br/>
            직업 흥미 검사는 개인의 성격과 관심사를 바탕으로, 즐겁게 몰입할 수 있는 직업군과 전공 분야를 탐색하는 과정입니다.
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
                      ref={el => questionRefs.current[`1-${i+1}`] = el}  // ✅ 수정됨
                      className={`circle-7 ${answers[1][i] === val ? 'selected' : ''}`}
                      onClick={() => handleSelect(1, i, val)}
                    ></div>
                    {j === 0 && <div className="circle-label-7">〈 매우 싫어한다</div>}
                    {j === 2 && <div className="circle-label-7">보통</div>}
                    {j === 4 && <div className="circle-label-7">매우 좋아한다 〉</div>}
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
                <div key={opt} className={`box-7 ${answers[2][0]===opt?'selected':''}`} onClick={()=>handleBoxSelect(2,0,opt)}>{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-2. 추가 질문</div>
            <div className="box-options-7">
              {["결정함","결정못함"].map(opt=>(
                <div key={opt} className={`box-7 ${answers[2][1]===opt?'selected':''}`} onClick={()=>handleBoxSelect(2,1,opt)}>{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-3. 계열 선택</div>
            <div className="box-options-7 small">
              {["인문","사회","교육","공학","자연","의학","예체능"].map(opt=>(
                <div key={opt} className={`box-7 ${answers[2][2]===opt?'selected':''}`} onClick={()=>handleBoxSelect(2,2,opt)}>{opt}</div>
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
          {["가장 좋아하는 과목","가장 싫어하는 과목"].map((label,sectionIdx)=>(
            <div key={sectionIdx}>
              <div className="question-text">{`4-${sectionIdx+1}. ${label}`}</div>
              <div className="subject-select-7">
                {[0,1].map(idx=>(
                  <div key={idx} className="subject-box-7" onClick={()=>setShowSubjectModal({open:true, section:sectionIdx})}>
                    {answers[4][sectionIdx][idx] || `${idx+1}순위 과목`}
                  </div>
                ))}
                <button onClick={()=>setShowSubjectModal({open:true, section:sectionIdx})}>과목 선택</button>
              </div>
            </div>
          ))}
        </div>

        {/* 5,6번 유지 */}
        <div className="section">
            <div className="section-title">5. 아래 질문에 응답해주세요</div>
            <div>
                <div className="question-text">5-1. 질문 내용</div>
                <div className="circle-options-7">
                {[1,2,3,4,5].map((val,j)=>(
                    <div key={val} className="circle-container-7">
                    <div 
                        className={`circle-7 ${answers[5][0]===val ? 'selected':''}`}
                        onClick={()=>handleSelect(5,0,val)}
                    ></div>
                    {j===0 && <div className="circle-label-7">〈 매우 불만족</div>}
                    {j===2 && <div className="circle-label-7">보통</div>}
                    {j===4 && <div className="circle-label-7">매우 만족 〉</div>}
                    </div>
                ))}
                </div>
            </div>
            </div>


        <div className="section">
          <div className="section-title">6. 아래 질문에 응답해주세요</div>
          {Array.from({length:9}, (_,i)=>(
            <div key={i}>
              <div className="question-text">{`6-${i+1}. 질문 내용`}</div>
              <div className="circle-options-7">
                {[1,2,3,4,5,6].map((val,j)=>(
                  <div key={val} className="circle-container-7">
                    <div className={`circle-7 ${answers[6][i]===val ? 'selected':''}`} onClick={()=>handleSelect(6,i,val)}></div>
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
                  const updated = {...answers};
                  updated[3][showJobModal.index] = `직업 ${i+1}`;
                  setAnswers(updated);
                  setShowJobModal({open:false,index:null});
                }}>
                  직업 {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSubjectModal.open && (
        <div className="modal">
            <div className="modal-content">
            <h4>1순위 선택</h4>
            <div className="modal-list">
                {["국어","수학","영어","과학","사회","예체능","기술","정보","지리","역사","도덕","경제","정치","화학","물리","생명","지구"]
                .map(subj =>
                <button 
                    key={subj} 
                    className={tempSubjects[0] === subj ? "selected" : ""}
                    onClick={()=>handleSubjectClick(0, subj)}
                >
                    {subj}
                </button>
                )}
            </div>

            <h4>2순위 선택</h4>
            <div className="modal-list">
                {["국어","수학","영어","과학","사회","예체능","기술","정보","지리","역사","도덕","경제","정치","화학","물리","생명","지구"]
                .map(subj =>
                <button 
                    key={subj} 
                    className={tempSubjects[1] === subj ? "selected" : ""}
                    onClick={()=>handleSubjectClick(1, subj)}
                >
                    {subj}
                </button>
                )}
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default InterestTestPage7;
