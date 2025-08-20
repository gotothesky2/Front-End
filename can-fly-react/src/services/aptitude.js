// src/services/aptitude.js
import { aiGet } from '../api/aiApi';
import AIconfig from '../api/AIconfig';

/** cstId로 적성검사 단건 조회 */
export async function fetchAptitudeById(cstId) {
  const res = await aiGet(AIconfig.APTITUDE.CHECK_CST(cstId));
  // 응답: { success, message, data }
  return res.data; // => { mathScore, spaceScore, ... }
}

/** API data → [{ skill, score }] 변환 (차트용) */
export function toSkillScoreList(d) {
  // 원본 점수 꺼내기(숫자 보정)
  const raw = {
    physical: Number(d?.physicalScore ?? 0),   // 신체·운동능력
    hand:     Number(d?.handScore ?? 0),       // 손재능
    space:    Number(d?.spaceScore ?? 0),      // 공간지각력
    music:    Number(d?.musicScore ?? 0),      // 음악능력
    creative: Number(d?.creativeScore ?? 0),   // 창의력
    lang:     Number(d?.langScore ?? 0),       // 언어능력
    math:     Number(d?.mathScore ?? 0),       // 수리·논리력
    self:     Number(d?.selfScore ?? 0),       // 자기성찰능력
    relation: Number(d?.relationScore ?? 0),   // 대인관계능력
    nature:   Number(d?.natureScore ?? 0),     // 자연친화력
    art:      Number(d?.artScore ?? 0),        // 예술시각능력
  };

  // 0~1 스케일로 오는 경우 %로 변환
  const maxVal = Math.max(...Object.values(raw));
  const fix = (v) => +v.toFixed(1);
  const toPct = (v) => +(v * 100).toFixed(1);
  const convert = (v) => (maxVal > 0 && maxVal <= 1 ? toPct(v) : fix(v));

  // y축(카테고리) 순서를 고정하려면 여기 배열 순서 유지!
  return [
    { skill: '신체·운동능력', score: convert(raw.physical) },
    { skill: '손재능',        score: convert(raw.hand) },
    { skill: '공간지각력',    score: convert(raw.space) },
    { skill: '음악능력',      score: convert(raw.music) },
    { skill: '창의력',        score: convert(raw.creative) },
    { skill: '언어능력',      score: convert(raw.lang) },
    { skill: '수리·논리력',   score: convert(raw.math) },
    { skill: '자기성찰능력',  score: convert(raw.self) },
    { skill: '대인관계능력',  score: convert(raw.relation) },
    { skill: '자연친화력',    score: convert(raw.nature) },
    { skill: '예술시각능력',  score: convert(raw.art) },
  ];
}
