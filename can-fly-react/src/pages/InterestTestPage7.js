// src/pages/InterestTestPage7.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/InterestTestPage7.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = "";
// ───────────────────────────────
// 커리어넷 문항 번호 매핑 (121 ~ 145)
// ───────────────────────────────
const QN = {
  SECTION1_START: 121, // 121~128 (1~5 Likert)
  DECISION_1: 129,     // 장래 희망 직업: 결정함/결정못함
  DECISION_2: 130,     // 장래 희망 전공분야: 결정함/결정못함
  MAJOR_FIELD: 131,    // 전공 계열 (인문/사회/교육/공학/자연/의약/예체능) — 130이 '결정함'일 때만 전송
  MY_JOB: 132,         // 나의 희망 직업 (1~62)
  PARENT_JOB: 133,     // 부모님이 원하는 직업 (1~62)
  LIKE_SUBJ: 134,      // 가장 좋아하는 과목 (limit=2 → 콤마로 1값 전송)
  DISLIKE_SUBJ: 135,   // 가장 싫어하는 과목 (limit=2 → 콤마로 1값 전송)
  SATISFACTION: 136,   // 학교생활 만족도 (1~5)
  ACHIEVE_START: 137,  // 과목 성취수준 9개 (137~145, 1~6)
};

// 132/133 직업 라벨 (1~62)
const JOB_LABELS = [
  '', // 0 dummy
  '가수','간호사','경영컨설턴트','경찰관','공무원','관세사','괴롭힘방지조언사','교사','교육학연구원',
  '국제개발협력전문가','군인','금융자산운용가','기업고위임원/CEO','네이미스트','노년플래너','노무사','대체에너지개발연구원',
  '도선사','동물보호보안관','로봇연구원','로봇윤리학자','모델','무인항공시스템·드론개발자','방송연출가','법무사',
  '뷰티디자이너','비행기조종사','빅데이터전문가','사서','사진작가','사회단체활동가','사회복지사','상담전문가',
  '생명공학연구원','소방관','수의사','스포츠감독','스포츠심리상담사','승무원','신약개발연구원','연기자','연주가',
  '운동경기심판','운동선수','음반기획자','응급구조사','인테리어디자이너','제품디자이너','천문학연구원','촬영기사',
  '출판편집자','캐스팅디렉터','컴퓨터그래픽디자이너','크라우드펀딩전문가','판사','항공교통관제사','항공기선박조립검사원',
  '항공기정비원','환경컨설턴트','회계사','기타( )','아직 결정 못함'
];
const MAJOR_FIELDS = ['인문','사회','교육','공학','자연','의약','예체능'];

// ✅ 전공 계열 → 코드 맵 (v2는 코드 전송 필요)
const MAJOR_FIELD_CODES = Object.freeze({
  '인문': '1',
  '사회': '2',
  '교육': '3',
  '공학': '4',
  '자연': '5',
  '의약': '6',
  '예체능': '7',
});

const SUBJECT_CHOICES = [
  '국어','사회','도덕','수학','과학','기술·가정','정보','체육','음악','미술',
  '연극','영어','제2외국어','한문','교양','창의적 체험활동','기타'
].map((t, i) => ({ val: String(i + 1), text: t }));

