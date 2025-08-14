// src/components/RiaSecCards.js
import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/RiaSecCards.css';
import { fetchInterestById } from '../../services/interest'; // 경로 프로젝트에 맞춰 조정

const CARD_IMAGES = {
  R: '/img/R.png',
  I: '/img/I.png',
  A: '/img/A.png',
  S: '/img/S.png',
  E: '/img/E.png',
  C: '/img/C.png',
};

// API 응답 → {R,I,A,S,E,C} 형태로 맵핑 (0~1 스케일 대비)
function toRiasecMap(res) {
  const pick = (k) =>
    res?.[k] ??
    res?.riasec?.[k] ??
    res?.scores?.[k] ??
    res?.[k.toLowerCase()] ??
    res?.[`${k}_score`] ??
    res?.[`${k.toLowerCase()}_score`];

  let map = {
    R: Number(pick('R') ?? 0),
    I: Number(pick('I') ?? 0),
    A: Number(pick('A') ?? 0),
    S: Number(pick('S') ?? 0),
    E: Number(pick('E') ?? 0),
    C: Number(pick('C') ?? 0),
  };

  const maxVal = Math.max(...Object.values(map));
  if (maxVal > 0 && maxVal <= 1) {
    // 0~1이면 %로 변환
    for (const k of Object.keys(map)) map[k] = +(map[k] * 100).toFixed(1);
  } else {
    for (const k of Object.keys(map)) map[k] = +map[k].toFixed(1);
  }
  return map;
}

export default function RiaSecCards({ hmtId }) {
  const [scores, setScores] = useState({ R:0, I:0, A:0, S:0, E:0, C:0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hmtId) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetchInterestById(hmtId); // GET /hmt/:id
        setScores(toRiasecMap(res));
      } catch (e) {
        setErr(e?.response?.data?.message || '흥미검사 카드 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [hmtId]);

  // 상위 1, 2위 타입 추출
  const [top1, top2] = useMemo(() => {
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);
    return [sorted[0], sorted[1]];
  }, [scores]);

  if (loading) return <div>카드 불러오는 중...</div>;
  if (err) return <div style={{ color: '#c00' }}>{err}</div>;

  return (
    <div className="riasec-container">
      {Object.keys(CARD_IMAGES).map((type) => {
        const rank = type === top1 ? 1 : type === top2 ? 2 : null;
        return (
          <div
            key={type}
            className={`riasec-card${rank ? ` riasec-card--rank${rank}` : ''}`}
            title={`${type}: ${scores[type]}%`}
          >
            <img
              src={CARD_IMAGES[type]}
              alt={`${type} 카드`}
              className="riasec-card__full-image"
              draggable={false}
            />
            {rank && <div className="riasec-card__rank-label">{rank}순위</div>}
          </div>
        );
      })}
    </div>
  );
}

