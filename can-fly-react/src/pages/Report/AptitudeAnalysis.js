// AptitudeAnalysis.js
import React, { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import '../../styles/AptitudeAnalysis.css'; // 스타일도 따로 관리하면 좋아

const AptitudeAnalysis = () => {
  const [data, setData] = useState(null);

 useEffect(() => {
  const fakeData = {
    types: {
      R: 48.1,
      I: 30.9,
      A: 100.0,
      S: 49.4,
      E: 43.2,
      C: 29.6,
    },
    skills: [
      { name: "신체운동능력", score: 3.2 },
      { name: "소통능력", score: 14.1 },
      { name: "공간지각력", score: 47.2 },
      { name: "음악능력", score: 64.9 },
      { name: "언어능력", score: 62.3 },
      { name: "수리논리력", score: 26.3 },
      { name: "자기성찰능력", score: 8.6 },
      { name: "대인관계능력", score: 50.8 },
      { name: "자연친화력", score: 48.2 },
      { name: "예술시각능력", score: 64.1 },
    ],
    comment: "테스트용 분석 결과입니다. 당신은 예술형과 사회형의 성향이 강합니다.",
  };

  setTimeout(() => {
    setData(fakeData);
  }, 500); // 0.5초 후에 로딩 끝
}, []);


  if (!data) return <p>로딩 중...</p>;

  // Radar 차트용 데이터 변환
  const radarData = Object.entries(data.types).map(([type, value]) => ({
    type,
    value
  }));

  // 상위 1, 2순위 추출
  const sortedTypes = [...Object.entries(data.types)].sort((a, b) => b[1] - a[1]);
  const top1 = sortedTypes[0][0];
  const top2 = sortedTypes[1][0];

  return (
    <div className="aptitude-analysis-container">
      <h2 className="section-title">적성 · 흥미 검사 분석 결과</h2>

      {/* Radar Chart */}
      <div className="chart-section">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" width={500} height={400} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="type" />
          <PolarRadiusAxis />
          <Radar name="적성유형" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </div>

      {/* 유형 표 영역 */}
      <div className="type-table">
        {Object.keys(data.types).map((type) => (
          <div
            key={type}
            className={`type-box ${type === top1 ? 'top1' : ''} ${type === top2 ? 'top2' : ''}`}
          >
            <div><strong>{type}</strong></div>
            <div>{getTypeLabel(type)}</div>
            {/* 여기에 세부 항목(예: 탐구성, 창의성 등)도 추후 추가 가능 */}
          </div>
        ))}
      </div>

      {/* 점수 시각화 */}
      <div className="scatter-section">
        <ScatterChart width={800} height={300}>
          <CartesianGrid />
          <XAxis type="number" dataKey="score" name="점수" />
          <YAxis type="category" dataKey="name" name="항목" />
          <Tooltip />
          <Scatter data={data.skills} fill="#03178C" />
        </ScatterChart>
      </div>

      {/* 분석 텍스트 */}
      <p className="aptitude-comment">{data.comment}</p>
    </div>
  );
};

// 유형 영문 → 한글 이름 매핑 함수
const getTypeLabel = (type) => {
  const map = {
    R: '현실형',
    I: '탐구형',
    A: '예술형',
    S: '사회형',
    E: '기업형',
    C: '관습형',
  };
  return map[type] || type;
};

export default AptitudeAnalysis;
