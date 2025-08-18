// src/pages/Report/ScoreTrend.js
import React, { useRef, useEffect, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../styles/ScoreTrend.css';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function ScoreTrend() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [mode, setMode] = useState('grade');
  const [subject, setSubject] = useState('국어');

  // 더미 데이터
  const gradeData = [
    { term: '1학년 6월', score: 75 },
    { term: '1학년 9월', score: 85 },
    { term: '2학년 6월', score: 78 },
    { term: '2학년 9월', score: 91 },
    { term: '3학년 6월', score: 97 },
    { term: '3학년 9월', score: 92 },
  ];
  const mockData = {
    국어: [
      { exam: '1학년 6월', pct: 85 },
      { exam: '1학년 9월', pct: 88 },
      { exam: '2학년 6월', pct: 90 },
      { exam: '2학년 9월', pct: 87 },
      { exam: '3학년 6월', pct: 92 },
      { exam: '3학년 9월', pct: 94 },
    ],
    수학: [
      { exam: '1학년 6월', pct: 50 },
      { exam: '1학년 9월', pct: 80 },
      { exam: '2학년 6월', pct: 9 },
      { exam: '2학년 9월', pct: 8 },
      { exam: '3학년 6월', pct: 15 },
      { exam: '3학년 9월', pct: 93 },
    ],
    영어: [
      { exam: '1학년 6월', pct: 81 },
      { exam: '1학년 9월', pct: 42 },
      { exam: '2학년 6월', pct: 13 },
      { exam: '2학년 9월', pct: 54 },
      { exam: '3학년 6월', pct: 34 },
      { exam: '3학년 9월', pct: 99 },
    ],
    탐구1: [
      { exam: '1학년 6월', pct: 20 },
      { exam: '1학년 9월', pct: 40 },
      { exam: '2학년 6월', pct: 60 },
      { exam: '2학년 9월', pct: 80 },
      { exam: '3학년 6월', pct: 90 },
      { exam: '3학년 9월', pct: 94 },
    ],
    탐구2: [
      { exam: '1학년 6월', pct: 30 },
      { exam: '1학년 9월', pct: 20 },
      { exam: '2학년 6월', pct: 10 },
      { exam: '2학년 9월', pct: 50 },
      { exam: '3학년 6월', pct: 30 },
      { exam: '3학년 9월', pct: 40 },
    ],
  };

  // ▼ 라벨에 붙일 접미사 선택
  //  - '%' 없애려면: const SUFFIX = '';
  //  - '점'을 붙이려면: const SUFFIX = '점';
  //  - 모드별로 다르게: 예) 학년별=점, 모의고사=없음
  const SUFFIX = '';

  // ▼ 이 차트 전용 라벨 플러그인 (전역 DataLabelPlugin 차단용)
  const pointValueLabels = {
    id: 'pointValueLabels',
    afterDatasetsDraw(chart) {
      try {
        const ds0 = chart.data?.datasets?.[0];
        const meta = chart.getDatasetMeta?.(0);
        const ctx = chart.ctx;
        if (!ds0 || !meta?.data?.length || !ctx) return;

        meta.data.forEach((pt, i) => {
          if (!pt || typeof pt.getProps !== 'function') return;
          const { x, y } = pt.getProps(['x', 'y']); // final=true 사용 안 함(언마운트 안전)
          if (!Number.isFinite(x) || !Number.isFinite(y)) return;

          const val = Number(ds0.data?.[i] ?? 0);
          ctx.save();
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${Number.isFinite(val) ? val : 0}${SUFFIX}`, x, y - 8);
          ctx.restore();
        });
      } catch {
        /* 언마운트 경합 시 조용히 무시 */
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvas.getContext('2d');

    const labels = mode === 'grade'
      ? gradeData.map(d => d.term)
      : mockData[subject].map(d => d.exam);

    const dataValues = mode === 'grade'
      ? gradeData.map(d => d.score)
      : mockData[subject].map(d => d.pct);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: mode === 'grade' ? '전교과 평균' : `${subject} 백분위`,
          data: dataValues,
          fill: false,
          borderColor: '#0339A6',
          pointBackgroundColor: '#0339A6',
          pointBorderColor: '#0339A6',
          tension: 0.4,
          pointRadius: 5,
          borderWidth: 2
        }]
      },
      plugins: [pointValueLabels], // ★ 로컬 라벨러 사용
      options: {
        responsive: true,
        animation: false,
        scales: { y: { min: 0, max: 100 } },
        plugins: {
          legend: { display: false },
          // ★ 전역 라벨 플러그인(레이더용) 무력화
          DataLabelPlugin: false,
          datalabels: false
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [mode, subject]); // SUFFIX는 mode로부터 계산되므로 별도 dep 필요 없음

  return (
    <div className="score-trend">
      <div className="score-trend__tabs">
        <button
          className={mode === 'grade' ? 'active' : ''}
          onClick={() => setMode('grade')}
        >
          학년별 교과 추이
        </button>
        <button
          className={mode === 'mock' ? 'active' : ''}
          onClick={() => setMode('mock')}
        >
          모의고사 추이(백분위)
        </button>
      </div>

      <canvas ref={canvasRef} />

      <div className="score-trend__subs">
        {mode === 'grade'
          ? <button className="active">전교과</button>
          : ['국어','수학','영어','탐구1','탐구2'].map(s => (
              <button
                key={s}
                className={subject === s ? 'active' : ''}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))
        }
      </div>
    </div>
  );
}


