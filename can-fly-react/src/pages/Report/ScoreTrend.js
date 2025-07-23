// src/pages/Report/ScoreTrend.js
import React, { useRef, useEffect, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../styles/ScoreTrend.css';  // 스타일은 자유롭게 커스터마이징

// Chart.js에 필요한 컨트롤러·엘리먼트 등록
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function ScoreTrend() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('grade');       // 'grade' | 'mock'
  const [subject, setSubject] = useState('국어');  // 모의고사 과목

  // 더미 데이터
  const gradeData = [
    { term: '1학년 6월', score: 75 },
    { term: '1학년 9월', score: 85 },
    { term: '2학년 6월', score: 78 },
    { term: '2학년 9월', score: 91 },
    { term: '3학년 6월', score: 97 },
    { term: '3학년 9월', score: 92 },
  ];
  const mockData = {
    국어: [
      { exam: '1학년 6월', pct: 85 },
      { exam: '1학년 9월', pct: 88 },
      { exam: '2학년 6월', pct: 90 },
      { exam: '2학년 9월', pct: 87 },
      { exam: '3학년 6월', pct: 92 },
      { exam: '3학년 9월', pct: 94 },
    ],
    수학: [
        { exam: '1학년 6월', pct: 50 },
        { exam: '1학년 9월', pct: 80 },
        { exam: '2학년 6월', pct: 9 },
        { exam: '2학년 9월', pct: 8 },
        { exam: '3학년 6월', pct: 15 },
        { exam: '3학년 9월', pct: 93 },
    ],
    영어: [
        { exam: '1학년 6월', pct: 81 },
        { exam: '1학년 9월', pct: 42 },
        { exam: '2학년 6월', pct: 13 },
        { exam: '2학년 9월', pct: 54 },
        { exam: '3학년 6월', pct: 34 },
        { exam: '3학년 9월', pct: 99 },
    ],
    탐구1: [
        { exam: '1학년 6월', pct: 20 },
        { exam: '1학년 9월', pct: 40 },
        { exam: '2학년 6월', pct: 60 },
        { exam: '2학년 9월', pct: 80 },
        { exam: '3학년 6월', pct: 90 },
        { exam: '3학년 9월', pct: 94 },
    ],
    탐구2: [      
        { exam: '1학년 6월', pct: 30 },
        { exam: '1학년 9월', pct: 20 },
        { exam: '2학년 6월', pct: 10 },
        { exam: '2학년 9월', pct: 50 },
        { exam: '3학년 6월', pct: 30 },
        { exam: '3학년 9월', pct: 40 },
    ],
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    // 기존 차트 파괴
    if (canvasRef.current._chart) {
      canvasRef.current._chart.destroy();
    }

    // 라벨과 값 선택
    const labels = mode === 'grade'
      ? gradeData.map(d => d.term)
      : mockData[subject].map(d => d.exam);
    const dataValues = mode === 'grade'
      ? gradeData.map(d => d.score)
      : mockData[subject].map(d => d.pct);

    // 차트 인스턴스 생성
    canvasRef.current._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: mode === 'grade' ? '전교과 평균' : `${subject} 백분위`,
          data: dataValues,
          fill: false,
          borderColor: '#0339A6',
          pointBackgroundColor: '#0339A6',
          pointBorderColor: '#0339A6',
          tension: 0.4,
          pointRadius: 5,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { min: 0, max: 100 }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: false
          }
        }
      }
    });

    // 언마운트 시 파괴
    return () => {
      canvasRef.current._chart.destroy();
    };
  }, [mode, subject]);

  return (
    <div className="score-trend">
      {/* 상단 탭 */}
      <div className="score-trend__tabs">
        <button
          className={mode === 'grade' ? 'active' : ''}
          onClick={() => setMode('grade')}
        >
          학년별 교과 추이
        </button>
        <button
          className={mode === 'mock' ? 'active' : ''}
          onClick={() => setMode('mock')}
        >
          모의고사 추이(백분위)
        </button>
      </div>

      {/* 차트 캔버스 */}
      <canvas ref={canvasRef}></canvas>

      {/* 하단 과목/전교과 탭 */}
      <div className="score-trend__subs">
        {mode === 'grade'
          ? <button className="active">전교과</button>
          : ['국어','수학','영어','탐구1','탐구2'].map(s => (
              <button
                key={s}
                className={subject === s ? 'active' : ''}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))
        }
      </div>
    </div>
  );
}