const DEFAULT_ACHIEVE_LABELS = ['국어','수학','영어','사회','과학','체육','미술','음악','기술가정'];
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
    // 직업 choices (API에서 받아오되, 초기값은 상수로 채워둬서 즉시 표시)
  const [jobChoices, setJobChoices] = useState(
    Array.from({ length: JOB_COUNT }, (_, i) => ({
      val: String(i + 1),
      text: JOB_LABELS[i + 1] || `직업 ${i + 1}`,
    }))
  );

  // 원래 네 구조 그대로
  const [answers, setAnswers] = useState({
    1: Array(8).fill(null),        // 121~128 (1~5)
    2: [null, null, null],         // [129 결정, 130 결정, 131 전공계열(문자열, 130이 결정함일 때만 필수)]
    3: ["", ""],                   // [132, 133] 직업 ("1"~"62")
    4: [["", ""], ["", ""]],       // [134 좋아], [135 싫어]  각각 2개 ("1"~"17")
    5: Array(1).fill(null),        // 136 (1~5)
    6: Array(9).fill(null),        // 137~145 (1~6)
  });

  // 7페이지에 실제 질문 텍스트 채워주기 (121~128, 137~145)
  const [sec1Texts, setSec1Texts] = useState(Array(8).fill('질문 내용')); // 121~128
  const [achieveLabels, setAchieveLabels] = useState(DEFAULT_ACHIEVE_LABELS); // 137~145

  // 페이지 진입 시 상단으로 부드럽게 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchPage7Questions = async () => {
      try {
        // 121~128
        const r1 = await axios.get('/api/interest/questions?q=34&min=121&max=128');
        const arr1 = Array.isArray(r1.data?.result?.questions)
          ? r1.data.result.questions
          : Array.isArray(r1.data?.RESULT)
          ? r1.data.RESULT
          : [];
        const map1 = [...arr1]
          .map(q => ({ no: Number(q.no ?? q.qno ?? q.id ?? 0), text: String(q.text ?? q.title ?? '').trim() }))
          // ✅ 혹시 서버가 필터 안해줘도 안전
          .filter(q => q.no >= 121 && q.no <= 128)
          .sort((a,b)=>a.no-b.no)
          .map(q => q.text || '질문 내용');
        if (map1.length === 8) setSec1Texts(map1);
      } catch (e) {
        console.warn('[page7] fetch 121~128 failed', e?.response?.status || e.message);
      }

            // 132 또는 133의 choices 받아오기 (둘 다 동일 리스트라 임의 하나만)
      try {
        // 133(부모님이 원하는 직업)에서 가져오기
        const rJob = await axios.get('/api/interest/questions?q=34&min=133&max=133');
        const qArr = Array.isArray(rJob.data?.result?.questions)
          ? rJob.data.result.questions
          : Array.isArray(rJob.data?.RESULT)
          ? rJob.data.RESULT
          : [];
        const q = qArr.find(x => Number(x?.no ?? x?.qno ?? x?.id ?? 0) === 133) ?? qArr[0];
        const apiChoices = Array.isArray(q?.choices)
          ? q.choices
              .filter((c) => c && (c.val != null) && (c.text != null))
              .map((c) => ({ val: String(c.val), text: String(c.text) }))
          : [];
        if (apiChoices.length === JOB_COUNT) {
          setJobChoices(apiChoices);
        }
      } catch (e) {
        console.warn('[page7] fetch job choices failed', e?.response?.status || e.message);
        // 실패해도 초기 JOB_LABELS로 표시되니 무시
      }
      try {
        // 137~145
        const r2 = await axios.get('/api/interest/questions?q=34&min=137&max=145');
        const arr2 = Array.isArray(r2.data?.result?.questions) ? r2.data.result.questions
                   : Array.isArray(r2.data?.RESULT) ? r2.data.RESULT : [];
        const map2 = [...arr2]
          .map(q => ({ no: Number(q.no ?? q.qno ?? q.id ?? 0), text: String(q.text ?? q.title ?? '').trim() }))
          // ✅ 서버 필터 무시 대비
          .filter(q => q.no >= 137 && q.no <= 145)
          .sort((a,b)=>a.no-b.no)
          .map(q => q.text || '과목');
        if (map2.length === 9) setAchieveLabels(map2);
      } catch (e) {
        console.warn('[page7] fetch 137~145 failed', e?.response?.status || e.message);
      }
    };
    fetchPage7Questions();
  }, []);

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

  // 코드 → 직업 라벨 (API choices 우선, 없으면 상수)
  const jobCodeToText = (code) => {
    const c = String(code || '');
    const fromApi = jobChoices.find((j) => j.val === c)?.text;
    if (fromApi) return fromApi;
    const n = Number(c);
    return JOB_LABELS[n] || '아직 결정 못함';
  };
  const subjectLabel = (code) =>
    SUBJECT_CHOICES.find((s) => s.val === String(code))?.text || '';
  const subjCodeToText = (code) => subjectLabel(String(code)) || '';

  // 과목 모달: 버튼 클릭 (중복 방지 포함)
  const handleSubjectClick = (rankIdx, code) => {
    // 1) 현재 섹션 내 1·2순위 중복 금지
    if (tempSubjects[1 - rankIdx] === code) {
      alert('같은 섹션의 1·2순위는 서로 달라야 합니다.');
      return;
    }

    // 2) 다른 섹션과의 중복 금지 (총 4칸 유니크)
    const otherSec = showSubjectModal.section === 0 ? 1 : 0;
    const otherUsed = new Set(answers[4][otherSec].filter(Boolean));
    if (otherUsed.has(code)) {
      alert('이미 다른 문항에서 선택한 과목입니다. (4-1/4-2 전체에서 중복 불가)');
      return;
    }

    // 선택 진행
    const newTemp = [...tempSubjects];
    newTemp[rankIdx] = code; // "1"~"17"
    setTempSubjects(newTemp);

    // 두 개 다 선택되면 확정 저장
    if (newTemp[0] && newTemp[1]) {
      const updated = { ...answers };
      updated[4][showSubjectModal.section] = [...newTemp];
      setAnswers(updated);
      setShowSubjectModal({ open: false, section: null });
      setTempSubjects(["", ""]);
    }
  };

  // 검증 (1) 7페이지 내 응답
  const validatePage7 = () => {
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
        // 2-3(전공계열)은 130이 '결정못함'일 때 빈 값 허용 → 스킵
        if (Number(section) === 2 && encodeDecision(arr[1]) === '2') {
          // ok
        } else {
          const idx = arr.findIndex((v) => v === "" || v === null);
          if (idx !== -1) {
            return { ok: false, msg: `${section}-${idx+1}번 문항을 답해주세요.`, key: `${section}-${idx+1}` };
          }
        }
      }
    }
    // 최종적으로 4칸 유니크 보증 (방어)
    const allPicked = [
      ...answers[4][0],
      ...answers[4][1],
    ].filter(Boolean);
    const uniq = new Set(allPicked);
    if (uniq.size !== allPicked.length) {
      return { ok: false, msg: '4-1과 4-2의 1·2순위 과목은 서로 중복될 수 없습니다.', key: '4-1-1' };
    }

    return { ok: true };
  };

  // 제출 payload (1~6페이지 + 7페이지) — 기존 동작 그대로
  const buildV2Payload = () => {
    const prev = JSON.parse(localStorage.getItem('interestAnswersV2') || '{}'); // 1~120

    // 검증 (2) 1~120 모두 존재하는지 확인
    const missing = [];
    for (let i = 1; i <= 120; i++) {
      const v = prev[i] ?? prev[String(i)];
      if (v == null || String(v) === '') missing.push(i);
    }
    if (missing.length) {
      const err = new Error('MISSING_1_120');
      err.missing = missing;
      throw err;
    }

    const arr = [];

    // 1) 121~128 (Likert 1~5)
    for (let i = 0; i < 8; i++) {
      arr.push({ no: String(QN.SECTION1_START + i), val: String(answers[1][i]) });
    }

    // 2) 129/130 결정, 131 전공계열(130이 '결정함'일 때만 전송)
    const dec1 = encodeDecision(answers[2][0]);
    const dec2 = encodeDecision(answers[2][1]);
    arr.push({ no: String(QN.DECISION_1), val: dec1 });
    arr.push({ no: String(QN.DECISION_2), val: dec2 });

    if (dec2 === '1') {
      // 전공 계열은 "숫자코드 1~7"만 허용
      const label = String(answers[2][2] || '');
      const code = MAJOR_FIELD_CODES[label];
      if (!code) {
        // 선택 누락되면 바로 사용자에게 알려 오류 방지
        const e = new Error('MAJOR_FIELD_MISSING');
        e.userMessage = '2-3. 전공 계열을 선택해 주세요.';
        throw e;
      }
      arr.push({ no: String(QN.MAJOR_FIELD), val: code });
    }
    // 주의: dec2 === '2' (결정못함)이면 131은 절대 넣지 마세요 (여기서 아무 것도 안 함)


    // 3) 132/133 직업 — 미선택은 "-" 권장, 선택 시 라벨 텍스트 사용
    const myJob     = answers[3][0] ? jobCodeToText(answers[3][0]) : "-";
    const parentJob = answers[3][1] ? jobCodeToText(answers[3][1]) : "-";
    arr.push({ no: String(QN.MY_JOB),     val: myJob });
    arr.push({ no: String(QN.PARENT_JOB), val: parentJob });

    // 4) 134/135 과목 1·2순위 — "과목1,과목2" (이미 유효성 검사로 둘 다 선택 보장)
    const like1 = subjCodeToText(answers[4][0][0]);
    const like2 = subjCodeToText(answers[4][0][1]);
    const dislike1 = subjCodeToText(answers[4][1][0]);
    const dislike2 = subjCodeToText(answers[4][1][1]);
    arr.push({ no: String(QN.LIKE_SUBJ),    val: `${like1},${like2}` });
    arr.push({ no: String(QN.DISLIKE_SUBJ), val: `${dislike1},${dislike2}` });

    // 5) 136: 만족도(1~5)
    arr.push({ no: String(QN.SATISFACTION), val: String(answers[5][0]) });


    // 6) 137~145
    for (let i = 0; i < 9; i++) {
      arr.push({ no: String(QN.ACHIEVE_START + i), val: String(answers[6][i]) });
    }

    // 7) 1~120 응답 넣기 (문항번호 1..120, 값은 그대로 문자열화)
    for (let i = 1; i <= 120; i++) {
      const v = prev[i] ?? prev[String(i)];
      arr.push({ no: String(i), val: String(v) });
    }

    // 번호순 정렬
    arr.sort((a, b) => Number(a.no) - Number(b.no));

    // ★ v2 키는 소문자 사용 권장: trgetse, startdtm
    return {
      qno: 34,               // 흥미검사 H형
      trgetse: '100207',     // 고등학생 (소문자 키)
      gender: '100323',      // 필요 시 UI로 대체
      grade: '2',
      school: '학교명',
      startdtm: Date.now(),  // (소문자 키)
      answers: arr,
    };
  };
  

  const checkAndSubmit = async () => {
  const v = validatePage7();
  if (!v.ok) {
    alert(v.msg);
    questionRefs.current[v.key]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  let payload;
  try {
    payload = buildV2Payload();
  } catch (e) {
    if (e.message === 'MISSING_1_120') {
      alert(`1~6페이지 응답이 누락되었습니다.\n다시 돌아가서 완료해 주세요.\n(누락: ${e.missing.slice(0,10).join(', ')}${e.missing.length>10?' 외':''})`);
      return;
    }
    console.error(e);
    alert('제출 페이로드 구성 중 오류가 발생했습니다.');
    return;
  }

  try {
    // 1) 문자열 백업 먼저 생성 (❗ 선언 전에 절대 쓰지 말기)
    const answersStr = Array.isArray(payload.answers)
      ? payload.answers.map(({ no, val }) => `${no}=${val}`).join(' ')
      : '';

    // 2) 백업 문자열 포함한 실제 전송 payload
    const payloadWithLegacy = { ...payload, answersString: answersStr };

    // 3) 디버그 로그 (answersStr 사용은 여기서 OK)
    console.log('[v2 payload preview]', {
      ...payloadWithLegacy,
      answers_type: Array.isArray(payload.answers) ? 'array' : typeof payload.answers,
      answers_len: Array.isArray(payload.answers) ? payload.answers.length : null,
      answers_sample: Array.isArray(payload.answers) ? payload.answers.slice(0, 3) : null,
    });

    // 4) 전송
    const res = await axios.post(`${API_BASE}/api/interest/submit`, payloadWithLegacy, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 결과 URL 처리 동일
    const urlFromApi =
      res?.data?.result?.inspct?.reporturl ||
      res?.data?.RESULT?.url || '';

    let finalUrl = urlFromApi;
    if (!finalUrl) {
      const seq =
        res?.data?.result?.inspct?.inspctseq ||
        res?.data?.RESULT?.inspctSeq;
      if (seq) {
        const encoded = btoa(String(seq));
        finalUrl = `https://www.career.go.kr/inspct/web/psycho/holland2/report?seq=${encoded}`;
      }
    }

    if (!finalUrl) {
      console.error('❌ 결과 URL을 찾지 못했습니다.', res?.data);
      alert('결과 URL을 찾지 못했습니다. 콘솔 로그를 확인해주세요.');
      return;
    }

    const w = window.open(finalUrl, '_blank', 'noopener,noreferrer');
    if (!w) {
      const w2 = window.open('', '_blank', 'noopener,noreferrer');
      if (w2) w2.location.replace(finalUrl);
      else alert('팝업이 차단되어 결과지를 새 창으로 열 수 없습니다.\n브라우저 팝업 허용 후 다시 시도해주세요.');
    }

    localStorage.removeItem('interestAnswersV2');
    navigate('/testcomplete', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
  // 기존 콘솔/알럿 위에 "detail"을 확실히 보여주자
  const detail = err?.response?.data?.detail;
  console.error('[v2 submit] FULL DETAIL >>>', detail);
  const rs = detail?.requestSummary;
  const ub = detail?.upstreamBody;
  // 핵심 요약을 alert로 바로 보이게
  alert([
    '[진단] upstreamStatus=' + (err?.response?.data?.upstreamStatus ?? err?.response?.status),
    'answersCount=' + (rs?.answersCount),
    `range=${rs?.minNo}..${rs?.maxNo} has131=${rs?.has131} reqCount=${rs?.requiredCount}`,
    'decMajor(130)=' + rs?.decMajor,
    'upstream msg=' + (ub?.message || ub?.error || JSON.stringify(ub)?.slice(0,200))
  ].join('\n'));
  // 기존 로그 유지
  console.error('[v2 submit] error', err?.response?.status, err?.response?.data, detail?.upstreamBody);
  alert('제출 중 오류가 발생했습니다.\n콘솔 로그의 [FULL DETAIL]를 캡처해 주세요.');
}


  // (선택) echo는 디버그용이면 남겨둬도 됨
  // await axios.post(`${API_BASE}/api/_debug/echo`, payloadWithLegacy, { headers: { 'Content-Type': 'application/json' } });
};

  // ─────────────────────────────────
  // 렌더 (디자인 그대로, 텍스트만 API 값으로 치환)
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
              <div className="question-text">{`1-${i+1}. ${sec1Texts[i]}`}</div>
              <div className="circle-options-7">
                {[1,2,3,4,5].map((val,j)=>(
                  <div key={val} className="circle-container-7">
                    <div
                      ref={el => questionRefs.current[`1-${i+1}`] = el}
                      className={`circle-7 ${String(answers[1][i])===String(val) ? 'selected' : ''}`}
                      onClick={()=>handleSelect(1, i, String(val))}
                    />
                    {j===0 && <div className="circle-label-7">〈 매우 그렇지 않다</div>}
                    {j===2 && <div className="circle-label-7">보통</div>}
                    {j===4 && <div className="circle-label-7">매우 그렇다 〉</div>}
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
            <div className="question-text">2-1. 장래 희망 직업 결정 여부</div>
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
            <div className="question-text">2-2. 장래 희망 전공분야 결정 여부</div>
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
            <div className="question-text">2-3. 전공 계열 선택</div>
            <div className="box-options-7 small">
              {MAJOR_FIELDS.map(opt=>(
                <div
                  key={opt}
                  className={`box-7 ${answers[2][2]===opt?'selected':''}`}
                  onClick={()=>handleBoxSelect(2,2,opt)}
                >{opt}</div>
              ))}
            </div>
            {encodeDecision(answers[2][1])==='2' && (
              <p className="small-guide" style={{marginTop:8}}>※ 2-2에서 ‘결정못함’을 선택하면 이 항목은 건너뜁니다.</p>
            )}
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
                  {answers[3][idx] ? jobCodeToText(answers[3][idx]) : `직업을 선택해주세요.`}
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
                    onClick={()=>{
                      setShowSubjectModal({open:true, section:sectionIdx});
                      setTempSubjects(["",""]); // 새 선택 시작
                    }}
                  >
                    {answers[4][sectionIdx][idx]
                      ? `${idx+1}순위: ${subjectLabel(answers[4][sectionIdx][idx])}`
                      : `${idx+1}순위 과목`}
                  </div>
                ))}
                <button className="page7button" onClick={()=>{
                  setShowSubjectModal({open:true, section:sectionIdx});
                  setTempSubjects(["",""]);
                }}>과목 선택</button>
              </div>
            </div>
          ))}
        </div>

        {/* 5번 */}
        <div className="section">
          <div className="section-title">5. 아래 질문에 응답해주세요</div>
          <div>
            <div className="question-text">5-1. 학교생활 만족도</div>
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
          <div className="section-title">
            6. 자신의 학업성적이 과목별로 대략 어느 범위에 속한다고 생각하십니까?
          </div>
          {Array.from({length:9}, (_,i)=>(
            <div key={i}>
              <div className="question-text">{`6-${i+1}. ${achieveLabels[i]}`}</div>
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

      {/* ── 모달: 직업 선택 ── */}
      {showJobModal.open && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content modal-square job-modal" style={{maxHeight:'80vh', overflowY:'auto'}}>
            <button
              className="modal-x"
              aria-label="닫기"
              onClick={()=>setShowJobModal({open:false, index:null})}
            >
              ×
            </button>
            <h4>직업 선택</h4>
            <div className="modal-list modal-grid-tight" style={{maxHeight:'70vh', overflowY:'auto'}}>
              {jobChoices.map((job)=>(
                <button
                className="modal-btn"
                key={job.val}
                onClick={()=>{
                  const updated = { ...answers };
                  updated[3][showJobModal.index] = job.val;  // "1"~"62"
                  setAnswers(updated);
                  setShowJobModal({open:false,index:null});
            }}
          >
            {job.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 모달: 과목 선택 ── */}
      {showSubjectModal.open && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content modal-square" style={{maxHeight:'80vh', overflowY:'auto'}}>
            <button
              className="modal-x"
              aria-label="닫기"
              onClick={()=>{
                setShowSubjectModal({open:false, section:null});
                setTempSubjects(["",""]);
              }}
            >
              ×
            </button>

            <div style={{maxHeight:'72vh', overflowY:'auto', paddingRight:4}}>
              <h4>1순위 선택</h4>
              <div className="modal-list modal-grid-tight" style={{maxHeight:'30vh', overflowY:'auto'}}>
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
              <div className="modal-list modal-grid-tight" style={{maxHeight:'30vh', overflowY:'auto'}}>
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
        </div>
      )}

    </div>
  );
};

export default InterestTestPage7;
