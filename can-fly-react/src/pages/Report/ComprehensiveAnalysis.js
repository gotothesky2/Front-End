// src/pages/Report/ComprehensiveAnalysis.js
import React, { useMemo } from 'react';
import '../../styles/ComprehensiveAnalysis.css';

const splitToLines = (text) =>
  String(text || '')
    .split(/\r?\n\r?\n|\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

export default function ComprehensiveAnalysis({ fallback = [] }) {
  const fromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem('last_ai_report');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.totalReport?.content || null;
    } catch {
      return null;
    }
  }, []);

  const analysisText = useMemo(() => {
    if (fromStorage) return splitToLines(fromStorage);
    // 기존 더미가 필요하면 prop으로 내려주거나, 아래처럼 기본값 설정 가능
    return (
      fallback.length ? fallback : [
        '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
        '남산 위에 저 소나무 철갑을 두른 듯 바람서리 불변함은 우리 기상일세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
        '가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴 일편단심일세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
        '이 기상과 이 맘으로 충성을 다하여 괴로우나 즐거우나 나라 사랑하세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.'
      ]
    );
  }, [fromStorage, fallback]);

  return (
    <ol className="comprehensive-analysis__list">
      {analysisText.map((line, idx) => (
        <li key={idx} className="comprehensive-analysis__item">
          {line}
        </li>
      ))}
    </ol>
  );
}


