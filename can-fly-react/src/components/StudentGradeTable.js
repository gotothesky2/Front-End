// src/components/StudentGradeTable.js

import React from 'react';

const grades    = ['1학년', '2학년', '3학년'];
const semesters = ['1학기', '2학기'];
const subjects  = ['국어', '수학', '영어', '사회', '과학'];

// 한 학기(cell) 내 동일 과목의 평균
function getSubjectAvg(termData, grade, sem, subj) {
  const rows    = termData[`${grade} ${sem}`] || [];
  const matched = rows.filter(r => r.subjectCategory === subj);
  if (!matched.length) return '0.0';
  const sum = matched.reduce((a, r) => a + Number(r.rank || 0), 0);
  return (sum / matched.length).toFixed(1);
}

// 학년 전체 과목평균 (평균 행용)
function getGradeSubjectAvg(termData, grade, subj) {
  const v1 = Number(getSubjectAvg(termData, grade, semesters[0], subj));
  const v2 = Number(getSubjectAvg(termData, grade, semesters[1], subj));
  return ((v1 + v2) / 2).toFixed(1);
}

// 한 학기 전체 평균 (열 평균)
function computeSemesterAvg(termData, grade, sem) {
  const vals = subjects.map(subj =>
    Number(getSubjectAvg(termData, grade, sem, subj))
  );
  const sum = vals.reduce((a, b) => a + b, 0);
  return (sum / vals.length).toFixed(1);
}

// 학년 전체 평균 (마지막 셀)
function computeGradeAvg(termData, grade) {
  const semAvgs = semesters.map(sem =>
    Number(computeSemesterAvg(termData, grade, sem))
  );
  const sum = semAvgs.reduce((a, b) => a + b, 0);
  return (sum / semAvgs.length).toFixed(1);
}

export default function StudentGradeTable({ termData }) {
  // “1학기”, “2학기”, “평균” 세 줄을 하나의 배열로
  const rows = [...semesters, '평균'];

  return (
    <div className="grade-table-container">
      <table className="grade-table">
        <thead>
          <tr>
            <th colSpan={2}>구분</th>
            {subjects.map(s => <th key={s}>{s}</th>)}
            <th>평균</th>
          </tr>
        </thead>

        <tbody>
          {grades.map(grade =>
            rows.map((sem, i) => (
              <tr key={`${grade}-${sem}`}>
                {/* 첫 줄에만 학년(rowSpan=3) */}
                {i === 0 && (
                  <td rowSpan={rows.length} className='grade-table__grade'>
                    {grade}
                  </td>
                )}

                {/* 학기/평균 */}
                <td className="grade-table__sem">{sem}</td>

                {/* 과목별 값 */}
                {subjects.map(subj => (
                  <td key={subj}>
                    {sem === '평균'
                      ? getGradeSubjectAvg(termData, grade, subj)
                      : getSubjectAvg(termData, grade, sem, subj)}
                  </td>
                ))}

                {/* 한 학기 또는 학년 평균 */}
                <td>
                  {sem === '평균'
                    ? computeGradeAvg(termData, grade)
                    : computeSemesterAvg(termData, grade, sem)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}



