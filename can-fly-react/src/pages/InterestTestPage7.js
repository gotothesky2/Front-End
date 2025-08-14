// src/pages/InterestTestPage7.jsx
import React, { useState, useRef } from 'react';
import '../styles/InterestTestPage7.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 배포 시 .env에서 REACT_APP_API_BASE로 관리 권장
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

// ───────────────────────────────
// 커리어넷 문항 번호 매핑 (121 ~ 145)
// ───────────────────────────────
const QN = {
  SECTION1_START: 121, // 121~128 (1~5 Likert)
  DECISION_1: 129,     // 장래 희망 직업: 결정함/결정못함
  DECISION_2: 130,     // 장래 희망 전공분야: 결정함/결정못함
  MAJOR_FIELD: 131,    // 전공 계열 (인문/사회/교육/공학/자연/의약/예체능)
  MY_JOB: 132,         // 나의 희망 직업 (1~62)
  PARENT_JOB: 133,     // 부모님이 원하는 직업 (1~62)
  LIKE_SUBJ: 134,      // 가장 좋아하는 과목 (limit=2 → 같은 no로 2개 전송)
  DISLIKE_SUBJ: 135,   // 가장 싫어하는 과목 (limit=2 → 같은 no로 2개 전송)
  SATISFACTION: 136,   // 학교생활 만족도 (1~5)
  ACHIEVE_START: 137,  // 과목 성취수준 9개 (137~145, 1~6)
};

const MAJOR_FIELDS = ['인문','사회','교육','공학','자연','의약','예체능'];
const SUBJECT_CHOICES = [
  '국어','사회','도덕','수학','과학','기술·가정','정보','체육','음악','미술',
  '연극','영어','제2외국어','한문','교양','창의적 체험활동','기타'
].map((t, i) => ({ val: String(i + 1), text: t }));

const ACHIEVE_LABELS = ['국어','수학','영어','사회','과학','체육','미술','음악','기술가정'];
const ACHIEVE_CHOICES = [
  { val: '1', text: '하위권' },
  { val: '2', text: '중하위권' },
  { val: '3', text: '중위권' },
  { val: '4', text: '중상위권' },
  { val: '5', text: '상위권' },
  { val: '6', text: '배우지 않음' },
];

const JOB_COUNT = 62;

// ‘결정함/결정못함’ → 커리어넷 값
const encodeDecision = (txt) => (txt === '결정함' ? '1' : txt === '결정못함' ? '2' : '');

