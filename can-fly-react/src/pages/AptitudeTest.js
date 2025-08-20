import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AptitudeTest.css";

const DRAFT_KEY = "aptitudeDraftV1"; // ✅ 로컬 임시저장 키

const AptitudeTest = () => {
  const QUESTIONS_PER_PAGE = 8;
  const [allQuestions, setAllQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [page, setPage] = useState(0);
  const questionRefs = useRef([]);
  const navigate = useNavigate();

  // 질문 불러오기 + ✅ 임시저장 복원
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/questions");
        const questionData = res.data.RESULT || [];

        // 기본 답안 배열
        const baseAnswers = Array(questionData.length).fill(null);

        // ✅ 로컬 임시저장 불러오기
        const draftRaw = localStorage.getItem(DRAFT_KEY);
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            if (Array.isArray(draft.answers)) {
              // 길이가 달라도 안전하게 병합
              const restored = baseAnswers.slice();
              const len = Math.min(restored.length, draft.answers.length);
              for (let i = 0; i < len; i++) {
                restored[i] = draft.answers[i] ?? null;
              }
              setAnswers(restored);
              if (
                typeof draft.page === "number" &&
                draft.page >= 0 &&
                draft.page <= Math.ceil(questionData.length / QUESTIONS_PER_PAGE)
              ) {
                setPage(draft.page);
              }
              // 안내는 조용히 복원—원하면 아래 alert 주석 해제
              // alert("임시 저장된 검사 진행사항을 불러왔습니다.");
            } else {
              setAnswers(baseAnswers);
            }
          } catch {
            setAnswers(baseAnswers);
          }
        } else {
          setAnswers(baseAnswers);
        }

        setAllQuestions(questionData);
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
      .findIndex((ans) => ans === null);

    if (unansweredIndex !== -1) {
      const absoluteIndex = startIdx + unansweredIndex;
      alert(
        `${absoluteIndex + 1}번 문항을 답변하지 않았습니다.\n답변해주세요.`
      );
      questionRefs.current[absoluteIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ 임시 저장 (answers + page 저장)
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          answers,
          page,
          savedAt: new Date().toISOString(),
        })
      );
      alert("임시 저장되었습니다. 다음에 다시 들어오면 이어서 시작됩니다.");
    } catch (e) {
      console.error("임시 저장 실패:", e);
      alert("임시 저장에 실패했습니다.");
    }
  };

  // 제출
  const handleSubmit = async () => {
    try {
      // CareerNet API가 요구하는 응답 포맷
      const payload = {
        qestrnSeq: "21", // 적성검사 코드
        trgetSe: "100209", // 중학생(예시)
        name: "홍길동", // 사용자 이름
        gender: "100323", // 남자
        grade: "2",
        startDtm: new Date().toISOString(),
        answers: answers.map((ans, idx) => `${idx + 1}=${ans}`).join(" "),
      };

      const res = await axios.post(
        "http://localhost:4000/api/aptitude/submit",
        payload
      );
      console.log("✅ 제출 성공:", res.data);

      const seq = res.data.RESULT?.url?.split("seq=")[1]; // CareerNet 리턴 URL에서 seq 추출
      if (seq) {
        try {
          const reportRes = await axios.get(
            `http://localhost:4000/api/aptitude/report/${seq}`
          );
          const pdfUrl =
            reportRes.data.RESULT?.pdfLink ||
            reportRes.data?.pdfLink ||
            reportRes.data?.RESULT?.url;

          // ✅ 제출 성공 시 임시저장 삭제
          localStorage.removeItem(DRAFT_KEY);

          // ✅ PDF 유무와 상관없이 TestComplete로 이동 (요청사항)
          if (pdfUrl) {
            navigate("/test-complete", { state: { pdfUrl } });
          } else {
            navigate("/test-complete");
          }
          return;
        } catch (e) {
          console.warn("결과 조회 실패(그래도 TestComplete 이동):", e);
        }
      } else {
        console.warn("seq 없음(그래도 TestComplete 이동)");
      }

      // ✅ seq 없거나 결과 조회 실패해도 TestComplete로 이동 (요청사항)
      localStorage.removeItem(DRAFT_KEY);
      navigate("/test-complete");
    } catch (err) {
      console.error("❌ 제출 실패:", err);
      alert("제출에 실패했습니다.");
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
          {(page + 1) * QUESTIONS_PER_PAGE}
        </h3>
        <p className="small-guide">
          각 항목을 잘 읽고 자신에게 해당하는 정도를 선택해주세요.
        </p>
        <hr />
        {currentQuestions.map((q, idx) => {
          const absoluteIndex = page * QUESTIONS_PER_PAGE + idx;
          return (
            <div
              key={absoluteIndex}
              className="question-block"
              ref={(el) => (questionRefs.current[absoluteIndex] = el)}
            >
              <div className="question-text">
                {absoluteIndex + 1}. {q.question}
              </div>
              <div className="circle-options">
                {[1, 2, 3, 4, 5, 6, 7].map((value, i) => (
                  <div key={value} className="circle-container">
                    <div
                      className={`circle ${
                        answers[absoluteIndex] === value ? "selected" : ""
                      }`}
                      onClick={() => handleSelect(absoluteIndex, value)}
                    ></div>
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
          {/* ✅ 임시 저장 버튼 동작 추가 */}
          <button className="save-button" onClick={handleSaveDraft}>
            임시 저장
          </button>

          {page < Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) - 1 && (
            <button className="next-button" onClick={checkUnansweredAndScroll}>
              다음 페이지 &gt;
            </button>
          )}
          {page === Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) - 1 && (
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
