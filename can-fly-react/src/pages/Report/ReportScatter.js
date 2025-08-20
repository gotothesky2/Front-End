// src/pages/Report/ReportScatter.js (핵심만)
import React, { useEffect, useMemo, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, LinearScale, CategoryScale, PointElement, Tooltip, Legend,
} from 'chart.js';
import '../../styles/ReportScatter.css';
import { fetchAptitudeById, toSkillScoreList } from '../../services/aptitude';

 const scatterLabelPlugin = {
   id: 'scatterLabelPlugin',
   // 언마운트 타이밍에 좀 더 안전한 훅
   afterDatasetsDraw(chart) {
     try {
       if (!chart || chart.config?.type !== 'scatter') return;
       const ctx = chart.ctx;
      const ds0 = chart.data?.datasets?.[0];
       const meta = chart.getDatasetMeta ? chart.getDatasetMeta(0) : null;
       if (!ctx || !ds0 || !meta?.data?.length) return;

       meta.data.forEach((point, idx) => {
         // point 또는 getProps가 사라졌을 수 있음
         if (!point || typeof point.getProps !== 'function') return;
         const v = ds0.data?.[idx];
         const xVal = Number(v?.x ?? 0);
         const props = point.getProps?.(['x', 'y'], true);
         if (!props) return;
         const { x, y } = props;
         if (!isFinite(x) || !isFinite(y)) return;

         ctx.save();
         ctx.font = '12px sans-serif';
         ctx.fillStyle = '#333';
         ctx.textAlign = 'left';
         ctx.textBaseline = 'middle';
        ctx.fillText(`${isFinite(xVal) ? xVal.toFixed(1) : '0.0'}%`, x + 6, y);
         ctx.restore();
       });
     } catch (e) {
       // 언마운트 중 race condition 방지: 조용히 무시
     }
   }
 };

ChartJS.register(LinearScale, CategoryScale, PointElement, Tooltip, Legend);

export default function ReportScatter({ cstId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!cstId) { setRows([]); setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await fetchAptitudeById(cstId);   // { mathScore, ... }
        setRows(toSkillScoreList(data));               // → [{ skill, score }]
      } catch (e) {
        setErr(e?.response?.data?.message || '적성검사 결과 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [cstId]);

  const data = useMemo(() => ({
    datasets: [{
      label: '능력 점수',
      data: rows.map(({ score, skill }) => ({ x: Number(score), y: String(skill) })),
      backgroundColor: '#0339A6',
      pointRadius: 6,
    }],
  }), [rows]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 30, left: 10, right: 10 } },
    animation: false,
    scales: {
      x: {
        type: 'linear', min: 0, max: 100,
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
      DataLabelPlugin: false,
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.y}: ${Number(ctx.raw.x).toFixed(1)}%`,
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












