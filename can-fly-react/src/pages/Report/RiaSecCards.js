// src/components/RiaSecCards.js
import React, { useMemo } from 'react';
import '../../styles/RiaSecCards.css';

// 타입별 “완성형 카드” 이미지 경로만 정의
const CARD_IMAGES = {
  R: '/img/R.png',
  I: '/img/I.png',
  A: '/img/A.png',
  S: '/img/S.png',
  E: '/img/E.png',
  C: '/img/C.png',
}

// 임시 점수 데이터
const DUMMY_SCORES = { R:48.1, I:30.9, A:10, S:49.4, E:43.2, C:29.6 }

export default function RiaSecCards() {
  const [top1, top2] = useMemo(() => {
    const sorted = Object.entries(DUMMY_SCORES)
      .sort(([,a],[,b]) => b - a)
      .map(([type]) => type)
    return [sorted[0], sorted[1]]
  }, [])

  return (
    <div className="riasec-container">
      {Object.keys(CARD_IMAGES).map(type => {
        const rank = type === top1 ? 1 : type === top2 ? 2 : null
        return (
          <div
            key={type}
            className={`riasec-card${rank ? ` riasec-card--rank${rank}` : ''}`}
          >
            {/* 완성형 카드 이미지를 통째로 */}
            <img
              src={CARD_IMAGES[type]}
              alt={`${type} 카드`}
              className="riasec-card__full-image"
            />
            {/* 순위 테두리만 CSS로 입히기 */}
            {rank && (
              <div className="riasec-card__rank-label">
                {rank}순위
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
