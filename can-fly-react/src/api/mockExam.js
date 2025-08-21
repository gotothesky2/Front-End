// src/api/mockExam.js
import ai from './aiApi';
import config from '../config';

const { MOCK } = config;

/**
 * 전체 모의고사 조회: 서버 응답의 result 배열만 그대로 반환
 * ExamGrade.js에서 표준점수 정규화(normalizeApiResult) 함수를 통해
 * koreanStd / mathStd / explore1Std / explore2Std로 매핑합니다.
 */
export async function getAllMockExams(params = {}) {
  const res = await ai.get(MOCK.ALL_DETAIL, { params });
  return res?.data?.result ?? [];
}

/** 모의고사 등록(엑셀 업로드 등) */
export async function postMockExam(payload) {
  // 절대경로를 이미 쓰고 있다면 그대로 두세요.
  const res = await ai.post(
    'http://canfly.ap-northeast-2.elasticbeanstalk.com/users/grades/mock/excel',
    payload
  );
  return res?.data;
}


