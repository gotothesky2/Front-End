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
// v2 문항 조회 (번호 범위 필터: ?q=34&min=1&max=120 또는 ?q=34&min=121)
app.get("/api/interest/questions", async (req, res) => {
  try {
    const q = req.query.q || "34";
    const min = req.query.min ? Number(req.query.min) : null; // 예: 1
    const max = req.query.max ? Number(req.query.max) : null; // 예: 120

    const { data } = await api.get("/inspct/openapi/v2/test", {
      params: { apikey: API_KEY, q },
      headers: { Accept: "application/json" },
    });

    // 표준 v2 구조: data.result.questions
    const questions = Array.isArray(data?.result?.questions)
      ? data.result.questions
      : Array.isArray(data?.RESULT)
      ? data.RESULT
      : null;

    if (!Array.isArray(questions)) {
      // 모양이 상이하면 원본 그대로 반환
      return res.json(data);
    }

    const getNo = (it) => Number(it?.no ?? it?.qno ?? it?.id ?? it?.qitemNo ?? 0);

    const filtered = (min == null && max == null)
      ? questions
      : questions.filter((item) => {
          const n = getNo(item);
          if (!Number.isFinite(n) || n <= 0) return false;
          if (min != null && n < min) return false;
          if (max != null && n > max) return false;
          return true;
        });

    // 원본 형태 유지하면서 questions만 치환
    if (data?.result?.questions) {
      return res.json({ ...data, result: { ...data.result, questions: filtered } });
    } else if (Array.isArray(data?.RESULT)) {
      return res.json({ ...data, RESULT: filtered });
    } else {
      return res.json({ result: { questions: filtered } });
    }
  } catch (err) {
    console.error("[v2 questions] error:", err.response?.status, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Interest questions fetch failed",
      detail: err.response?.data || err.message,
    });
  }
});


