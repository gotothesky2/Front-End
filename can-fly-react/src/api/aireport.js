// src/api/aireport.js
import ai from './aiApi';
import AIconfig from './AIconfig';

/** 'AiReport 생성' */
export async function createAiReport({ reportGradeNum, reportTermNum }) {
  const url = AIconfig.AIREPORT.MAKE_REPORT; // POST /aireport
  const res = await ai.post(url, { reportGradeNum, reportTermNum });
  // res.data = { success, message, data }
  return res.data;
}
