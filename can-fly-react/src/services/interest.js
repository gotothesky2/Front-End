// src/services/interest.js
import { aiGet } from '../api/aiApi';
import AIconfig from '../api/AIconfig';

// hmtId로 흥미검사 결과 조회
export const fetchInterestById = (hmtId) =>
  aiGet(AIconfig.INTEREST.CHECK_HMT(hmtId));
