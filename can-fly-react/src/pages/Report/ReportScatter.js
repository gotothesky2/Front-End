// src/pages/Report/ReportScatter.js
import React, { useEffect, useMemo, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, LinearScale, CategoryScale, PointElement, Tooltip, Legend,
} from 'chart.js';
import '../../styles/ReportScatter.css';
import { aiGet } from '../../api/aiApi';
import AIconfig from '../../api/AIconfig';

const scatterLabelPlugin = {
  id: 'scatterLabelPlugin',
  afterDatasetsDraw(chart) {
    try {
      if (!chart || chart.config?.type !== 'scatter') return;
      const ctx = chart.ctx;
      const ds0 = chart.data?.datasets?.[0];
      const meta = chart.getDatasetMeta ? chart.getDatasetMeta(0) : null;
      if (!ctx || !ds0 || !meta?.data?.length) return;

      meta.data.forEach((point, idx) => {
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
    } catch {
      /* no-op */
    }
  }
};

ChartJS.register(LinearScale, CategoryScale, PointElement, Tooltip, Legend);

// API 응답 → 스킬/점수 리스트로 변환
function toSkillScoreListFromApi(d) {
  // 0~1 스케일이면 퍼센트로 보정
  const values = [
    d?.mathScore, d?.spaceScore, d?.creativeScore, d?.natureScore, d?.artScore,
    d?.musicScore, d?.langScore, d?.selfScore, d?.handScore, d?.relationScore, d?.physicalScore
  ].map(v => Number(v ?? 0));
  const maxVal = Math.max(...values);
  const scale = (maxVal > 0 && maxVal <= 1) ? 100 : 1;

  const norm = (v) => +((Number(v ?? 0) * scale)).toFixed(1);

  return [
    { skill: '수리',     score: norm(d?.mathScore) },
    { skill: '공간',     score: norm(d?.spaceScore) },
    { skill: '창의',     score: norm(d?.creativeScore) },
    { skill: '자연',     score: norm(d?.natureScore) },
    { skill: '예술',     score: norm(d?.artScore) },
    { skill: '음악',     score: norm(d?.musicScore) },
    { skill: '언어',     score: norm(d?.langScore) },
    { skill: '자기이해', score: norm(d?.selfScore) },
    { skill: '손재능',   score: norm(d?.handScore) },
    { skill: '대인',     score: norm(d?.relationScore) },
    { skill: '신체',     score: norm(d?.physicalScore) },
  ];
}

export default function ReportScatter({ cstId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!cstId) { setRows([]); setLoading(false); return; }

    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr('');

        // ★ AIconfig.APTITUDE.CHECK_CST 사용 (예: '/cst/:id')
        const url = AIconfig.APTITUDE.CHECK_CST.replace(':id', String(cstId));
        const res = await aiGet(url, { signal: controller.signal });
        // 정규화: { success, data:{...} } | { data:{...} } | {...}
        const payload = res?.data?.data ?? res?.data ?? res;

        setRows(toSkillScoreListFromApi(payload));
      } catch (e) {
        setErr(e?.response?.data?.message || '적성검사 결과 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
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
  if (!cstId) return <div className="reportscatter-wrapper">적성검사 데이터 없음</div>;

  return (
    <div className="reportscatter-wrapper">
      <Scatter data={data} options={options} plugins={[scatterLabelPlugin]} />
    </div>
  );
}













