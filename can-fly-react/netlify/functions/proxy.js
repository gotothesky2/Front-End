// netlify/functions/proxy.js — CareerNet proxy (Aptitude v1 + Interest v2) for Netlify Functions
const serverless = require("serverless-http");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const router = express.Router();

// ───────────────────────── Common Middlewares ─────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CareerNet API Key
const API_KEY = process.env.API_KEY;

// Debug
router.get("/api/_debug/env", (_req, res) => res.json({ hasApiKey: !!API_KEY }));
router.post("/api/_debug/echo", (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {}
  }
  res.json({ hasApiKey: !!API_KEY, body });
});

// Shared axios(GET)
const api = axios.create({
  baseURL: "https://www.career.go.kr",
  timeout: 15000,
});

// Health
router.get("/api/health", (_req, res) => res.send("ok"));

/* --------------------------------------------------------------------
   V1 적성검사
-------------------------------------------------------------------- */
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

router.post("/api/aptitude/submit", async (req, res) => {
  try {
    let src = req.body ?? {};
    if (typeof src === "string") { try { src = JSON.parse(src); } catch {} }

    const qestrnSeq = String(src.qestrnSeq || "21");
    let expected = null;
    try {
      const { data } = await axios.get("https://www.career.go.kr/inspct/openapi/test/questions", {
        params: { apikey: API_KEY, q: qestrnSeq },
        headers: { Accept: "application/json" },
        timeout: 15000,
      });
      expected = Array.isArray(data?.RESULT) ? data.RESULT.length : null;
    } catch {}

    const trgetCandidates = [
      String(src.trgetSe || ""),
      "100207", "100206", "100209",
    ].filter(Boolean);

    let gender = String(src.gender || "100323");
    if (/^f(emale)?$/i.test(gender)) gender = "100324";
    if (/^m(ale)?$/i.test(gender)) gender = "100323";

    const grade = String(src.grade || "2");
    const startDtm = Number(src.startDtm || Date.now());
    const name = src.name ? String(src.name) : undefined;
    const school = src.school ? String(src.school) : undefined;

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
      let resp = await tryOnce(payload, false);
      if (resp.status === 415) resp = await tryOnce(payload, true);

      if (resp.status >= 200 && resp.status < 300) return res.json(resp.data);

      const resp2 = await tryOnce(payload, true);
      if (resp2.status >= 200 && resp2.status < 300) return res.json(resp2.data);

      lastError = { t, status1: resp.status, status2: resp2.status, data1: resp.data, data2: resp2.data };
    }

    return res.status(500).json({ error: "Aptitude submit failed", detail: lastError || "unknown" });
  } catch (e) {
    return res.status(e?.response?.status || 500).json({
      error: "Aptitude submit failed",
      detail: e?.response?.data || e.message,
    });
  }
});

router.post("/api/questions", (req, res, next) => {
  req.url = "/api/aptitude/submit";
  next();
});

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

/* --------------------------------------------------------------------
   V2 흥미검사(H)
-------------------------------------------------------------------- */
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