const InterestTestPage7 = () => {
  const navigate = useNavigate();

  // 원래 네 구조 그대로
  const [answers, setAnswers] = useState({
    1: Array(8).fill(null),        // 121~128 (1~5)
    2: [null, null, null],         // [129 결정, 130 결정, 131 전공계열(문자열)]
    3: ["", ""],                   // [132, 133] 직업 ("1"~"62")
    4: [["", ""], ["", ""]],       // [134 좋아], [135 싫어]  각각 2개 ("1"~"17")
    5: Array(1).fill(null),        // 136 (1~5)
    6: Array(9).fill(null),        // 137~145 (1~6)
  });

  const questionRefs = useRef({});
  const [showJobModal, setShowJobModal] = useState({ open: false, index: null });
  const [showSubjectModal, setShowSubjectModal] = useState({ open: false, section: null });
  const [tempSubjects, setTempSubjects] = useState(["", ""]); // 과목 1·2순위 임시 저장(코드)

  // 선택 핸들러(디자인 그대로)
  const handleSelect = (section, idx, value) => {
    const updated = { ...answers };
    updated[section][idx] = value;
    setAnswers(updated);
  };
  const handleBoxSelect = (section, idx, value) => {
    const updated = { ...answers };
    updated[section][idx] = value;
    setAnswers(updated);
  };

  // 과목 모달: 버튼 클릭
  const handleSubjectClick = (rankIdx, code) => {
    const newTemp = [...tempSubjects];
    newTemp[rankIdx] = code; // "1"~"17"
    setTempSubjects(newTemp);

    if (newTemp[0] && newTemp[1]) {
      const updated = { ...answers };
      updated[4][showSubjectModal.section] = [...newTemp];
      setAnswers(updated);
      setShowSubjectModal({ open: false, section: null });
      setTempSubjects(["", ""]);
    }
  };

  const subjectLabel = (code) =>
    SUBJECT_CHOICES.find((s) => s.val === code)?.text || '';

  // 검증
  const validateAll = () => {
    for (let section in answers) {
      const arr = answers[section];
      if (Array.isArray(arr[0])) {
        for (let sub = 0; sub < arr.length; sub++) {
          const idx = arr[sub].findIndex((v) => v === "" || v === null);
          if (idx !== -1) {
            return { ok: false, msg: `${section}-${sub+1}-${idx+1}번 문항을 답해주세요.`, key: `${section}-${sub+1}-${idx+1}` };
          }
        }
      } else {
        const idx = arr.findIndex((v) => v === "" || v === null);
        if (idx !== -1) {
          return { ok: false, msg: `${section}-${idx+1}번 문항을 답해주세요.`, key: `${section}-${idx+1}` };
        }
      }
    }
    return { ok: true };
  };

  // 제출 payload (1~6페이지 + 7페이지)
  const buildV2Payload = () => {
    const prev = JSON.parse(localStorage.getItem('interestAnswersV2') || '{}'); // 1~120

    const arr = [];

    // 1) 121~128
    for (let i = 0; i < 8; i++) {
      arr.push({ no: QN.SECTION1_START + i, val: String(answers[1][i]) });
    }

    // 2) 129/130 결정, 131 전공계열
    arr.push({ no: QN.DECISION_1, val: encodeDecision(answers[2][0]) });
    arr.push({ no: QN.DECISION_2, val: encodeDecision(answers[2][1]) });
    arr.push({ no: QN.MAJOR_FIELD, val: String(answers[2][2]) }); // "인문" 등

    // 3) 132/133 직업 ("1"~"62")
    arr.push({ no: QN.MY_JOB, val: String(answers[3][0]) });
    arr.push({ no: QN.PARENT_JOB, val: String(answers[3][1]) });

    // 4) 134/135 과목 1·2순위 (같은 no 두 개)
    arr.push({ no: QN.LIKE_SUBJ, val: String(answers[4][0][0]) });
    arr.push({ no: QN.LIKE_SUBJ, val: String(answers[4][0][1]) });
    arr.push({ no: QN.DISLIKE_SUBJ, val: String(answers[4][1][0]) });
    arr.push({ no: QN.DISLIKE_SUBJ, val: String(answers[4][1][1]) });

    // 5) 136
    arr.push({ no: QN.SATISFACTION, val: String(answers[5][0]) });

    // 6) 137~145
    for (let i = 0; i < 9; i++) {
      arr.push({ no: QN.ACHIEVE_START + i, val: String(answers[6][i]) });
    }

    // 7) 1~6페이지 응답 합치기 (중복 no는 배열 허용)
    const merged = new Map();
    Object.entries(prev).forEach(([no, val]) => merged.set(Number(no), String(val)));
    arr.forEach(({ no, val }) => {
      const key = Number(no);
      const exist = merged.get(key);
      if (exist === undefined) merged.set(key, val);
      else if (Array.isArray(exist)) { exist.push(val); merged.set(key, exist); }
      else merged.set(key, [exist, val]);
    });

    const finalAnswers = [];
    for (const [no, val] of merged.entries()) {
      if (Array.isArray(val)) val.forEach((v) => finalAnswers.push({ no, val: String(v) }));
      else finalAnswers.push({ no, val: String(val) });
    }
    finalAnswers.sort((a, b) => a.no - b.no);

    return {
      qno: 34,            // 흥미검사 H형
      trgetSe: '100207',  // 예: 고등학생
      gender: '100323',   // 예: 남자 (필요시 UI로 입력받아 바꾸세요)
      grade: '2',
      school: '학교명',
      startDtm: Date.now(),
      answers: finalAnswers,
    };
  };

  const checkAndSubmit = async () => {
    const v = validateAll();
    if (!v.ok) {
      alert(v.msg);
      questionRefs.current[v.key]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = buildV2Payload();
      const res = await axios.post(`${API_BASE}/api/interest/submit`, payload);
      console.log('[interest submit result]', res.data);
      alert('제출되었습니다.');
      navigate('/test');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('제출 중 오류가 발생했습니다.');
    }
  };

  // ─────────────────────────────────
  // 렌더 (디자인 그대로, 모달만 개편)
  // ─────────────────────────────────
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
                      ref={el => questionRefs.current[`1-${i+1}`] = el}
                      className={`circle-7 ${String(answers[1][i])===String(val) ? 'selected' : ''}`}
                      onClick={()=>handleSelect(1, i, String(val))}
                    />
                    {j===0 && <div className="circle-label-7">〈 매우 싫어한다</div>}
                    {j===2 && <div className="circle-label-7">보통</div>}
                    {j===4 && <div className="circle-label-7">매우 좋아한다 〉</div>}
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
                <div
                  key={opt}
                  className={`box-7 ${answers[2][0]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,0,opt)}
                >{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-2. 추가 질문</div>
            <div className="box-options-7">
              {["결정함","결정못함"].map(opt=>(
                <div
                  key={opt}
                  className={`box-7 ${answers[2][1]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,1,opt)}
                >{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="question-text">2-3. 계열 선택</div>
            <div className="box-options-7 small">
              {MAJOR_FIELDS.map(opt=>(
                <div
                  key={opt}
                  className={`box-7 ${answers[2][2]===opt?'selected':''}`}
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
                  {answers[3][idx] ? `직업 ${answers[3][idx]}` : `직업을 선택해주세요.`}
                </div>
                <button className="page7button" onClick={()=>setShowJobModal({open:true,index:idx})}>직업 선택</button>
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
                  <div
                    key={idx}
                    className="subject-box-7"
                    onClick={()=>setShowSubjectModal({open:true, section:sectionIdx})}
                  >
                    {answers[4][sectionIdx][idx]
                      ? `${idx+1}순위: ${subjectLabel(answers[4][sectionIdx][idx])}`
                      : `${idx+1}순위 과목`}
                  </div>
                ))}
                <button className="page7button" onClick={()=>setShowSubjectModal({open:true, section:sectionIdx})}>과목 선택</button>
              </div>
            </div>
          ))}
        </div>

        {/* 5번 */}
        <div className="section">
          <div className="section-title">5. 아래 질문에 응답해주세요</div>
          <div>
            <div className="question-text">5-1. 질문 내용</div>
            <div className="circle-options-7">
              {[1,2,3,4,5].map((val,j)=>(
                <div key={val} className="circle-container-7">
                  <div
                    className={`circle-7 ${String(answers[5][0])===String(val)?'selected':''}`}
                    onClick={()=>handleSelect(5,0,String(val))}
                  />
                  {j===0 && <div className="circle-label-7">〈 매우 불만족</div>}
                  {j===2 && <div className="circle-label-7">보통</div>}
                  {j===4 && <div className="circle-label-7">매우 만족 〉</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6번 */}
        <div className="section">
          <div className="section-title">6. 아래 질문에 응답해주세요</div>
          {Array.from({length:9}, (_,i)=>(
            <div key={i}>
              <div className="question-text">{`6-${i+1}. ${ACHIEVE_LABELS[i]}`}</div>
              <div className="circle-options-7">
                {ACHIEVE_CHOICES.map((opt,j)=>(
                  <div key={opt.val} className="circle-container-7">
                    <div
                      className={`circle-7 ${answers[6][i]===opt.val ? 'selected':''}`}
                      onClick={()=>handleSelect(6,i,opt.val)}
                    />
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
          <button className="save-button" onClick={()=>alert('임시 저장되었습니다.')}>임시 저장</button>
          <button className="next-button" onClick={checkAndSubmit}>제출하기</button>
        </div>
      </div>

      {/* ── 모달: 직업 선택 (디자인 개선) ── */}
      {showJobModal.open && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content modal-square">
            <button
              className="modal-x"
              aria-label="닫기"
              onClick={()=>setShowJobModal({open:false, index:null})}
            >
              ×
            </button>
            <h4>직업 선택</h4>
            <div className="modal-list modal-grid-tight">
              {Array.from({length: JOB_COUNT}).map((_,i)=>(
                <button
                  className="modal-btn"
                  key={i}
                  onClick={()=>{
                    const updated = { ...answers };
                    updated[3][showJobModal.index] = String(i+1);  // "1"~"62"
                    setAnswers(updated);
                    setShowJobModal({open:false,index:null});
                  }}
                >
                  {`직업 ${i+1}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 모달: 과목 선택 (디자인 개선) ── */}
      {showSubjectModal.open && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content modal-square">
            <button
              className="modal-x"
              aria-label="닫기"
              onClick={()=>{ setShowSubjectModal({open:false, section:null}); setTempSubjects(["",""]); }}
            >
              ×
            </button>

            <h4>1순위 선택</h4>
            <div className="modal-list modal-grid-tight">
              {SUBJECT_CHOICES.map(subj => (
                <button
                  key={`s1-${subj.val}`}
                  className={`modal-btn ${tempSubjects[0] === subj.val ? 'selected' : ''}`}
                  onClick={()=>handleSubjectClick(0, subj.val)}
                >
                  {subj.text}
                </button>
              ))}
            </div>

            <h4>2순위 선택</h4>
            <div className="modal-list modal-grid-tight">
              {SUBJECT_CHOICES.map(subj => (
                <button
                  key={`s2-${subj.val}`}
                  className={`modal-btn ${tempSubjects[1] === subj.val ? 'selected' : ''}`}
                  onClick={()=>handleSubjectClick(1, subj.val)}
                >
                  {subj.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterestTestPage7;
