// proxy-server.js — CareerNet proxy (Aptitude v1 + Interest v2) with rich console logs
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

// CareerNet API Key
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json()); // JSON 요청 파서
app.use(express.urlencoded({ extended: true })); // form 파서(혹시 모를 호환성)

app.get("/health", (_req, res) => res.send("ok"));

/** 공용 axios (GET용) */
const api = axios.create({
  baseURL: "https://www.career.go.kr",
  timeout: 15000,
});

/* -------------------
   적성검사 (v1)
------------------- */

// v1 질문 조회
app.get("/api/questions", async (req, res) => {
  try {
    const q = req.query.q || "21";
    console.log("[v1 questions] fetching", { q });
    const { data } = await api.get("/inspct/openapi/test/questions", {
      params: { apikey: API_KEY, q },
      headers: { Accept: "application/json" },
    });
    console.log("[v1 questions] ok", {
      items: Array.isArray(data?.RESULT) ? data.RESULT.length : 0,
      qestrnSeq: data?.qestrnSeq || data?.result?.qestrnSeq || data?.meta?.qestrnSeq,
    });
    res.json(data);
  } catch (err) {
    console.error("[v1 questions] error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Failed to fetch aptitude questions",
      detail: err.response?.data || err.message,
    });
  }
});

// v1 제출 — 폼 우선, 415면 JSON 재시도 (+ 상세 콘솔 로그/검증)
// v1 제출 — 폼 우선, 415면 JSON 재시도 (+ 상세 콘솔 로그/검증 + 질문세트 교차검증)
app.post("/api/aptitude/submit", async (req, res) => {
  try {
    const { qestrnSeq, trgetSe, name, gender, school, grade, startDtm, answers } = req.body;

    // 수신 로그
    const rawLen =
      typeof answers === "string" ? answers.trim().split(/\s+/).length
        : Array.isArray(answers) ? answers.length
        : -1;
    console.log("[v1 submit] incoming", {
      qestrnSeq, trgetSe, gender, grade,
      startDtmType: typeof startDtm,
      answersLen: rawLen,
      answersHead: typeof answers === "string"
        ? answers.trim().split(/\s+/).slice(0, 12).join(" ")
        : String(answers).slice(0, 120),
    });

    // 필수값 체크
    const missing = ["qestrnSeq","trgetSe","gender","grade","startDtm","answers"]
      .filter((k) => req.body?.[k] == null || req.body?.[k] === "");
    if (missing.length) {
      console.warn("[v1 submit] 400 missing", missing);
      return res.status(400).json({ error: "Missing fields", missing });
    }

    // startDtm 보정
    const startVal =
      typeof startDtm === "number" ? startDtm :
      /^\d+$/.test(String(startDtm)) ? Number(startDtm) : Date.now();

    // answers 문자열 보정
    const answersStr =
      typeof answers === "string"
        ? answers.replace(/\s+/g, " ").trim()
        : Array.isArray(answers)
        ? answers.join(" ").replace(/\s+/g, " ").trim()
        : String(answers).replace(/\s+/g, " ").trim();

    // 0) 질문세트 교차검증: qestrnSeq로 질문 개수 N 가져오기
    let expectedCount = null;
    try {
      const { data: qdata } = await api.get("/inspct/openapi/test/questions", {
        params: { apikey: API_KEY, q: qestrnSeq },
        headers: { Accept: "application/json" },
      });
      expectedCount = Array.isArray(qdata?.RESULT) ? qdata.RESULT.length : null;
      console.log("[v1 submit] cross-check questions", {
        qestrnSeq, expectedCount
      });
    } catch (e) {
      console.warn("[v1 submit] cross-check failed (continue anyway)", e.response?.status || e.message);
    }

    // 1) 포맷 사전 검증
    const tokens = answersStr.length ? answersStr.split(" ") : [];
    const formatOK = tokens.length >= 1 && tokens.every((t) => /^\d+=[1-7]$/.test(t));
    if (!formatOK) {
      console.warn("[v1 submit] 400 answers format invalid", {
        sample: tokens.slice(0, 20), count: tokens.length
      });
      return res.status(400).json({
        error: "answers format invalid",
        detail: { sample: tokens.slice(0, 20), count: tokens.length }
      });
    }

    // 2) 개수/번호 범위 검증 (expectedCount를 알 때만)
    if (typeof expectedCount === "number") {
      const indices = tokens.map(t => Number(t.split("=")[0]));
      const minIdx = Math.min(...indices);
      const maxIdx = Math.max(...indices);

      if (tokens.length !== expectedCount) {
        console.warn("[v1 submit] 400 answers length mismatch", {
          expectedCount, got: tokens.length
        });
        return res.status(400).json({
          error: "answers length mismatch",
          detail: { expectedCount, got: tokens.length, sample: tokens.slice(0, 20) }
        });
      }

      // 순번전략(1..N)인지 간단 검사
      const looksSequential = minIdx === 1 && maxIdx === expectedCount;
      console.log("[v1 submit] numbering check", { minIdx, maxIdx, looksSequential });
    }

    // 3) 페이로드 구성
    const basePayload = {
      apikey: API_KEY,
      qestrnSeq,             // 질문 세트와 동일해야 함
      trgetSe,               // 보통 "100206" (안 맞으면 "100209"로도 테스트)
      gender,                // 100323/100324
      grade,
      startDtm: startVal,
      answers: answersStr,   // "1=5 2=7 ..." 공백 문자열
      ...(name ? { name } : {}),
      ...(school ? { school } : {}),
    };

    // 4) form-urlencoded 시도
    const form = new URLSearchParams();
    Object.entries(basePayload).forEach(([k, v]) => form.append(k, String(v)));

    console.log("[v1 submit] try FORM", {
      qestrnSeq: basePayload.qestrnSeq,
      trgetSe: basePayload.trgetSe,
      gender: basePayload.gender,
      grade: basePayload.grade,
      answersCount: tokens.length,
      answersHead: tokens.slice(0, 12).join(" "),
    });

    let resp = await axios.post(
      "https://www.career.go.kr/inspct/openapi/test/report",
      form.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 15000,
        validateStatus: () => true,
      }
    );

    console.log("[v1 submit] FORM result", { status: resp.status });

    // 415면 JSON 재시도
    if (resp.status === 415) {
      console.log("[v1 submit] FORM => 415, retry as JSON");
      resp = await axios.post(
        "https://www.career.go.kr/inspct/openapi/test/report",
        basePayload,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0",
          },
          timeout: 15000,
          validateStatus: () => true,
        }
      );
      console.log("[v1 submit] JSON result", { status: resp.status });
    }

    if (resp.status >= 200 && resp.status < 300) {
      console.log("[v1 submit] upstream OK", {
        hasRESULT: !!resp.data?.RESULT,
        inspctSeq: resp.data?.RESULT?.inspctSeq,
        url: resp.data?.RESULT?.url,
      });
      return res.json(resp.data);
    }

    console.error("[v1 submit] upstream FAIL", { status: resp.status, data: resp.data });
    return res.status(resp.status || 500).json({
      error: "Aptitude submit failed",
      detail: resp.data || "Unknown error",
    });
  } catch (err) {
    console.error("[v1 submit] exception", {
      status: err.response?.status,
      data: err.response?.data || err.message,
    });
    return res.status(err.response?.status || 500).json({
      error: "Aptitude submit failed",
      detail: err.response?.data || err.message,
    });
  }
});


