// netlify/functions/proxy.js — CareerNet proxy (Aptitude v1 + Interest v2) for Netlify Functions
const serverless = require("serverless-http");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const router = express.Router(); // 라우터로 정의한 뒤 두 경로에 마운트

// 공통 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CareerNet API Key
const API_KEY = process.env.API_KEY;

// 디버그
router.get("/api/_debug/env", (_req, res) => res.json({ hasApiKey: !!API_KEY }));
router.post("/api/_debug/echo", (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) {}
  }
  res.json({ hasApiKey: !!API_KEY, body });
});

// 공용 axios (GET용)
const api = axios.create({
  baseURL: "https://www.career.go.kr",
  timeout: 15000,
});

// Health
router.get("/api/health", (_req, res) => res.send("ok"));

/* -------------------
   적성검사 (v1)
------------------- */

// v1 질문 조회
router.get("/api/questions", async (req, res) => {
  try {
    const q = req.query.q || "21";
    const { data } = await api.get("/inspct/openapi/test/questions", {
      params: { apikey: API_KEY, q },
      headers: { Accept: "application/json" },
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Failed to fetch aptitude questions",
      detail: err.response?.data || err.message,
    });
  }
});

// v1 제출 (폼 → JSON 재시도, trgetSe 후보 순회, 자동 보정)
router.post("/api/aptitude/submit", async (req, res) => {
  try {
    // serverless 환경 방어
    let src = req.body ?? {};
    if (typeof src === "string") {
      try { src = JSON.parse(src); } catch (_) {}
    }

    // 0) 질문 수 교차검증
    const qestrnSeq = String(src.qestrnSeq || "21");
    let expected = null;
    try {
      const { data } = await axios.get("https://www.career.go.kr/inspct/openapi/test/questions", {
        params: { apikey: API_KEY, q: qestrnSeq },
        headers: { Accept: "application/json" },
        timeout: 15000,
      });
      expected = Array.isArray(data?.RESULT) ? data.RESULT.length : null;
    } catch (_) {}

    // 1) trgetSe 후보
    const trgetCandidates = [
      String(src.trgetSe || ""),
      "100207", // 고등
      "100206", // 중등
      "100209", // 일반
    ].filter(Boolean);

    // 2) gender 보정
    let gender = String(src.gender || "100323");
    if (/^f(emale)?$/i.test(gender)) gender = "100324";
    if (/^m(ale)?$/i.test(gender)) gender = "100323";

    const grade    = String(src.grade || "2");
    const startDtm = Number(src.startDtm || Date.now());
    const name     = src.name ? String(src.name) : undefined;
    const school   = src.school ? String(src.school) : undefined;

    // 3) answers 정규화 "1=5 2=4 ..."
    let answersStr = "";
    if (typeof src.answers === "string") {
      answersStr = src.answers.replace(/\s+/g, " ").trim();
    } else if (Array.isArray(src.answers)) {
      answersStr = src.answers.map((v, i) => `${i + 1}=${v}`).join(" ");
    } else if (src.answers && typeof src.answers === "object") {
      answersStr = Object.entries(src.answers)
        .filter(([k, v]) => /^\d+$/.test(String(k)) && v != null && v !== "")
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");
    }
    answersStr = answersStr.replace(/\s+/g, " ").trim();

    // expected 개수로 재구성
    if (typeof expected === "number" && expected > 0) {
      const toks = answersStr ? answersStr.split(" ") : [];
      const map = new Map();
      for (const t of toks) {
        const m = t.match(/^(\d+)=([1-7])$/);
        if (m) map.set(Number(m[1]), m[2]);
      }
      const rebuilt = [];
      for (let i = 1; i <= expected; i++) {
        const val = map.get(i) || "4";
        rebuilt.push(`${i}=${val}`);
      }
      answersStr = rebuilt.join(" ");
    }

    const base = {
      apikey: API_KEY,
      qestrnSeq,
      trgetSe: trgetCandidates[0] || "100207",
      gender,
      grade,
      startDtm,
      answers: answersStr,
      ...(name ? { name } : {}),
      ...(school ? { school } : {}),
    };

    const tryOnce = async (payload, asJson = false) => {
      if (asJson) {
        return axios.post(
          "https://www.career.go.kr/inspct/openapi/test/report",
          payload,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              "User-Agent": "Mozilla/5.0",
              Referer: "https://www.career.go.kr/",
            },
            timeout: 20000,
            validateStatus: () => true,
          }
        );
      } else {
        const form = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
        return axios.post(
          "https://www.career.go.kr/inspct/openapi/test/report",
          form.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              "User-Agent": "Mozilla/5.0",
              Referer: "https://www.career.go.kr/",
            },
            timeout: 20000,
            validateStatus: () => true,
          }
        );
      }
    };

    let lastError = null;
    for (const t of trgetCandidates) {
      const payload = { ...base, trgetSe: t };

      // form 먼저
      let resp = await tryOnce(payload, false);
      if (resp.status === 415) {
        // 415면 JSON로 즉시 재시도
        resp = await tryOnce(payload, true);
      }

      if (resp.status >= 200 && resp.status < 300) {
        return res.json(resp.data);
      }

      // 4xx/5xx면 JSON 방식으로 한 번 더
      const resp2 = await tryOnce(payload, true);
      if (resp2.status >= 200 && resp2.status < 300) {
        return res.json(resp2.data);
      }

      lastError = { t, status1: resp.status, status2: resp2.status, data1: resp.data, data2: resp2.data };
    }

    return res.status(500).json({
      error: "Aptitude submit failed",
      detail: lastError || "unknown",
    });
  } catch (e) {
    return res.status(e?.response?.status || 500).json({
      error: "Aptitude submit failed",
      detail: e?.response?.data || e.message,
    });
  }
});

