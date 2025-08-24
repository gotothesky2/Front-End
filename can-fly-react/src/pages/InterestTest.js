// src/pages/InterestTest.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import "../styles/InterestTest.css";
import { useNavigate } from "react-router-dom";
import { get } from "../api/Api";

const PAGE_SIZE = 20;

// 응답 어디에 있든 문항 배열 찾아오기(방어)
const findQuestionArrays = (root, maxDepth = 6) => {
  const results = [];
  const seen = new Set();
  const stack = [{ node: root, depth: 0, path: "$" }];
  while (stack.length) {
    const { node, depth, path } = stack.pop();
    if (!node || typeof node !== "object" || seen.has(node) || depth > maxDepth)
      continue;
    seen.add(node);
    if (Array.isArray(node) && node.length) {
      const it = node[0];
      if (it && typeof it === "object") {
        const keys = Object.keys(it);
        const looksV2 = keys.includes("no") || keys.includes("choices");
        const looksV1 =
          keys.includes("qitemNo") ||
          keys.includes("question") ||
          keys.some((k) => /^answer(?:Score)?\d{2}$/i.test(k));
        if (looksV2 || looksV1) results.push({ path, arr: node });
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (v && typeof v === "object")
        stack.push({ node: v, depth: depth + 1, path: `${path}.${k}` });
    }
  }
  return results;
};

// v2 정규화
const normalizeV2Item = (q) => {
  const choices = Array.isArray(q.choices) ? q.choices : [];
  let options = choices
    .filter((c) => c && (c.val !== undefined || c.text !== undefined))
    .map((c) => ({
      label: String(c.text ?? c.val ?? ""),
      score: String(c.val ?? ""),
    }))
    .filter((o) => o.score !== "");
  if (options.length === 0) {
    options = Array.from({ length: 5 }, (_, i) => ({
      label: String(i + 1),
      score: String(i + 1),
    }));
  }
  return {
    qitemNo: Number(q.no ?? q.qno ?? q.id ?? 0),
    question: String(q.text ?? q.title ?? q.qstnCn ?? "").trim(),
    options,
  };
};

// v1 정규화 (방어용 — 실제 v2만 사용하겠지만 혹시 모를 포맷 대응)
const normalizeV1Item = (it) => {
  const qitemNo = Number(it.qitemNo ?? it.qitemno ?? it.qItemNo ?? it.no ?? 0);
  const question = String(it.question ?? it.qstnCn ?? it.title ?? "").trim();

  const options = [];
  for (let i = 1; i <= 10; i++) {
    const pad = String(i).padStart(2, "0");
    const label =
      it[`answer${pad}`] ??
      it[`answr${pad}`] ??
      it[`answer_${pad}`] ??
      it[`answr_${pad}`];
    const scoreRaw =
      it[`answerScore${pad}`] ?? it[`answrScore${pad}`] ?? it[`score${pad}`];
    if (label !== undefined && label !== null && String(label).trim() !== "") {
      const score =
        scoreRaw !== undefined && scoreRaw !== null && String(scoreRaw) !== ""
          ? String(scoreRaw)
          : String(i);
      options.push({ label: String(label), score });
    }
  }
  const finalOptions =
    options.length === 0
      ? Array.from({ length: 5 }, (_, i) => ({
          label: String(i + 1),
          score: String(i + 1),
        }))
      : options;

  return { qitemNo, question, options: finalOptions };
};

const InterestTest = () => {
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState([]);
  const questionRefs = useRef([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // ★ 1~120만 서버에서 필터해서 받기
        const res = await get(
          "https://www.career.go.kr/inspct/openapi/v2/test?apikey=69611c6585da333774ecf91966fc17f0&q=34 "
        );

        // 대표 후보
        const primaryCandidates = [];
        if (Array.isArray(res.result.questions))
          primaryCandidates.push({
            path: "$.result.questions",
            arr: res.result.questions,
          });
        if (Array.isArray(res.data?.RESULT))
          primaryCandidates.push({ path: "$.RESULT", arr: res.data.RESULT });

        const discovered = findQuestionArrays(res.data);
        const candidates = [...primaryCandidates, ...discovered];

        if (!candidates.length) {
          alert(
            "문항 파싱 결과가 0개입니다. 콘솔의 [interest raw preview]를 확인하세요."
          );
          setAllQuestions([]);
          return;
        }

        candidates.sort((a, b) => (b.arr?.length || 0) - (a.arr?.length || 0));
        const picked = candidates[0];
        console.log(
          "[interest] picked path:",
          picked.path,
          "count:",
          picked.arr.length
        );

        const first = picked.arr[0] || {};
        const isV2 = "no" in first || "choices" in first;
        const normalized = (
          isV2
            ? picked.arr.map(normalizeV2Item)
            : picked.arr.map(normalizeV1Item)
        ).filter((q) => q.qitemNo && q.question && q.options.length > 0);

        // ✅ 1~120만 사용 (서버가 min/max를 무시해도 안전)
        const first120 = normalized.filter(
          (q) => q.qitemNo >= 1 && q.qitemNo <= 120
        );
        console.log("[interest normalized count]", first120.length);
        setAllQuestions(first120);
      } catch (err) {
        console.log(
          "fetch error:",
          err?.response?.status,
          err?.response?.data || err.message
        );
        alert("질문 불러오기에 실패했습니다.");
      }
    };
    fetchQuestions();
  }, []);

  const pageQuestions = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allQuestions.slice(start, end);
  }, [allQuestions, page]);

  useEffect(() => {
    if (allQuestions.length === 0) return;
    setAnswers(Array(pageQuestions.length).fill(null));
    questionRefs.current = [];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, allQuestions.length]); // eslint-disable-line

  if (allQuestions.length === 0) {
    return (
      <div className="interest-container">
        <div className="questions-wrapper">문항을 불러오는 중...</div>
      </div>
    );
  }

  const handleSelect = (qIdx, optIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);

    // 선택한 값 로컬스토리지 누적 저장 (→ 7페이지에서 합쳐 제출)
    const q = pageQuestions[qIdx];
    const picked = q.options[optIdx];
    if (!picked) return;

    const mapKey = "interestAnswersV2";
    const prev = JSON.parse(localStorage.getItem(mapKey) || "{}");
    prev[q.qitemNo] = picked.score; // {"1":"1".."5"}
    localStorage.setItem(mapKey, JSON.stringify(prev));
  };

  const checkUnansweredAndGo = () => {
    const idx = answers.findIndex((v) => v === null);
    if (idx !== -1) {
      alert(`${idx + 1}번 문항을 답변하지 않았습니다.\n답변해주세요.`);
      questionRefs.current[idx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    if (page < Math.ceil(allQuestions.length / PAGE_SIZE) - 1) {
      setPage((p) => p + 1);
    } else {
      // 1~120 끝 → 7페이지로
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/interesttestpage7");
    }
  };

  return (
    <div className="interest-container">
      <div className="banner-with-image">
        <div className="banner-text">
          <h2>직업 흥미 검사</h2>
          <p>
            내가 진짜 ‘좋아하는 일’은 무엇일까? 흥미는 진로의 원동력입니다.
            <br />
            직업 흥미 검사는 개인의 성격과 관심사를 바탕으로, 즐겁게 몰입할 수
            있는 직업군과 전공 분야를 탐색하는 과정입니다. 입시에서 전공
            적합성과 자기소개서 작성에 활용 가능하며, 흥미 기반의 선택은 진로
            방황을 줄이고 학업 만족도를 높이는 데 기여합니다.
          </p>
        </div>
        <img
          src="/img/직업흥미검사_버튼.png"
          alt="직업 흥미 검사"
          className="banner-image"
        />
      </div>

      <div className="questions-wrapper">
        <h3>{`페이지 ${page + 1}`}</h3>
        <p className="small-guide">
          각 항목을 잘 읽고 자신에게 해당하는 정도를 선택해주세요.
        </p>
        <hr />

        {pageQuestions.map((q, idx) => (
          <div
            key={q.qitemNo}
            className="question-block"
            ref={(el) => (questionRefs.current[idx] = el)}
          >
            <div className="question-text">
              {idx + 1}. {q.question}
            </div>

            <div className="circle-options">
              {q.options.map((opt, i) => (
                <div key={i} className="circle-container">
                  <div
                    className={`circle ${answers[idx] === i ? "selected" : ""}`}
                    onClick={() => handleSelect(idx, i)}
                  />
                  {i === 0 && (
                    <div className="circle-label">〈 매우 싫어한다</div>
                  )}
                  {i === q.options.length - 1 && (
                    <div className="circle-label">매우 좋아한다 〉</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="button-group">
          <button
            className="save-button"
            onClick={() => alert("임시 저장되었습니다. (브라우저 저장)")}
          >
            임시 저장
          </button>
          <button className="next-button" onClick={checkUnansweredAndGo}>
            {page < Math.ceil(allQuestions.length / PAGE_SIZE) - 1
              ? "다음 페이지 >"
              : "7페이지로 >"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestTest;
