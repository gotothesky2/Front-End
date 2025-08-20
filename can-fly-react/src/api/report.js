// src/api/report.js
import ai from '../api/aiApi';
import config from '../config';   // ✅ config.js에서 불러오기

const { REPORT } = config; 

/** "1학년 1학기" 등 문자열에서 학년/학기 숫자 추출 */
export const parseTerm = (termStr) => {
  // 예: "1학년 1학기", "2학년 2학기", "1-1학기" 등 다양한 포맷 방어
  const gradeMatch = termStr.match(/[1-3]/);
  const semMatch = termStr.match(/([1-2])학기/);
  return {
    userGrade: gradeMatch ? Number(gradeMatch[0]) : null, // 학년
    term: semMatch ? Number(semMatch[1]) : null,          // 학기
    raw: termStr,
  };
};

// 스웨거 기준: 카테고리 매핑 (이름/코드)
const CATEGORY_MAP = {
  '국어':   { categoryName: 'KOREAN',  categoryGrade: 0 },
  '수학':   { categoryName: 'MATH',    categoryGrade: 1 },
  '영어':   { categoryName: 'ENGLISH', categoryGrade: 2 },
  '사회':   { categoryName: 'SOCIAL',  categoryGrade: 4 },
  '과학':   { categoryName: 'SCIENCE', categoryGrade: 5 },
};

// 숫자 변환 유틸: 빈 값이면 0(백엔드가 모두 number 요구)
const toNum = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));

/**
 * 모달 rows(여러 교과 섞일 수 있음)를 교과별로 그룹핑하고,
 * 스웨거 스키마에 맞춘 payload로 "내신 등록" 엔드포인트에 여러 번 POST.
 *
 * @param {string} termStr  - "1학년 1학기" 등
 * @param {Array}  rows     - 모달에서 편집한 행들
 * @returns {Promise<Array>} - 각 카테고리 POST 결과 배열
 */
export async function registerReportScores(termStr, rows) {
  const { userGrade, term } = parseTerm(termStr);

  if (!userGrade || !term) {
    throw new Error('학년/학기 파싱 실패: 사이드바의 학기명이 올바른지 확인해주세요.');
  }

  // 1) 교과별 그룹핑
  const grouped = rows.reduce((acc, r) => {
    const key = r.subjectCategory || '기타';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  // 2) 카테고리별 payload 생성 & POST
  const url = REPORT.REGISTER_REPORT; // 스웨거: 내신 등록 엔드포인트
  const requests = Object.entries(grouped).map(([categoryLabel, list]) => {
    const cat = CATEGORY_MAP[categoryLabel];
    if (!cat) {
      // 매핑에 없는 교과는 스킵(또는 에러 처리 원하면 throw)
      console.warn(`알 수 없는 교과 "${categoryLabel}" 는 전송에서 제외됩니다.`);
      return Promise.resolve({ skipped: true, categoryLabel });
    }

    // 비어있는 행(과목명 없이 전부 빈 값)은 제거
    const scoreLists = list
      .filter(r => (r.subject || '').trim().length > 0)
      .map(r => ({
        // 스웨거 키와 1:1 매핑
        subject: (r.subject || '').trim(),            // 과목명
        grade: toNum(r.rank),                         // 석차등급
        studentNum: toNum(r.students),                // 수강자수
        standardDeviation: toNum(r.deviation),        // 표준편차
        subjectAverage: toNum(r.average),             // 과목평균
        achievement: (r.achievement || '').trim(),    // 성취도
        score: toNum(r.score),                        // 원점수
        credit: toNum(r.credits),                     // 단위수
      }));

    // 전송할 데이터가 없으면 스킵
    if (scoreLists.length === 0) {
      return Promise.resolve({ skipped: true, categoryLabel });
    }

    const payload = {
      userGrade,                 // 학년 (number)
      term,                      // 학기 (number)
      categoryName: cat.categoryName,  // "KOREAN" 등
      categoryGrade: cat.categoryGrade, // 0/1/2/4/5
      scoreLists,                // [{ subject, grade, ... }]
    };

    return ai.post(url, payload).then(res => res.data);
  });

  return Promise.all(requests);
}