router.post("/api/interest/submit", async (req, res) => {
  try {
    // 0) body parse
    let src = req.body ?? {};
    if (typeof src === "string") { try { src = JSON.parse(src); } catch {} }

    // 1) extract answers flexibly
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

    // 2) normalize to Map (last value wins)
    const bag = new Map(raw.map(({no,val}) => [String(no), String(val)]));

    // 3) fetch upstream question set for qno
    const qnoNum = Number(src.qno ?? 34); // ← 반드시 숫자
    const { data: qdata, status: qstat } = await axios.get(
      "https://www.career.go.kr/inspct/openapi/v2/test",
      {
        params: { apikey: process.env.API_KEY, q: qnoNum },
        headers: { Accept: "application/json" },
        timeout: 15000,
        validateStatus: () => true,
      }
    );
    const upstreamQs = Array.isArray(qdata?.result?.questions) ? qdata.result.questions
                      : Array.isArray(qdata?.RESULT) ? qdata.RESULT : [];
    if (!upstreamQs.length) {
      return res.status(502).json({ error: "upstream_questions_unavailable", upstreamStatus: qstat, upstreamBody: qdata });
    }

    // 4) required set (include 121~146 per spec)
    const required = new Set(
      upstreamQs.map(q => Number(q?.no ?? q?.qno ?? q?.id ?? 0))
                .filter(n => Number.isFinite(n) && n>0)
                .map(String)
    );

    // 130/131 rule: keep 131, inject "-" when undecided
    const decMajor = bag.get("130");
    if (!bag.has("131")) {
      if (decMajor === "2" || !decMajor) bag.set("131", "-");
    }

    // 5) value normalization per spec
    const JOBS = ["가수","간호사","경영컨설턴트","경찰관","공무원","관세사","괴롭힘방지조언사","교사","교육학연구원","국제개발협력전문가","군인","금융자산운용가","기업고위임원/CEO","네이미스트","노년플래너","노무사","대체에너지개발연구원","도선사","동물보호보안관","로봇연구원","로봇윤리학자","모델","무인항공시스템·드론개발자","방송연출가","법무사","뷰티디자이너","비행기조종사","빅데이터전문가","사서","사진작가","사회단체활동가","사회복지사","상담전문가","생명공학연구원","소방관","수의사","스포츠감독","스포츠심리상담사","승무원","신약개발연구원","연기자","연주가","운동경기심판","운동선수","음반기획자","응급구조사","인테리어디자이너","제품디자이너","천문학연구원","촬영기사","출판편집자","캐스팅디렉터","컴퓨터그래픽디자이너","크라우드펀딩전문가","판사","항공교통관제사","항공기선박조립검사원","항공기정비원","환경컨설턴트","회계사","기타( )","아직 결정 못함"];
    const toJob = (v) => {
      const s = String(v||"");
      if (s==="-"||s==="—"||s==="") return "아직 결정 못함";
      if (/^\d+$/.test(s)) { const i=+s; if (i>=1 && i<=62) return JOBS[i-1]||"아직 결정 못함"; }
      return s;
    };
    if (bag.has("132")) bag.set("132", toJob(bag.get("132")));
    if (bag.has("133")) bag.set("133", toJob(bag.get("133")));

    const SUBJECTS = ["국어","사회","도덕","수학","과학","기술·가정","정보","체육","음악","미술","연극","영어","제2외국어","한문","교양","창의적 체험활동","기타"];
    const toSubj = (v) => {
      const s = String(v||"");
      if (s.includes(",")) return s;
      if (/^\d+$/.test(s)) { const i=+s; if (i>=1 && i<=SUBJECTS.length) return SUBJECTS[i-1]; }
      return s;
    };
    if (bag.has("134")) bag.set("134", toSubj(bag.get("134")));
    if (bag.has("135")) bag.set("135", toSubj(bag.get("135")));

    // 6) ensure required coverage
    const missing = [];
    for (const no of required) if (!bag.has(no)) missing.push(+no);
    if (missing.length) {
      return res.status(400).json({
        error: "missing_required_questions",
        detail: { missing: missing.sort((a,b)=>a-b).slice(0,80), required_count: required.size }
      });
    }
    for (const k of Array.from(bag.keys())) if (!required.has(k)) bag.delete(k);

    // 7) final answers
    const answers = Array.from(bag.entries())
      .map(([no,val])=>({ no:String(no), val:String(val) }))
      .sort((a,b)=>+a.no-+b.no);

    // 8) Upstream body — ORDER & TYPES per spec
    const baseBody = {
      apikey: process.env.API_KEY,
      answers,                                        // 1) answers
      gender: String(src.gender ?? "100323"),         // 2) gender
      grade: String(src.grade ?? "2"),                // 3) grade
      qno: Number(qnoNum),                             // 4) qno as Number
      school: String(src.school ?? ""),               // 5) school
      startdtm: Number(src.startdtm ?? src.startDtm ?? Date.now()), // 6) startdtm
      trgetse: String(src.trgetse ?? src.trgetSe ?? "100207"),      // 7) trgetse
    };
    if (!baseBody.apikey) return res.status(400).json({ error: "missing_api_key" });

    const sendOnce = async (body) => {
      return axios.post(
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
    };

    // Try qno as provided (numeric). Optionally fallback to 33 numerically.
    const attempts = [
      { label: `qno=${baseBody.qno}`, body: { ...baseBody } },
      // { label: "qno=33", body: { ...baseBody, qno: 33 } }, // 필요 시 주석 해제
    ];

    let lastResp = null;
    for (const att of attempts) {
      const resp = await sendOnce(att.body);
      if (resp.status >= 200 && resp.status < 300 && (resp.data?.success === "Y" || resp.data?.result?.inspct)) {
        return res.json(resp.data);
      }
      lastResp = { att, resp };
    }

    const diag = {
      upstreamStatus: lastResp?.resp?.status,
      upstreamBody: lastResp?.resp?.data,
      requestSummary: {
        qnoTried: attempts.map(a => a.label),
        trgetse: baseBody.trgetse,
        answersCount: answers.length,
        first10: answers.slice(0,10),
        last10: answers.slice(-10),
        minNo: Math.min(...answers.map(a=>+a.no)),
        maxNo: Math.max(...answers.map(a=>+a.no)),
        has131: answers.some(a=>a.no==="131"),
        decMajor,
        requiredCount: required.size,
        slice129_136: answers.filter(a => +a.no >= 129 && +a.no <= 136),
      }
    };
    return res.status(lastResp?.resp?.status || 500).json({ error: "Interest submit failed", detail: diag });
  } catch (err) {
    return res.status(err?.response?.status || 500).json({
      error: "Interest submit failed",
      detail: err?.response?.data || err.message,
    });
  }
});

// Mount (local & Netlify)
app.use("/", router);
app.use("/.netlify/functions/proxy", router);

module.exports.handler = serverless(app);
