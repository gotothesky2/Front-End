import React, { useEffect, useMemo, useState } from 'react';
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

import { fetchAptitudeById, toSkillScoreList } from '../../services/aptitude';

// 라벨 플러그인: x값(점수)만 숫자로 출력
const scatterLabelPlugin = {
  id: 'scatterLabelPlugin',
  afterDraw(chart) {
    if (chart.config.type !== 'scatter') return;
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0].data;

    meta.data.forEach((point, idx) => {
      const xVal = Number(values[idx]?.x ?? 0);
      const { x, y } = point.getProps(['x', 'y'], true);
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

ChartJS.register(LinearScale, CategoryScale, PointElement, Tooltip, Legend);

export default function ReportScatter({ cstId }) {
  const [rows, setRows] = useState([]); // [{skill, score}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    // 개발 중 cstId가 없으면 더미로 모양만 확인(완성 후 제거 가능)
    if (!cstId) {
      setRows([
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
        { skill: '예술시각능력',  score: 19.9 },
      ]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetchAptitudeById(cstId); // GET /cst/:id
        setRows(toSkillScoreList(res));
      } catch (e) {
        setErr(e?.response?.data?.message || '흥미검사 결과 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [cstId]);

  const data = useMemo(() => ({
    datasets: [{
      label: '능력 점수',
      data: rows.map(d => ({ x: d.score, y: d.skill })), // x=숫자, y=문자열
      backgroundColor: '#0339A6',
      pointRadius: 6,
    }],
  }), [rows]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 30, left: 10, right: 10 } },
    scales: {
      x: {
        type: 'linear',
        min: 0, max: 100,
        title: { display: true, text: 'Score', font: { size: 14 } },
        ticks: { stepSize: 20, font: { size: 12 } },
        grid: { color: '#eee', drawBorder: false },
      },
      y: {
        type: 'category',
        labels: rows.map(d => d.skill),
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
      }
    }
  }), [rows]);

  if (loading) return <div className="reportscatter-wrapper">능력 점수 불러오는 중...</div>;
  if (err) return <div className="reportscatter-wrapper" style={{ color: '#c00' }}>{err}</div>;

  return (
    <div className="reportscatter-wrapper">
      <Scatter data={data} options={options} plugins={[scatterLabelPlugin]} />
    </div>
  );
}











