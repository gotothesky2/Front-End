// src/api/report.js
//내신 API 모듈
import client from './client';
import config from '../config';

// "1학년 1학기" or "1-1" → {grade, semester}
export function parseTermLabel(term) {
  const m = term.match(/(\d)\s*학년.*?(\d)\s*학기/);
  if (m) return { grade: Number(m[1]), semester: Number(m[2]) };
  const m2 = term.match(/(\d)\s*-\s*(\d)/);
  if (m2) return { grade: Number(m2[1]), semester: Number(m2[2]) };
  return { grade: 1, semester: 1 };
}

// 프론트 rows → 백엔드 스펙에 맞춰 변환 (키 이름은 Swagger에 맞게 필요시 수정!)
export function buildSchoolRecordPayload(term, rows) {
  const { grade, semester } = parseTermLabel(term);
  return {
    grade,
    semester,
    subjects: rows.map(r => ({
      courseType: r.courseType,            // 교과종류구분
      subjectCategory: r.subjectCategory,  // 교과
      subjectName: r.subject,              // 과목명
      credit: toNum(r.credits),            // 필수 숫자
      rankGrade: toNum(r.rank),            // 필수 숫자
      rawScore: toNumOrNull(r.score),
      classAverage: toNumOrNull(r.average),
      stdDeviation: toNumOrNull(r.deviation),
      studentsCount: toNumOrNull(r.students),
      achievement: r.achievement || null,
    })),
  };
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function toNumOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// 1) 보고서(내신) 정보 자체 생성 (최초 1회 필요 시)
export async function registerReport() {
  // Swagger의 '내신 등록' 엔드포인트가 POST /users/grades/report 라면:
  const { data } = await client.post(config.REPORT.REGISTER_REPORT);
  return data; // { id: number, ... } 형태라고 가정
}

// 2) 보고서에 점수(학기+과목 리스트) 등록
export async function registerReportScores(reportId, term, rows) {
  const payload = buildSchoolRecordPayload(term, rows);
  // Swagger의 '내신점수등록' 이 SCORE_REGISTER_REPORT(reportId) 라고 했지
  const { data } = await client.post(
    config.REPORT.SCORE_REGISTER_REPORT(reportId),
    payload
  );
  return data;
}
