// src/components/RiaSecCards.js
import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/RiaSecCards.css';
import { fetchInterestById } from '../../services/interest';

const CARD_IMAGES = {
  R: '/img/R.png',
  I: '/img/I.png',
  A: '/img/A.png',
  S: '/img/S.png',
  E: '/img/E.png',
  C: '/img/C.png',
};

// API data({ rScore, iScore, ... }) → { R,I,A,S,E,C }로 변환
function toRiasecMapFromApi(d) {
  const raw = {
    R: Number(d?.rScore ?? 0),
    I: Number(d?.iScore ?? 0),
    A: Number(d?.aScore ?? 0),
    S: Number(d?.sScore ?? 0),
    E: Number(d?.eScore ?? 0),
    C: Number(d?.cScore ?? 0),
  };

  // 0~1 범위로 오면 %로 변환
  const maxVal = Math.max(...Object.values(raw));
  const toFixed1 = (v) => +v.toFixed(1);

  if (maxVal > 0 && maxVal <= 1) {
    return {
      R: toFixed1(raw.R * 100),
      I: toFixed1(raw.I * 100),
      A: toFixed1(raw.A * 100),
      S: toFixed1(raw.S * 100),
      E: toFixed1(raw.E * 100),
      C: toFixed1(raw.C * 100),
    };
  }
  return {
    R: toFixed1(raw.R),
    I: toFixed1(raw.I),
    A: toFixed1(raw.A),
    S: toFixed1(raw.S),
    E: toFixed1(raw.E),
    C: toFixed1(raw.C),
  };
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
        const data = await fetchInterestById(hmtId); // GET /hmt/{id} → { rScore, ... }
        setScores(toRiasecMapFromApi(data));
      } catch (e) {
        setErr(e?.response?.data?.message || '흥미검사 카드 불러오기 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [hmtId]);

  // 상위 1, 2위
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

