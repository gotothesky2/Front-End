// src/services/aptitude.js
import { aiGet } from '../api/aiApi';
import AIconfig from '../api/AIconfig';

/**
 * cst_id로 '적성(능력) 검사' 결과 조회
 * ex) GET /cst/:cst_id
 */
export const fetchAptitudeById = (cstId) =>
  aiGet(AIconfig.APTITUDE.CHECK_CST(cstId));

/**
 * API 응답을 [{ skill, score }, ...] 로 정규화
 * - skill/name/label/title/ability 중 있는 키를 이름으로 사용
 * - score/value/percent/percentage 중 있는 키를 점수로 사용
 * - 0~1 스케일이면 0~100(%)로 변환
 * - 소수점 1자리까지 반올림
 */
export function toSkillScoreList(res) {
  // 응답 안에서 배열 후보를 찾는다.
  const maybeArray =
    res?.skills ||
    res?.data ||
    res?.details ||
    res?.result ||
    res?.payload ||
    [];

  const rows = (Array.isArray(maybeArray) ? maybeArray : []).map((item) => {
    const name =
      item?.skill ||
      item?.name ||
      item?.label ||
      item?.title ||
      item?.ability ||
      '';

    let score =
      item?.score ??
      item?.value ??
      item?.percent ??
      item?.percentage ??
      0;

    score = Number(score);
    if (Number.isFinite(score) && score > 0 && score <= 1) {
      score = +(score * 100).toFixed(1); // 0~1 -> %
    } else {
      score = +score.toFixed?.(1) ?? Number(score.toFixed(1));
    }

    return { skill: String(name), score };
  });

  // 이름 없는 항목 제거
  return rows.filter((r) => r.skill);
}

// (선택) 한 번에 가져다 쓰고 싶으면 아래 export도 사용 가능
export default {
  fetchAptitudeById,
  toSkillScoreList,
};
