import React from 'react';
import '../../styles/AptitudeText.css';

// 백엔드에서 받아올 “종합 텍스트” 더미
const DUMMY_TEXT = [
  '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 …',
  '남산 위에 저 소나무 철갑을 두른 듯 바람 서리 불변함은 우리 기상일세 …',
  '가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴 일편단심일세 …',
  '이 기상과 이 맘으로 충성을 다하여 괴로우나 즐거우나 나라 사랑하세 …',
];

export default function AptitudeText({ lines = DUMMY_TEXT }) {
  return (
    <ul className="aptitude-text">
      {lines.map((line, idx) => (
        <li key={idx}>{line}</li>
      ))}
    </ul>
  );
}
