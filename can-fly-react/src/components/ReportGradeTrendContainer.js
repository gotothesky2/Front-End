// src/components/ReportGradeTrendContainer.js
import React, { useEffect, useState } from 'react';
import StudentGradeTrend from './StudentGradeTrend';
import ai from '../api/aiApi';
import config from '../config';

// 학기 라벨 고정
const TERMS = [
  '1학년 1학기','1학년 2학기',
  '2학년 1학기','2학년 2학기',
  '3학년 1학기','3학년 2학기',
];

// 백엔드 categoryName(숫자) → 5개 상위 과목군
const CODE_TO_SUBJ = { 0:'국어', 1:'수학', 2:'영어', 4:'사회', 5:'과학' };

// 응답에서 배열 추출
function extractList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.result)) return payload.result;
  const cands = [payload.data, payload.items, payload.list, payload.records, payload.rows];
  for (const c of cands) if (Array.isArray(c)) return c;
  return [];
}

// 과목명 문자열을 5개 상위 과목군으로 묶기
function groupFromSubjectName(name) {
  const t = String(name ?? '').replace(/\s+/g, '');
  if (!t) return null;

  // 국어 계열
  if (/(국어|화법과작문|독서|언어와매체)/.test(t)) return '국어';
  // 수학 계열
  if (/(수학|미적|기하|확률|통계|수학I|수학II)/.test(t)) return '수학';
  // 영어 계열
  if (/영어/.test(t)) return '영어';
  // 사회 계열
  if (/(사회|통합사회|한국사|세계사|세계지리|한국지리|경제|정치|법과정치|사회문화|생활과윤리|윤리와사상)/.test(t))
    return '사회';
  // 과학 계열
  if (/(과학|통합과학|물리|화학|생명|지구)/.test(t)) return '과학';

  return null;
}

// scoreList 항목에서 석차등급 숫자 꺼내기
function extractRankFromScore(scoreItem) {
  // 등급 필드가 grade 로 옴 (예: 1~9)
  const cand = [
    scoreItem.grade,
    scoreItem.rank,
    scoreItem.rankGrade,
    scoreItem.level,
    scoreItem.rankScore,
  ];
  for (const v of cand) {
    if (v == null) continue;
    const num = parseFloat(String(v).replace(/[^\d.]/g, ''));
    if (Number.isFinite(num)) return num;
  }
  return null;
}

// 학년/학기 라벨 만들기
function makeTermLabel(userGrade, term) {
  const g = Number(userGrade);
  const s = Number(term);
  if (![1,2,3].includes(g) || ![1,2].includes(s)) return null;
  return `${g}학년 ${s}학기`;
}

// ALL_DETAIL_REPORT → termData 정규화
// termData: { '1학년 1학기': [{ subjectCategory:'국어', rank:2 }, ...], ... }
function normalizeGradeAllDetail(payload) {
  const blocks = extractList(payload);

  // 모든 학기 키 미리 준비
  const base = {};
  TERMS.forEach(t => (base[t] = []));

  blocks.forEach(block => {
    const termLabel = makeTermLabel(block?.userGrade, block?.term);
    if (!termLabel || !base[termLabel]) return;

    const cateCode = block?.categoryName; // 0/1/2/4/5

    (block?.scoreList ?? []).forEach(s => {
      // 1) 과목군 매핑: 세부 과목명 → 5개 군, 없으면 cateCode로 보정
      const byName = groupFromSubjectName(s?.subject);
      const subj = byName ?? (typeof cateCode === 'number' ? CODE_TO_SUBJ[cateCode] : null);
      if (!subj) return;

      // 2) 등급 추출
      const rank = extractRankFromScore(s);
      if (!Number.isFinite(rank)) return;

      base[termLabel].push({ subjectCategory: subj, rank });
    });
  });

  // 디버깅: 전부 비었을 때 샘플 찍기
  if (TERMS.every(t => (base[t] || []).length === 0)) {
    // eslint-disable-next-line no-console
    console.warn('[ReportGradeTrendContainer] 여전히 비어 있음. 샘플:', (blocks || []).slice(0, 5));
  }

  return base;
}

export default function ReportGradeTrendContainer() {
  const [termData, setTermData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError('');
        const { REPORT } = config;
        const url = REPORT?.ALL_DETAIL_REPORT; // ★ 여기 사용

        if (!url) throw new Error('config.REPORT.ALL_DETAIL_REPORT 미설정');

        const res = await ai.get(url);
        const normalized = normalizeGradeAllDetail(res?.data ?? res);
        if (mounted) setTermData(normalized);
      } catch (e) {
        console.error('전체 내신 조회 실패:', e);
        if (mounted) setError('내신 데이터를 불러오지 못했습니다.');
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="grade-trend-container">
        <div className="grade-trend-chart"><div className="grade-trend-error">{error}</div></div>
      </div>
    );
  }
  if (!termData) {
    return (
      <div className="grade-trend-container">
        <div className="grade-trend-chart"><div className="grade-trend-loading">불러오는 중…</div></div>
      </div>
    );
  }

  // StudentGradeTrend = 프레젠테이션 컴포넌트
  return <StudentGradeTrend termData={termData} />;
}


