// src/services/interest.js
import { aiGet } from '../api/aiApi';
import AIconfig from '../api/AIconfig';

// hmtId로 흥미검사 결과 조회
export async function fetchInterestById(hmtId) {
  const res = await aiGet(AIconfig.INTEREST.CHECK_HMT(hmtId));
  // 백엔드 응답 예: { success, message, data: { rScore, ... } }
  return res.data; // => { rScore, iScore, aScore, sScore, eScore, cScore, ... }
}