// (선택) 프론트가 POST /api/questions 로 제출하면 이것도 허용
router.post("/api/questions", (req, res, next) => {
  req.url = "/api/aptitude/submit";  // 내부 재라우팅
  next();
});

// v1 결과 조회(seq)
router.get("/api/aptitude/report/:seq", async (req, res) => {
  try {
    const { seq } = req.params;
    const { data } = await api.get("/inspct/openapi/report", {
      params: { apikey: API_KEY, seq },
      headers: { Accept: "application/json" },
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Aptitude report fetch failed",
      detail: err.response?.data || err.message,
    });
  }
});

/* -------------------
   흥미검사 (v2)
------------------- */

// v2 문항 조회 (번호 범위 필터: ?q=34&min=1&max=120)
router.get("/api/interest/questions", async (req, res) => {
  try {
    const q = req.query.q || "34";
    const min = req.query.min ? Number(req.query.min) : null;
    const max = req.query.max ? Number(req.query.max) : null;

    const { data } = await api.get("/inspct/openapi/v2/test", {
      params: { apikey: API_KEY, q },
      headers: { Accept: "application/json" },
    });

    const questions = Array.isArray(data?.result?.questions)
      ? data.result.questions
      : Array.isArray(data?.RESULT)
      ? data.RESULT
      : null;

    if (!Array.isArray(questions)) return res.json(data);

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

    if (data?.result?.questions) {
      return res.json({ ...data, result: { ...data.result, questions: filtered } });
    } else if (Array.isArray(data?.RESULT)) {
      return res.json({ ...data, RESULT: filtered });
    } else {
      return res.json({ result: { questions: filtered } });
    }
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Interest questions fetch failed",
      detail: err.response?.data || err.message,
    });
  }
});