// v2 제출(JSON) — 커리어넷 형식에 맞게 정규화(직업/과목 텍스트화, 130→131 제거, 쉼표 결합 등)
app.post("/api/interest/submit", async (req, res) => {
  try {
    const src = req.body || {};
    const rawAnswers = Array.isArray(src.answers) ? src.answers : [];
    if (rawAnswers.length === 0) {
      return res.status(400).json({ error: "answers required" });
    }

    // ── 직업/과목 텍스트 매핑 ──
    const JOBS = [
      "가수","간호사","경영컨설턴트","경찰관","공무원","관세사","괴롭힘방지조언사","교사","교육학연구원","국제개발협력전문가",
      "군인","금융자산운용가","기업고위임원/CEO","네이미스트","노년플래너","노무사","대체에너지개발연구원","도선사","동물보호보안관","로봇연구원",
      "로봇윤리학자","모델","무인항공시스템·드론개발자","방송연출가","법무사","뷰티디자이너","비행기조종사","빅데이터전문가","사서","사진작가",
      "사회단체활동가","사회복지사","상담전문가","생명공학연구원","소방관","수의사","스포츠감독","스포츠심리상담사","승무원","신약개발연구원",
      "연기자","연주가","운동경기심판","운동선수","음반기획자","응급구조사","인테리어디자이너","제품디자이너","천문학연구원","촬영기사",
      "출판편집자","캐스팅디렉터","컴퓨터그래픽디자이너","크라우드펀딩전문가","판사","항공교통관제사","항공기선박조립검사원","항공기정비원","환경컨설턴트","회계사",
      "기타( )","아직 결정 못함"
    ];
    const SUBJECTS = [
      "국어","사회","도덕","수학","과학","기술·가정","정보","체육","음악","미술",
      "연극","영어","제2외국어","한문","교양","창의적 체험활동","기타"
    ];
    const MAJOR_FIELDS = ["인문","사회","교육","공학","자연","의약","예체능"];

    // 1) no -> [val,val...] 수집 (문자열화)
    const bag = new Map();
    for (const it of rawAnswers) {
      const no = String(it?.no ?? "").trim();
      const val = String(it?.val ?? "").trim();
      if (!no || val === "") continue;
      const prev = bag.get(no);
      if (prev) prev.push(val); else bag.set(no, [val]);
    }

    // 2) 130(전공결정) 값 확인 → '1' 아니면 131 제거
    const decisionMajor = bag.get("130")?.[0]; // '1' or '2'
    if (decisionMajor !== "1") {
      bag.delete("131");
    } else {
      // 131은 텍스트여야 안전
      const v = bag.get("131")?.[0];
      if (v && !MAJOR_FIELDS.includes(v)) {
        // 숫자/이상값 들어오면 버리거나 기본값으로 보정
        bag.set("131", [MAJOR_FIELDS.includes(v) ? v : "인문"]);
      }
    }

    // 3) 132/133 직업: 숫자코드 → 직업명, 61 → '기타', 62 → '아직 결정 못함'
    const convertJobVal = (v) => {
      // v가 숫자코드면 매핑
      if (/^\d+$/.test(v)) {
        const idx = Number(v);
        if (idx >= 1 && idx <= 62) {
          const name = JOBS[idx - 1];
          // 61은 '기타( )' → 입력이 없는 상태면 '기타'로 축약
          if (idx === 61) return "기타";
          return name || v;
        }
      }
      // 대시/빈칸도 허용
      if (v === "-" || v === "—") return "-";
      return v;
    };
    ["132", "133"].forEach((key) => {
      if (bag.has(key)) {
        const first = bag.get(key)?.[0];
        if (first) bag.set(key, [convertJobVal(first)]);
      }
    });

    // 4) 134/135 과목 2개: 숫자코드 → 과목명으로 바꾸고 쉼표 결합
    const convertSubjectVal = (v) => {
      if (/^\d+$/.test(v)) {
        const idx = Number(v);
        if (idx >= 1 && idx <= SUBJECTS.length) return SUBJECTS[idx - 1];
      }
      return v;
    };
    ["134", "135"].forEach((key) => {
      if (bag.has(key)) {
        const vals = (bag.get(key) || []).filter(Boolean).map(convertSubjectVal);
        if (vals.length > 0) bag.set(key, [vals.join(",")]); // "미술,과학"
      }
    });

    // 5) 121~128, 137~145는 1~5/1~6 범위만 허용(문자열). 틀리면 제거/클램프 가능
    const clamp = (v, lo, hi) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      return String(Math.min(hi, Math.max(lo, n)));
    };
    for (let n = 121; n <= 128; n++) {
      const k = String(n);
      if (bag.has(k)) {
        const v = clamp(bag.get(k)?.[0], 1, 5);
        if (v) bag.set(k, [v]); else bag.delete(k);
      }
    }
    for (let n = 137; n <= 145; n++) {
      const k = String(n);
      if (bag.has(k)) {
        const v = clamp(bag.get(k)?.[0], 1, 6);
        if (v) bag.set(k, [v]); else bag.delete(k);
      }
    }

    // 6) 최종 answers (정렬)
    const finalAnswers = [];
    for (const [no, vals] of bag.entries()) {
      if (!vals || vals.length === 0) continue;
      finalAnswers.push({ no: String(no), val: String(vals[0]) });
    }
    finalAnswers.sort((a, b) => Number(a.no) - Number(b.no));

    // 7) 바디 표준화 (소문자 키 + 문자열)
    const body = {
      apikey: API_KEY,
      qno: String(src.qno ?? "34"),
      trgetse: String(src.trgetse ?? src.trgetSe ?? "100207"), // 고등학생
      gender: String(src.gender ?? "100323"),
      grade: String(src.grade ?? "2"),
      school: String(src.school ?? ""),
      startdtm: Number(src.startdtm ?? src.startDtm ?? Date.now()),
      answers: finalAnswers,
    };

    console.log("[v2 submit] outgoing", {
      qno: body.qno,
      trgetse: body.trgetse,
      gender: body.gender,
      grade: body.grade,
      count: body.answers.length,
      head: body.answers.slice(0, 10),
    });

    const { data, status } = await axios.post(
      "https://www.career.go.kr/inspct/openapi/v2/report",
      body,
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

    if (status >= 200 && status < 300) {
      const url =
        data?.result?.inspct?.reporturl ||
        data?.RESULT?.url ||
        "";
      const inspctSeq =
        data?.result?.inspct?.inspctseq ||
        data?.RESULT?.inspctSeq ||
        "";

      console.log("[v2 submit] upstream OK", { status, url, inspctSeq });
      return res.json(data);
    }

    console.error("[v2 submit] upstream FAIL", { status, data });
    return res.status(status || 500).json({
      error: "Interest submit failed",
      detail: data || "Unknown error",
    });
  } catch (err) {
    console.error("[v2 submit] exception", {
      status: err.response?.status,
      data: err.response?.data || err.message,
    });
    return res.status(err.response?.status || 500).json({
      error: "Interest submit failed",
      detail: err.response?.data || err.message,
    });
  }
});



// ---- 서버 시작 (파일 맨 아래에 추가) ----
const server = app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn("⚠️  API_KEY가 .env에서 로드되지 않았습니다. 인증이 필요한 요청은 실패할 수 있어요.");
  }
});

server.on("error", (err) => {
  console.error("❌ server error:", err.code || err.message, err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UnhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("❌ UncaughtException:", err);
});
