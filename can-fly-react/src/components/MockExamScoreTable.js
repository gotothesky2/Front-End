// src/components/MockExamScoreTable.js
// 이거 표준점수임
import React from 'react';

const grades    = ['1학년', '2학년', '3학년'];
const semesters = ['6월', '9월', '평균'];
const subjects  = ['국어', '수학', '탐구1', '탐구2'];

// 과목 → mockData 내부 표준점수 키
const mapSubjectToStdKey = {
  국어:  'koreanStd',
  수학:  'mathStd',
  탐구1: 'explore1Std',
  탐구2: 'explore2Std',
};

// 숫자/문자/객체(예: {standardScore: 123}) 모두 안전 변환
function toStdNumber(cell) {
  if (cell && typeof cell === 'object') {
    const cand = cell.standardScore ?? cell.std ?? cell.value ?? cell.val;
    const n = Number(cand);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(cell);
  return Number.isFinite(n) ? n : 0;
}

// 한 과목의 표준점수 (mockData["3학년 9월"].koreanStd 같은 형태 가정)
function getStd(rawData, grade, sem, subjName) {
  const termKey = `${grade} ${sem}`;
  const key     = mapSubjectToStdKey[subjName];
  const cell    = rawData?.[termKey]?.[key];
  return toStdNumber(cell);
}

// 과목 평균(6월+9월)
function getSubjectAvg(rawData, grade, subjName) {
  const s6 = getStd(rawData, grade, '6월', subjName);
  const s9 = getStd(rawData, grade, '9월', subjName);
  return ((s6 + s9) / 2).toFixed(1);
}

// 학기 평균(해당 학기의 4과목 평균)
function computeSemesterAvg(rawData, grade, sem) {
  const vals = subjects.map(s => getStd(rawData, grade, sem, s));
  const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  return avg.toFixed(1);
}

// 학년 전체 평균(6월/9월 평균의 평균)
function computeGradeAvg(rawData, grade) {
  const avg6 = Number(computeSemesterAvg(rawData, grade, '6월'));
  const avg9 = Number(computeSemesterAvg(rawData, grade, '9월'));
  return ((avg6 + avg9) / 2).toFixed(1);
}

export default function MockExamScoreTable({ rawData = {} }) {
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
                {i === 0 && (
                  <td rowSpan={semesters.length} className="grade-table__grade">
                    {grade}
                  </td>
                )}
                <td className="grade-table__sem">{sem}</td>

                {subjects.map(subjName => (
                  <td key={subjName}>
                    {sem === '평균'
                      ? getSubjectAvg(rawData, grade, subjName)
                      : getStd(rawData, grade, sem, subjName)}
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