// v2 제출 — 로컬(proxy-server.js) 성공 케이스에 최대한 맞춘 최소 헤더/키 + 업스트림 문항세트 동기화 + 초과/누락 친절 진단
router.post("/api/interest/submit", async (req, res) => {
  try {
    // 0) body 파싱 안전
    let src = req.body ?? {};
    if (typeof src === "string") { try { src = JSON.parse(src); } catch(_){} }

    // 1) answers 어디에 있어도 뽑기
    const deepFindAnswers = (node, depth = 0) => {
      if (!node || typeof node !== "object" || depth > 6) return null;
      if (Array.isArray(node) && node.length) {
        const f = node[0];
        if (f && typeof f === "object" && !Array.isArray(f)) {
          const nk = "no" in f ? "no" : ("qno" in f ? "qno" : ("id" in f ? "id" : ("qitemNo" in f ? "qitemNo" : null)));
          const vk = "val" in f ? "val" : ("value" in f ? "value" : ("answer" in f ? "answer" : ("score" in f ? "score" : ("selected" in f ? "selected" : null))));
          if (nk && vk) return node.map(it => ({ no: String(it[nk]), val: String(it[vk]) }));
        }
        if (typeof f === "string" && /^\d+\s*=\s*\d+$/.test(f)) {
          return node.map(t => String(t).trim().match(/^(\d+)\s*=\s*(\d+)$/))
                     .filter(Boolean).map(m => ({ no: m[1], val: m[2] }));
        }
        if (Array.isArray(f) && f.length >= 2) {
          return node.filter(x => Array.isArray(x) && x.length >= 2 && x[0]!=null && x[1]!=null)
                     .map(([n,v]) => ({ no:String(n), val:String(v) }));
        }
      }
      if (typeof node === "string" && /\d+\s*=\s*\d+/.test(node)) {
        return node.trim().split(/\s+/).map(t => t.match(/^(\d+)\s*=\s*(\d+)$/))
                  .filter(Boolean).map(m => ({ no: m[1], val: m[2] }));
      }
      if (typeof node === "object") {
        const numeric = Object.keys(node).filter(k => /^\d+$/.test(k));
        if (numeric.length) {
          return numeric.sort((a,b)=>+a-+b).map(k => ({ no:k, val:String(node[k]) })).filter(x=>x.val!=="");
        }
        for (const k of Object.keys(node)) { if (/^answers?$/i.test(k)) {
          const f = deepFindAnswers(node[k], depth+1); if (f && f.length) return f; } }
        for (const v of Object.values(node)) { const f = deepFindAnswers(v, depth+1); if (f && f.length) return f; }
      }
      return null;
    };
    const raw = deepFindAnswers(src.answers) || deepFindAnswers(src) || [];
    if (!raw.length) return res.status(400).json({ error: "answers_required" });

    // 2) Map 정규화(마지막 값 우선)
    const bag = new Map(raw.map(({no,val}) => [String(no), String(val)]));

    // 3) 업스트림에서 실제 문항세트 조회(추정 금지)
    const qno = String(src.qno ?? "34");
    const { data: qdata, status: qstat } = await axios.get("https://www.career.go.kr/inspct/openapi/v2/test", {
      params: { apikey: process.env.API_KEY, q: qno },
      headers: { Accept: "application/json" },
      timeout: 15000,
      validateStatus: () => true,
    });
    const upstreamQs = Array.isArray(qdata?.result?.questions) ? qdata.result.questions
                      : Array.isArray(qdata?.RESULT) ? qdata.RESULT : [];
    if (!upstreamQs.length) {
      return res.status(502).json({ error: "upstream_questions_unavailable", upstreamStatus: qstat, upstreamBody: qdata });
    }

    // 4) 요구 번호 집합 생성 + 130/131 규칙 반영
    const required = new Set(
      upstreamQs.map(q => Number(q?.no ?? q?.qno ?? q?.id ?? 0))
                .filter(n => Number.isFinite(n) && n>0)
                .map(String)
    );
    const decMajor = bag.get("130");
    if (decMajor !== "1") required.delete("131");

    // 5) 값 보정(로컬에서 성공했던 최소 규칙만 적용)
    // 132/133: "-" → "아직 결정 못함", 숫자코드 → 라벨
    const JOBS = ["가수","간호사","경영컨설턴트","경찰관","공무원","관세사","괴롭힘방지조언사","교사","교육학연구원","국제개발협력전문가","군인","금융자산운용가","기업고위임원/CEO","네이미스트","노년플래너","노무사","대체에너지개발연구원","도선사","동물보호보안관","로봇연구원","로봇윤리학자","모델","무인항공시스템·드론개발자","방송연출가","법무사","뷰티디자이너","비행기조종사","빅데이터전문가","사서","사진작가","사회단체활동가","사회복지사","상담전문가","생명공학연구원","소방관","수의사","스포츠감독","스포츠심리상담사","승무원","신약개발연구원","연기자","연주가","운동경기심판","운동선수","음반기획자","응급구조사","인테리어디자이너","제품디자이너","천문학연구원","촬영기사","출판편집자","캐스팅디렉터","컴퓨터그래픽디자이너","크라우드펀딩전문가","판사","항공교통관제사","항공기선박조립검사원","항공기정비원","환경컨설턴트","회계사","기타( )","아직 결정 못함"];
    const toJob = (v) => {
      const s = String(v||"");
      if (s==="-"||s==="—"||s==="") return "아직 결정 못함";
      if (/^\d+$/.test(s)) { const i=+s; if (i>=1 && i<=62) return JOBS[i-1]||"아직 결정 못함"; }
      return s;
    };
    if (bag.has("132")) bag.set("132", toJob(bag.get("132")));
    if (bag.has("133")) bag.set("133", toJob(bag.get("133")));

    // 134/135: 코드 단일값이면 라벨로(이미 "A,B"면 유지)
    const SUBJECTS = ["국어","사회","도덕","수학","과학","기술·가정","정보","체육","음악","미술","연극","영어","제2외국어","한문","교양","창의적 체험활동","기타"];
    const toSubj = (v) => {
      const s = String(v||"");
      if (s.includes(",")) return s;
      if (/^\d+$/.test(s)) { const i=+s; if (i>=1 && i<=SUBJECTS.length) return SUBJECTS[i-1]; }
      return s;
    };
    if (bag.has("134")) bag.set("134", toSubj(bag.get("134")));
    if (bag.has("135")) bag.set("135", toSubj(bag.get("135")));

    // 6) 요구 외 번호는 제거, 요구인데 없는 번호는 400으로 친절 리턴
    const missing = [];
    for (const no of required) if (!bag.has(no)) missing.push(+no);
    if (missing.length) {
      return res.status(400).json({
        error: "missing_required_questions",
        detail: { missing: missing.sort((a,b)=>a-b).slice(0,80), required_count: required.size }
      });
    }
    for (const k of Array.from(bag.keys())) if (!required.has(k)) bag.delete(k);

    // 7) 최종 answers 정렬
    const answers = Array.from(bag.entries()).map(([no,val])=>({ no:String(no), val:String(val) }))
                       .sort((a,b)=>+a.no-+b.no);

    // 8) 업스트림 바디 — 로컬 성공 버전과 동일한 **소문자 키만** 사용
    const body = {
      apikey: process.env.API_KEY,
      qno: String(qno),                 // 로컬과 동일: 문자열
      trgetse: String(src.trgetse ?? src.trgetSe ?? "100207"),
      gender: String(src.gender ?? "100323"),
      grade: String(src.grade ?? "2"),
      school: String(src.school ?? ""),
      startdtm: Number(src.startdtm ?? src.startDtm ?? Date.now()),
      answers,
    };
    if (!body.apikey) return res.status(400).json({ error: "missing_api_key" });

    // 9) 업스트림 전송 — 로컬이랑 동일한 **최소 헤더**만
    const resp = await axios.post(
      "https://www.career.go.kr/inspct/openapi/v2/report",
      JSON.stringify(body),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 15000,
        validateStatus: () => true,
        transformRequest: [(d)=>d],
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      return res.json(resp.data);
    }

    // 10) 실패 시, 원인 파악을 위해 우리가 보낸 요약 + 업스트림 그대로 전달
    const diag = {
      upstreamStatus: resp.status,
      upstreamBody: resp.data,
      requestSummary: {
        qno: body.qno,
        trgetse: body.trgetse,
        answersCount: answers.length,
        first10: answers.slice(0,10),
        last10: answers.slice(-10),
        minNo: Math.min(...answers.map(a=>+a.no)),
        maxNo: Math.max(...answers.map(a=>+a.no)),
        has131: answers.some(a=>a.no==="131"),
        decMajor,
        requiredCount: required.size,
      }
    };
    return res.status(resp.status || 500).json({ error: "Interest submit failed", detail: diag });
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      error: "Interest submit failed",
      detail: err.response?.data || err.message,
    });
  }
});

/* 마운트: 로컬 dev와 Netlify Functions 경로 모두 지원 */
app.use("/", router);
app.use("/.netlify/functions/proxy", router);

// 서버리스 export
module.exports.handler = serverless(app);
