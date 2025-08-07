// src/components/MockExamScoreTable.js
import React from 'react';

const grades    = ['1학년','2학년','3학년'];
const semesters = ['6월','9월','평균'];
const subjects  = ['국어','수학','영어','탐구1','탐구2'];

// map 과목명 → modal rows key
const mapSubjectToKey = {
  국어:    'korean',
  수학:    'math',
  영어:    'english',
  탐구1:   'explore1',
  탐구2:   'explore2',
};

// 한 과목의 표준점수 (단일 학기)
 function getRawScore(data, grade, sem, subjName) {
   const termKey = `${grade} ${sem}`;
   const rowKey  = mapSubjectToKey[subjName];
   // 실제 저장된 값
   const stored = data[termKey]?.[rowKey]?.raw;
   // null, undefined, '' 전부 0으로 대체
   if (stored === null || stored === undefined || stored === '') {
     return 0;
   }
   return stored;
 }

// 한 과목 평균 (6월+9월)
function getSubjectAvg(data, grade, subjName) {
  const v6 = Number(getRawScore(data, grade, '6월', subjName));
  const v9 = Number(getRawScore(data, grade, '9월', subjName));
  return ((v6 + v9) / 2).toFixed(1);
}

// 한 학기 전체 평균
function computeSemesterAvg(data, grade, sem) {
  const vals = subjects.map(s => Number(getRawScore(data, grade, sem, s)));
  return (vals.reduce((a,b)=>a+b,0) / vals.length).toFixed(1);
}

// 학년 전체 평균
function computeGradeAvg(data, grade) {
  const avg6 = Number(computeSemesterAvg(data, grade, '6월'));
  const avg9 = Number(computeSemesterAvg(data, grade, '9월'));
  return ((avg6 + avg9)/2).toFixed(1);
}

export default function MockExamScoreTable({ rawData }) {
  return (
    <div className="grade-table-container">
      <table className="grade-table">
        <thead>
          <tr>
            <th colSpan={2}>표준점수</th>
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
                      ? getSubjectAvg(rawData, grade, subjName)
                      : getRawScore(rawData, grade, sem, subjName)}
                  </td>
                ))}

                <td>
                  {sem === '평균'
                    ? computeGradeAvg(rawData, grade)
                    : computeSemesterAvg(rawData, grade, sem)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
