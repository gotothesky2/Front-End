import React, { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const AptitudeAnalysis = () => {
  const [data, setData] = useState({
    types: {},
    skills: [],
    comment: '',
  });

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
    };
    setTimeout(() => setData(fakeData), 500);
  }, []);

  if (!data) return <p>로딩 중...</p>;

  console.log("Radar data", Object.entries(data.types).map(([type, value]) => ({ type, value })));
  console.log("Scatter data", data.skills);

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

  return (
    <div className="aptitude-analysis-container">
      <h2 className="section-title">적성 · 흥미 검사 분석 결과</h2>
      

      {/* RadarChart - 적성 유형 시각화 */}
      {Object.keys(data.types).length>0&&(
      <div className="chart-section">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="80%" 
          width={500} 
          height={400} 
          data={Object.entries(data.types).map(([type, value]) => ({
          type,
          value
          }))}
          >
          <PolarGrid />
          <PolarAngleAxis dataKey="type" tickFormatter={getTypeLabel} />
          <PolarRadiusAxis />
          <Radar 
            name="적성유형" 
            dataKey="value" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </div>
      )}

      {/* ScatterChart - 능력 점수 시각화 */}
      {data.skills.length>0&&(
      <div className="scatter-section">
        <ScatterChart width={800} height={300}>
          <CartesianGrid />
          <XAxis type="number" dataKey="score" name="점수" />
          <YAxis type="category" dataKey="name" name="능력" />
          <Scatter data={data.skills} fill="#03178C" />
        </ScatterChart>
      </div>
      )}

      {/* 분석 결과 코멘트 */}
      {typeof data.comment === 'string' && data.comment && (
        <p className="aptitude-comment">{data.comment}</p>
      )}
    </div>
  );
};

export default AptitudeAnalysis;


