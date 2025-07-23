// src/pages/Report/ReportScatter.js
import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/ReportScatter.css';

// ① scatter 전용 “숫자% 라벨” 플러그인
const scatterLabelPlugin = {
  id: 'scatterLabelPlugin',
  afterDraw(chart) {
    // scatter 차트가 아니면 스킵
    if (chart.config.type !== 'scatter') return;

    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0].data;

    meta.data.forEach((point, idx) => {
      // 반드시 x 값만 꺼내 사용
      const xVal = values[idx].x;
      const x = point.x;
      const y = point.y;

      ctx.save();
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${xVal}%`, x + 6, y);
      ctx.restore();
    });
  }
};

// ② 전역 등록: 스케일, 포인트, 툴팁, 범례만
ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend
);

const DUMMY_DATA = [
  { skill: '신체·운동능력', score: 3.2 },
  { skill: '손재능',        score: 3.2 },
  { skill: '공간지각력',    score: 47.2 },
  { skill: '음악능력',      score: 64.9 },
  { skill: '창의력',        score: 62.4 },
  { skill: '언어능력',      score: 62.3 },
  { skill: '수리·논리력',   score: 8.6 },
  { skill: '자기성찰능력',  score: 26.3 },
  { skill: '대인관계능력',  score: 50.8 },
  { skill: '자연친화력',    score: 48.2 },
  { skill: '예술시각능력',  score: 19.9   },
];

export default function ReportScatter() {
  const data = {
    datasets: [{
      label: '능력 점수',
      data: DUMMY_DATA.map(d => ({ x: d.score, y: d.skill })),
      backgroundColor: '#0339A6',
      pointRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    // ③ 위쪽(그리고 필요하면 좌/우) 여백 확보
    layout: {
      padding: {
        top: 30,
        left: 10,
        right: 10,
      }
    },

    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 100,
        title: { display: true, text: 'Score', font: { size: 14 } },
        ticks: { stepSize: 20, font: { size: 12 } },
        grid: { color: '#eee', drawBorder: false },
      },
      y: {
        type: 'category',
        labels: DUMMY_DATA.map(d => d.skill),
        title: { display: true, text: 'Skill', font: { size: 14 } },
        ticks: { font: { size: 12 } },
        grid: { color: '#eee', drawBorder: false },
      },
    },

    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            return `${ctx.raw.y}: ${ctx.raw.x}%`;
          }
        }
      },
      // ④ 오로지 이 플러그인만 켬
      scatterLabelPlugin: {}
    }
  };

  return (
    <div className="reportscatter-wrapper">
      <Scatter
        data={data}
        options={options}
        plugins={[scatterLabelPlugin]}
      />
    </div>
  );
}











