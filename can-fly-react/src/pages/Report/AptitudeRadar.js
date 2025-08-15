// src/pages/Report/AptitudeRadar.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { fetchInterestById } from '../../services/interest';

// 1) 데이터 라벨 플러그인 (하나만 사용)
const DataLabelPlugin = {
  id: 'DataLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const ds = chart.data.datasets[0];
    if (!meta?.data || !ds?.data) return;

    meta.data.forEach((point, idx) => {
      const val = `${ds.data[idx]}%`;
      const { x, y } = point.getProps(['x', 'y'], true);
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
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  DataLabelPlugin
);

// 차트 라벨 고정(순서 중요)
const LABELS = ['R(현실형)','I(탐구형)','A(예술형)','S(사회형)','E(기업형)','C(관습형)'];
const ORDER  = ['R','I','A','S','E','C'];

// ▼ API 응답을 R/I/A/S/E/C 순 배열로 바꿔주는 함수
function toRiasecArray(apiResult) {
  // 스웨거 응답이 어떤 키로 오는지 아직 모르니, 여러 케이스 대비:
  const pick = (k) =>
    apiResult?.[k] ??
    apiResult?.riasec?.[k] ??
    apiResult?.scores?.[k] ??
    apiResult?.[k.toLowerCase()] ??
    apiResult?.[`${k}_score`] ??
    apiResult?.[`${k.toLowerCase()}_score`] ??
    apiResult?.['한글키가능' /* 필요 시 확장 */];

  let arr = ORDER.map((k) => Number(pick(k) ?? 0));

  // 만약 0~1 사이로 오면 0~100으로 변환
  const maxVal = Math.max(...arr);
  if (maxVal > 0 && maxVal <= 1) {
    arr = arr.map((v) => +(v * 100).toFixed(1));
  } else {
    arr = arr.map((v) => +Number(v).toFixed(1));
  }
  return arr;
}

export default function AptitudeRadar({ hmtId }) {
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    // hmtId가 아직 없다면(업로드 직후 생성 전 등) 로딩만 끄고 대기
    
    if (!hmtId) { setLoading(false); return; }

    (async () => {
      try {
        setLoading(true);
        setErr('');
        const result = await fetchInterestById(4);
        console.log('...',result);
        const arr = toRiasecArray(result);
        setScores(arr);
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
        ticks: {
          stepSize: 20,
          callback: (v) => v + '%',
          color: '#666'
        },
        grid: { color: 'rgba(0,0,0,0.1)' },
        angleLines: { color: 'rgba(0,0,0,0.1)' },
        pointLabels: { color: '#555', font: { size: 14 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}%`
        }
      }
    }
  }), []);

  if (loading) return <div>레이더 차트 불러오는 중...</div>;
  if (err) return <div style={{ color: '#c00' }}>{err}</div>;
  return <Radar data={data} options={options} />;
}





