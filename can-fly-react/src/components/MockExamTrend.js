// src/components/MockExamTrend.js
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

// 과목 리스트 + 탭
const subjects = ['국어','수학','영어','탐구1','탐구2'];
const tabs     = [...subjects, '전교과'];
// 모의고사 term
const terms    = [
  '1학년 6월',
  '1학년 9월',
  '2학년 6월',
  '2학년 9월',
  '3학년 6월',
  '3학년 9월'
];

// subjects → rowKey 매핑
const mapSubjectToKey = {
  국어:  'korean',
  수학:  'math',
  영어:  'english',
  탐구1: 'explore1',
  탐구2: 'explore2'
};

// 단일 term/subject 의 백분위 (무조건 number 반환)
function getPercentile(data, term, subjName) {
  const termKey = data[term];
  if (!termKey) return 0;
  const row      = termKey[ mapSubjectToKey[subjName] ];
  const rawValue = row?.percentile;
  // 문자열 '' 또는 undefined/null 도 모두 0으로 처리
  const num = parseFloat(rawValue);
  return isNaN(num) ? 0 : num;
}

export default function MockExamTrend({ percentileData }) {
  const [selectedTab, setSelectedTab] = useState('전교과');

  // 차트에 들어갈 y값 배열
  const dataPoints = useMemo(() => {
    return terms.map(term => {
      if (selectedTab === '전교과') {
        // 전교과: 모든 과목 백분위 평균
        const vals = subjects.map(s => Number(getPercentile(percentileData, term, s)));
        return Number((vals.reduce((a,b)=>a+b,0) / vals.length).toFixed(1));
      } else {
        // 개별 과목
        return Number(getPercentile(percentileData, term, selectedTab).toFixed(1));
      }
    });
  }, [percentileData, selectedTab]);

  const chartData = {
    labels: terms,
    datasets: [{
      data: dataPoints,
      borderColor: '#03178C',
      pointBackgroundColor: '#03178C',
      tension: 0.4,
      fill: false
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: v => `${v}`  // 툴팁엔 % 붙임
        },
        grid: { color: '#eee' }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y}%`
        }
      }
    }
  };

  return (
    <div className="grade-trend-section">
      {/* 1) 헤더 */}
      <div className="grade-chart-header">
        <span className="grade-chart-tab">모의고사 추이(백분위)</span>
        <div className="grade-chart-underline" />
      </div>

      {/* 2) 차트 컨테이너 */}
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
