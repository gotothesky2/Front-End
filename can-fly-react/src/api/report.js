// src/api/report.js
// 내신성적 페이지임 이거
import ai from '../api/aiApi';
import config from '../config';
const { REPORT } = config;

/** "1학년 1학기" → { userGrade: 1..3, term: 1|2 } */
const parseTerm = (termStr) => {
  if (typeof termStr !== 'string') {
    throw new Error(`학기 문자열이 필요합니다. 받은 값: ${JSON.stringify(termStr)}`);
  }
  const g = termStr.match(/[1-3]/)?.[0];
  const s = termStr.match(/([1-2])학기/)?.[1];
  return { userGrade: g ? Number(g) : null, term: s ? Number(s) : null }; // term: 1 or 2
};

// 서버가 실제로 받는 categoryName 코드(숫자)
const CATEGORY_NAME_CODE = { '국어': 0, '수학': 1, '영어': 2, '사회': 4, '과학': 5 };
// 서버→화면 역매핑(조회용)
const CATEGORY_CODE_TO_LABEL = { 0: '국어', 1: '수학', 2: '영어', 4: '사회', 5: '과학' };

const n = (v) => (v === '' || v == null ? 0 : Number(v));
const t = (v) => (v == null ? '' : String(v));

/**
 * 저장: 교과별로 payload를 만들어 POST /users/grades/report (REPORT.REGISTER_REPORT)
 * - 서버 스펙: term = 1|2, categoryName = 숫자코드, scoreLists(복수)
 */
export async function registerReportScores(termStr, rows) {
  const { userGrade, term } = parseTerm(termStr);
  if (!userGrade || !term) throw new Error('학년/학기 파싱 실패');

  // 교과별 묶기
  const grouped = rows.reduce((acc, r) => {
    const key = r.subjectCategory || '기타';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  const results = [];

  for (const [label, list] of Object.entries(grouped)) {
    const categoryCode = CATEGORY_NAME_CODE[label];
    if (categoryCode === undefined) continue;

    const scoreLists = list
      .filter((r) => (r.subject || '').trim())
      .map((r) => ({
        subject: t(r.subject).trim(),
        grade: n(r.rank),
        studentNum: n(r.students),
        standardDeviation: n(r.deviation),
        subjectAverage: n(r.average),
        achievement: t(r.achievement),
        score: n(r.score),
        credit: n(r.credits),
      }));

    if (!scoreLists.length) continue;

    const payload = { userGrade, term, categoryName: categoryCode, scoreLists };

    console.log('[REGISTER_REPORT payload]', payload);

    const { data } = await ai.post(REPORT.REGISTER_REPORT, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    results.push(data);
  }

  return results;
}

/** 조회용 키 생성: 1학년 1학기 → "1학년 1학기" */
const makeTermKey = (userGrade, term) => `${userGrade}학년 ${term}학기`;

/**
 * 조회: 전체 내신 조회 API (REPORT.ALL_DETAIL_REPORT)
 * → StudentGrade 컴포넌트가 쓰는 termData 형태로 변환해서 반환
 */
export async function fetchAllDetailReportAsTermData() {
  const { data } = await ai.get(REPORT.ALL_DETAIL_REPORT, {
    headers: { Accept: 'application/json' },
    validateStatus: (s) => s < 500, // 4xx도 본문 읽기
  });

  // 응답이 단건/배열/페이지/래핑 등 다양한 경우를 방어적으로 처리
  const raw = data?.result ?? data;
  let reports = [];
  if (Array.isArray(raw)) {
    reports = raw;
  } else if (raw?.content && Array.isArray(raw.content)) {
    reports = raw.content;
  } else if (raw?.reports && Array.isArray(raw.reports)) {
    reports = raw.reports;
  } else if (raw?.userGrade && raw?.term) {
    reports = [raw];
  }

  const termData = {};

  for (const rep of reports) {
    if (!rep) continue;
    const key = makeTermKey(rep.userGrade, rep.term); // "1학년 1학기"
    const subjectCategory = CATEGORY_CODE_TO_LABEL[rep.categoryName] ?? '기타';
    const list = rep.scoreList || rep.scoreLists || [];

    const rows = list.map((s) => ({
      id: s.scoreId ?? `${rep.id}-${s.subject ?? ''}`,
      checked: false,
      courseType: '일반선택',
      subjectCategory,
      subject: s.subject ?? '',
      isCustom: false,
      credits: s.credit ?? '',
      rank: s.grade ?? '',
      score: s.score ?? '',
      average: s.subjectAverage ?? '',
      deviation: s.standardDeviation ?? '',
      students: s.studentNum ?? '',
      achievement: s.achievement ?? '',
    }));

    if (rows.length) {
      termData[key] = (termData[key] || []).concat(rows);
    }
  }

  return termData;
}






