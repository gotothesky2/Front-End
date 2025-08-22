// AptitudeTest.js — v1 JSON 제출 대응(415 방지), qnos 정합성/복원 보강 + 결과 seq 안전 처리
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AptitudeTest.css";

const LS_KEY = "aptitude_v1_progress"; // 임시저장 키

const AptitudeTest = () => {
  const QUESTIONS_PER_PAGE = 8;
  const [allQuestions, setAllQuestions] = useState([]); // 원문항
  const [answers, setAnswers] = useState([]);           // 사용자 답(1~7)
  const [qnos, setQnos] = useState([]);                 // 실제 문항번호(qitemNo)
  const [qestrnSeq, setQestrnSeq] = useState("21");     // 설문 코드(질문과 일치)
  const [page, setPage] = useState(0);
  const questionRefs = useRef([]);
  const navigate = useNavigate();

  // 질문 불러오기 + 임시저장 복원
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/questions");
        const questionData = Array.isArray(res.data?.RESULT) ? res.data.RESULT : [];

        // 응답에 qestrnSeq가 있으면 우선 반영
        const seqFromMeta =
          res.data?.qestrnSeq ||
          res.data?.result?.qestrnSeq ||
          res.data?.meta?.qestrnSeq;
        setQestrnSeq(String(seqFromMeta || "21"));

        setAllQuestions(questionData);

        // 가능한 키 후보에서 문항번호 추출(없으면 1..N)
        const ids = questionData.map((q, i) => {
          const cand =
            q.qitemNo ?? q.qItemNo ?? q.qno ?? q.no ?? q.itemNo ?? q.questNo;
          return Number.isFinite(Number(cand)) ? Number(cand) : i + 1;
        });
        setQnos(ids);

        // 임시저장 복원(문항 수와 번호배열 모두 일치할 때만)
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        if (
          Array.isArray(saved.answers) &&
          Array.isArray(saved.qnos) &&
          saved.qnos.length === ids.length &&
          saved.qnos.every((n, idx) => n === ids[idx])
        ) {
          setAnswers(saved.answers);
          setPage(Number(saved.page) || 0);
        } else {
          setAnswers(Array(questionData.length).fill(null));
        }
      } catch (err) {
        console.error("❌ API 연결 실패:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (qIdx, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = value;
      return next;
    });
  };

  // 임시 저장
  const handleTempSave = () => {
    const toSave = { answers, qnos, page };
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    alert("임시 저장되었습니다. (이 브라우저에서 계속 이어서 응시할 수 있어요)");
  };

  const checkUnansweredAndScroll = () => {
    const startIdx = page * QUESTIONS_PER_PAGE;
    const endIdx = startIdx + QUESTIONS_PER_PAGE;
    const unansweredIndex = answers.slice(startIdx, endIdx).findIndex((ans) => ans == null);

    if (unansweredIndex !== -1) {
      const absoluteIndex = startIdx + unansweredIndex;
      alert(`${absoluteIndex + 1}번 문항을 답변하지 않았습니다.\n답변해주세요.`);
      questionRefs.current[absoluteIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    try {
      // 0) 미응답 검사
      const missing = answers.findIndex((v) => v == null);
      if (missing !== -1) {
        alert(`${missing + 1}번 문항을 답변하지 않았습니다.`);
        questionRefs.current[missing]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // 1) "순번(1..N)=답" 문자열 생성  ← ★핵심: qnos 대신 i+1 사용
      const N = allQuestions.length;
      const answersStr = Array.from({ length: N }, (_, i) => `${i + 1}=${answers[i]}`).join(" ");

      // (안전) 포맷 검증
      const tokens = answersStr.trim().split(/\s+/);
      const valid = tokens.length === N && tokens.every(t => /^\d+=[1-7]$/.test(t));
      if (!valid) {
        console.error("❌ answersStr invalid", { count: tokens.length, expected: N, sample: tokens.slice(0, 20) });
        alert("답안 포맷 오류가 발생했습니다. 다시 시도해 주세요.");
        return;
      }

      // 2) CareerNet API 규격에 맞춘 payload 구성
      const payload = {
        qestrnSeq,          // 질문 세트와 반드시 동일
        trgetSe: "100207",  // 고등학생
        gender: "100323",   // 여: "100324"
        school: "율도중학교",
        grade: "2",
        startDtm: Date.now(),
        answers: answersStr,
      };

      // 3) 프록시 서버로 전송
      const res = await axios.post("http://localhost:4000/api/aptitude/submit", payload);
      console.log("제출 응답:", res.data);

      const result = res?.data?.RESULT || res?.data?.result || {};
      const urlFromApi = result?.url || "";
      const inspctSeq = result?.inspctSeq;

      // 4) URL 처리: seq 안전 추출
      let encodedSeq = null;
      try {
        if (urlFromApi) {
          const u = new URL(urlFromApi);
          encodedSeq = u.searchParams.get("seq");
        }
      } catch (_) {}

      if (!encodedSeq && inspctSeq != null) {
        encodedSeq = btoa(String(inspctSeq)); // 예: 38918021 → "Mzg5MTgwMjE"
      }

      if (!encodedSeq) {
        console.error("❌ 결과 seq 없음", { urlFromApi, inspctSeq, raw: res.data });
        alert("결과 seq를 찾지 못했습니다. 콘솔 로그를 확인하세요.");
        return;
      }

      const finalUrl = `https://www.career.go.kr/inspct/web/psycho/vocation/report?seq=${encodeURIComponent(encodedSeq)}`;
      console.log("✅ 최종 결과 url:", finalUrl);

      // 5) 결과지는 새 탭으로, 현재 탭은 /testcomplete 이동
      let w = window.open(finalUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        // 팝업 차단 대비: 앵커 트릭 한 번 더
        const a = document.createElement("a");
        a.href = finalUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // 임시저장 제거(선택)
      localStorage.removeItem(LS_KEY);

      // 현재 탭은 완료 화면으로 이동
      navigate("/testcomplete");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("제출/결과 처리 오류", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      alert("제출 과정에서 오류가 발생했습니다.");
    }
  };

  const currentQuestions = allQuestions.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

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
            나의 잠재된 능력을 발견하고, 진로의 방향을 명확히 설정해보세요.
            <br />
            객관적인 기준을 제공합니다.
          </p>
        </div>
        <img
          src="/img/직업적성검사_버튼.png"
          alt="직업 적성 검사"
          className="banner-image"
        />
      </div>

      <div className="questions-wrapper">
        <h3>
          문항 {page * QUESTIONS_PER_PAGE + 1} ~{" "}
          {Math.min((page + 1) * QUESTIONS_PER_PAGE, allQuestions.length)}
        </h3>
        <p className="small-guide">
          각 항목을 잘 읽고 자신에게 해당하는 정도를 선택해주세요.
        </p>
        <hr />
        {currentQuestions.map((q, idx) => {
          const absoluteIndex = page * QUESTIONS_PER_PAGE + idx;
          const qText = q.question ?? q.qstnCn ?? q.title ?? q.qItemNm ?? "";
          return (
            <div
              key={absoluteIndex}
              className="question-block"
              ref={(el) => (questionRefs.current[absoluteIndex] = el)}
            >
              <div className="question-text">
                {absoluteIndex + 1}. {qText}
              </div>
              <div className="circle-options">
                {[1, 2, 3, 4, 5, 6, 7].map((value, i) => (
                  <div key={value} className="circle-container">
                    <div
                      className={`circle ${
                        answers[absoluteIndex] === value ? "selected" : ""
                      }`}
                      onClick={() => handleSelect(absoluteIndex, value)}
                    />
                    {i === 0 && (
                      <div className="circle-label">〈 전혀 그렇지 않다</div>
                    )}
                    {i === 6 && (
                      <div className="circle-label">매우 그렇다 〉</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="button-group">
          <button className="save-button" onClick={handleTempSave}>
            임시 저장
          </button>
          {page < Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) - 1 ? (
            <button className="next-button" onClick={checkUnansweredAndScroll}>
              다음 페이지 &gt;
            </button>
          ) : (
            <button className="next-button" onClick={handleSubmit}>
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
