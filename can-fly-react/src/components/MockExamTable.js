// src/components/MockExamTable.js
import React from 'react';

const grades    = ['1학년','2학년','3학년'];
const semesters = ['6월','9월','평균'];
const subjects  = ['국어','수학','영어','탐구1','탐구2'];

// 이름 → 내부 row state 키
const mapSubjectToKey = {
  국어:    'korean',
  수학:    'math',
  영어:    'english',
  탐구1:   'explore1',
  탐구2:   'explore2',
};

// 한 과목의 백분위
function getPercentile(termData, grade, sem, subjName) {
  const termKey = `${grade} ${sem}`;
  const rowKey  = mapSubjectToKey[subjName];
  return termData[termKey]?.[rowKey]?.percentile ?? 0;
}

// — 새로 추가 —
// 한 과목의 평균(6월+9월)
function getSubjectAvg(data, grade, subjName) {
  const p6 = Number(getPercentile(data, grade, '6월', subjName));
  const p9 = Number(getPercentile(data, grade, '9월', subjName));
  return ((p6 + p9) / 2).toFixed(1);
}

// 학기별 평균
function computeSemesterAvg(termData, grade, sem) {
  const vals = subjects.map(s => Number(getPercentile(termData, grade, sem, s)));
  return (vals.reduce((a,b)=>a+b,0) / vals.length).toFixed(1);
}

// 학년 전체 평균
function computeGradeAvg(termData, grade) {
  const avg6 = Number(computeSemesterAvg(termData, grade, semesters[0]));
  const avg9 = Number(computeSemesterAvg(termData, grade, semesters[1]));
  return ((avg6 + avg9)/2).toFixed(1);
}

export default function MockExamTable({ percentileData }) {
  return (
    <div className="grade-table-container">
      <table className="grade-table">
        <thead>
          <tr>
            <th colSpan={2}>백분위</th>
            {subjects.map(s => <th key={s}>{s}</th>)}
            <th>평균</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade =>
            semesters.map((sem, i) => (
              <tr key={`${grade}-${sem}`}>
                {i===0 && (
                  <td rowSpan={semesters.length} className="grade-table__grade">
                    {grade}
                  </td>
                )}
                <td className="grade-table__sem">{sem}</td>

                {subjects.map(subjName => (
                  <td key={subjName}>
                    {sem === '평균'
                      ? getSubjectAvg(percentileData, grade, subjName)
                      : getPercentile(percentileData, grade, sem, subjName)}
                  </td>
                ))}

                <td>
                  {sem === '평균'
                    ? computeGradeAvg(percentileData, grade)
                    : computeSemesterAvg(percentileData, grade, sem)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

