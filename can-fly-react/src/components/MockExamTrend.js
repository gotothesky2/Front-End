// 모의고사 성적 추이(표준점수)
import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import ai from '../api/aiApi';
import config from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// ⬇️ 과목 탭(디자인 유지)
const subjects = ['국어', '수학', '탐구1', '탐구2'];
const tabs     = [...subjects];

// 점수 라벨 플러그인(이 차트에서만 사용)
const scoreLabelPlugin = {
  id: 'scoreLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const ds = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    if (!ds || !meta) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '12px sans-serif';

    meta.data.forEach((pt, i) => {
      const val = ds.data[i];
      if (val == null || isNaN(val)) return;
      const { x, y } = pt.getProps(['x', 'y'], true);
      const label = `${Math.round(val)}점`; // ← “점”으로 표기
      ctx.fillText(label, x, y - 8);
    });

    ctx.restore();
  }
};


// ⬇️ 고정 라벨(디자인 유지)
const terms = [
  '1학년 6월',
  '1학년 9월',
  '2학년 6월',
  '2학년 9월',
  '3학년 6월',
  '3학년 9월',
];

// 내부키 매핑
const mapSubjectToKey = {
  '국어':   'korean',
  '수학':   'math',
  '탐구1':  'explore1',
  '탐구2':  'explore2',
};

// ---[ 유틸: 응답 → result 배열 뽑기 ]---
function extractResultArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.result)) return payload.result;

  // 혹시 다른 키로 올 때 대비
  const candidates = [
    payload.data, payload.items, payload.list, payload.results, payload.records,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;

  return [];
}

// ---[ 유틸: score item → 우리 키 결정 ]---
// 국어/수학만 명시적으로 매핑, 그 외는 탐구로 보되 영어/한국사/제2외국어는 제외
function scoreItemToKey(item) {
  const name = String(item?.name ?? '').replace(/\s+/g, '');
  const cat  = item?.category;

  if (name.includes('국어')) return 'korean';
  if (name.includes('수학')) return 'math';

  // 제외: 영어/한국사/제2외국어
  if (name.includes('영어')) return null;
  if (name.includes('한국사')) return null;
  // 제2외국어(예: 프랑스어Ⅰ)는 카테고리 7로 온다고 하셨으니 제외
  if (cat === 7) return null;

  // 과탐/사탐 등은 탐구로 취급
  return 'explore';
}

// 기존 toTermLabel 를 아래로 교체
function toTermLabel(examGrade, examMonth) {
  const g = Number(examGrade);
  const m = Number(examMonth);

  if (![1, 2, 3].includes(g)) return null;
  if (m === 6) return `${g}학년 6월`;
  if (m === 9) return `${g}학년 9월`;

  // ⬇️ 3학년 11월 포함, 그 외 월은 어디에도 스냅하지 않고 버린다
  return null;
}

// ---[ 정규화: ALL_DETAIL 응답 → 차트용 형태 ]---
// 반환: { '1학년 6월': { korean:{standardScore}, math:{...}, explore1:{...}, explore2:{...} }, ... }
function normalizeAllDetailToStdScoreShape(allDetailPayload) {
  const exams = extractResultArray(allDetailPayload);

  // 모든 term 빈 슬롯
  const base = {};
  terms.forEach(t => {
    base[t] = { korean:{}, math:{}, explore1:{}, explore2:{} };
  });

  exams.forEach(exam => {
    const termLabel = toTermLabel(exam?.examGrade, exam?.examMonth);
    if (!termLabel || !base[termLabel]) return;

    // 탐구 채우기용 슬롯
    let filledExplore1 = Boolean(base[termLabel].explore1.standardScore);
    let filledExplore2 = Boolean(base[termLabel].explore2.standardScore);

    (exam?.scoreList ?? []).forEach(s => {
      const key = scoreItemToKey(s);
      const std = parseFloat(s?.standardScore);

      if (!Number.isFinite(std)) return; // null 등은 스킵
      if (key === 'korean') {
        base[termLabel].korean.standardScore = std;
      } else if (key === 'math') {
        base[termLabel].math.standardScore = std;
      } else if (key === 'explore') {
        // 탐구1 → 탐구2 순서로 채움
        if (!filledExplore1) {
          base[termLabel].explore1.standardScore = std;
          filledExplore1 = true;
        } else if (!filledExplore2) {
          base[termLabel].explore2.standardScore = std;
          filledExplore2 = true;
        }
      }
    });
  });

  return base;
}

// 단일 term/subject의 표준점수 (숫자 보장)
function getStdScore(data, term, subjName) {
  const termKey = data?.[term];
  if (!termKey) return 0;
  const row = termKey?.[mapSubjectToKey[subjName]];
  const raw =
    row?.standardScore ??
    row?.stdScore ??
    row?.standard ??
    row?.scoreStd ??
    row?.score;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : 0;
}

export default function MockExamTrend() {
  const [selectedTab, setSelectedTab] = useState('국어');
  const [stdData, setStdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let mounted = true;

    async function fetchAllDetail() {
      try {
        setLoading(true);
        setError('');
        const { MOCK } = config;
        const url = MOCK?.ALL_DETAIL;
        const res = await ai.get(url);
        // res.data = { isSuccess, code, message, result: [...] }
        const normalized = normalizeAllDetailToStdScoreShape(res?.data ?? res);
        if (mounted) setStdData(normalized);
      } catch (e) {
        console.error('전체 모의고사 조회 실패:', e);
        if (mounted) setError('모의고사 데이터를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAllDetail();
    return () => { mounted = false; };
  }, []);

  // 차트 y값
  const dataPoints = useMemo(() => {
    return terms.map(term => getStdScore(stdData, term, selectedTab));
  }, [stdData, selectedTab]);

  const chartData = {
    labels: terms,
    datasets: [
      {
        data: dataPoints,
        borderColor: '#03178C',
        pointBackgroundColor: '#03178C',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 150,
        ticks: { stepSize: 10, callback: (v) => `${v}` },
        grid: { color: '#eee' },
      },
      x: { grid: { display: false } },
    },
    plugins: {
      DataLabelPlugin:false,
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}점`,
        },
      },
          // 전역 라벨 플러그인들이 있었다면 이 차트에서만 비활성화
    datalabels: { display: false },
    valueLabelPlugin: false,
    percentLabelPlugin: false,
    },
  };

  return (
    <div className="grade-trend-section">
      <div className="grade-chart-header">
        <span className="grade-chart-tab">모의고사 추이(표준점수)</span>
        <div className="grade-chart-underline" />
      </div>

      <div className="grade-trend-container">
        <div className="grade-trend-chart">
          {loading ? (
            <div className="grade-trend-loading">불러오는 중…</div>
          ) : error ? (
            <div className="grade-trend-error">{error}</div>
          ) : (
            <Line data={chartData} options={options} plugins={[scoreLabelPlugin]}/>
          )}
        </div>

        <div className="grade-trend-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`grade-trend-tab${tab === selectedTab ? ' active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


