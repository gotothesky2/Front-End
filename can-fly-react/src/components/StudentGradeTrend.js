// src/components/StudentGradeTrend.js
import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const subjects = ['국어', '수학', '영어', '사회', '과학'];
const tabs     = [...subjects, '전교과'];
const terms    = [
  '1학년 1학기',
  '1학년 2학기',
  '2학년 1학기',
  '2학년 2학기',
  '3학년 1학기',
  '3학년 2학기'
];

// ⬇️ termData가 안 넘어와도 안전하게 동작하도록 기본값 {}
export default function StudentGradeTrend({ termData = {} }) {
  const [selectedTab, setSelectedTab] = useState('전교과');

  const dataPoints = useMemo(() => {
    return terms.map(term => {
      // ⬇️ 안전 접근 (+ 배열형만 사용)
      const rows = Array.isArray(termData?.[term]) ? termData[term] : [];

      if (selectedTab === '전교과') {
        const vals = subjects.map(subj => {
          const hit = rows.filter(r => r.subjectCategory === subj);
          if (!hit.length) return 0;
          const avg =
            hit.reduce((sum, r) => sum + Number(r.rank || 0), 0) / hit.length;
          return Number.isFinite(avg) ? avg : 0;
        });
        const overall =
          vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
        return Math.round((Number.isFinite(overall) ? overall : 0) * 10) / 10;
      } else {
        const hit = rows.filter(r => r.subjectCategory === selectedTab);
        if (!hit.length) return 0;
        const avg =
          hit.reduce((sum, r) => sum + Number(r.rank || 0), 0) / hit.length;
        const n = Number.isFinite(avg) ? avg : 0;
        return Math.round(n * 10) / 10;
      }
    });
  }, [termData, selectedTab]);

  const chartData = {
    labels: terms,
    datasets: [
      {
        data: dataPoints,
        borderColor: '#03178C',
        pointBackgroundColor: '#03178C',
        tension: 0.4,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}` } }
    }
  };

  return (
    <div className="grade-trend-section">
      {/* 1) 헤더 */}
      <div className="grade-chart-header">
        <span className="grade-chart-tab">학년별 교과 추이</span>
        <div className="grade-chart-underline" />
      </div>

      {/* 2) 컨테이너 */}
      <div className="grade-trend-container">
        <div className="grade-trend-chart">
          <Line data={chartData} options={options} />
        </div>

        {/* 3) 탭 */}
        <div className="grade-trend-tabs">
          {tabs.map(tab => (
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




