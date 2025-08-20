// src/pages/Report/AptitudeRadar.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { fetchInterestById } from '../../services/interest';

// 데이터 라벨 플러그인
const DataLabelPlugin = {
  id: 'DataLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const ds = chart.data.datasets[0];
    if (!meta?.data || !ds?.data) return;
    meta.data.forEach((point, idx) => {
      if (!point || typeof point.getProps !== 'function') return;
      const val = `${ds.data[idx]}%`;
      const props = point.getProps?.(['x','y'], true);
      if (!props) return;
      const { x, y } = props;
      ctx.save();
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x, y - 10);
      ctx.restore();
    });
  },
};

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, DataLabelPlugin
);

const LABELS = ['R(현실형)','I(탐구형)','A(예술형)','S(사회형)','E(기업형)','C(관습형)'];
const ORDER  = ['R','I','A','S','E','C'];

// data 객체({ rScore, ... }) → R/I/A/S/E/C 배열
function toRiasecArray(data) {
  const map = {
    R: data?.rScore,
    I: data?.iScore,
    A: data?.aScore,
    S: data?.sScore,
    E: data?.eScore,
    C: data?.cScore,
  };
  let arr = ORDER.map(k => {
    const n = Number(map[k] ?? 0);
    return Number.isFinite(n) ? +n.toFixed(1) : 0;
  });
  const maxVal = Math.max(...arr);
  if (maxVal > 0 && maxVal <= 1) arr = arr.map(v => +(v * 100).toFixed(1));
  return arr;
}

export default function AptitudeRadar({ hmtId }) {
  const [scores, setScores] = useState([0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hmtId) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        setErr('');
        // ★ 여기서 CHECK_HMT 사용한 서비스 호출
        const data = await fetchInterestById(hmtId);
        setScores(toRiasecArray(data));
      } catch (e) {
        setErr(e?.response?.data?.message || '흥미검사 결과 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [hmtId]);

  const data = useMemo(() => ({
    labels: LABELS,
    datasets: [{
      label: '현재 검사',
      data: scores,
      backgroundColor: 'rgba(41, 41, 185, 0.7)',
      borderColor: 'rgb(41, 41, 185)',
      pointBackgroundColor: 'rgb(41, 41, 185)',
      pointBorderColor: '#fff',
      pointRadius: 5,
      borderWidth: 2,
      tension: 0.1,
    }]
  }), [scores]);

  const options = useMemo(() => ({
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, callback: (v)=> v + '%', color: '#666' },
        grid: { color: 'rgba(0,0,0,0.1)' },
        angleLines: { color: 'rgba(0,0,0,0.1)' },
        pointLabels: { color: '#555', font: { size: 14 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}%` } }
    }
  }), []);

  if (loading) return <div>레이더 차트 불러오는 중...</div>;
  if (err) return <div style={{ color: '#c00' }}>{err}</div>;
  return <Radar data={data} options={options} />;
}