// v1 결과 조회(seq)
app.get("/api/aptitude/report/:seq", async (req, res) => {
  try {
    const { seq } = req.params;
    console.log("[v1 report] fetch", { seq });
    const { data } = await api.get("/inspct/openapi/report", {
      params: { apikey: API_KEY, seq },
      headers: { Accept: "application/json" },
    });
    console.log("[v1 report] ok", {
      hasRESULT: !!data?.RESULT,
      url: data?.RESULT?.url,
    });
    res.json(data);
  } catch (err) {
    console.error("[v1 report] error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Aptitude report fetch failed",
      detail: err.response?.data || err.message,
    });
  }
});

/* -------------------
   흥미검사 (v2)
------------------- */

// v2 문항 조회
app.get("/api/interest/questions", async (req, res) => {
  try {
    const q = req.query.q || "34";
    console.log("[v2 questions] fetching", { q });
    const { data } = await api.get("/inspct/openapi/v2/test", {
      params: { apikey: API_KEY, q },
      headers: { Accept: "application/json" },
    });
    console.log("[v2 questions] ok", {
      items: Array.isArray(data?.RESULT) ? data.RESULT.length : 0,
    });
    res.json(data);
  } catch (err) {
    console.error("[v2 questions] error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Interest questions fetch failed",
      detail: err.response?.data || err.message,
    });
  }
});

// v2 제출(JSON)
app.post("/api/interest/submit", async (req, res) => {
  try {
    const payload = { ...req.body, apikey: API_KEY };
    console.log("[v2 submit] outgoing", {
      hasAnswers: !!payload?.answers,
      qestrnSeq: payload?.qestrnSeq,
    });
    const { data } = await api.post("/inspct/openapi/v2/report", payload, {
      headers: { "Content-Type": "application/json; charset=utf-8", Accept: "application/json" },
    });
    console.log("[v2 submit] upstream OK", {
      hasRESULT: !!data?.RESULT,
      inspctSeq: data?.RESULT?.inspctSeq,
      url: data?.RESULT?.url,
    });
    res.json(data);
  } catch (err) {
    console.error("[v2 submit] error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Interest submit failed",
      detail: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
