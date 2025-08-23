// src/api/aireport.js
import { aiGet } from './aiApi';
import AIconfig from './AIconfig';

const { AIREPORT, INTEREST, APTITUDE } = AIconfig;

/**
 * 1순위: /aireport/me
 * 실패/빈배열이면 폴백: /hmt/my + /cst/my 병합
 */
export async function fetchAllAiReports() {
  console.log("[AR] start");
  try {
    console.log("[AR] GET", AIREPORT.ME);
    const data = await aiGet(AIREPORT.ME);
    console.log("[AR] /aireport/me data:", data);

    const list =
      (Array.isArray(data) && data) ||
      (Array.isArray(data?.data) && data.data) ||
      (Array.isArray(data?.result) && data.result) ||
      [];

    if (list.length) {
      console.log("[AR] /aireport/me ->", list.length);
      return list;
    }
  } catch (e) {
    console.error("[AR] /aireport/me failed:", e.response?.status, e.response?.data || e.message);
  }

  console.log("[AR] fallback -> hmt/my, cst/my");
  const [hmt, cst] = await Promise.allSettled([
    aiGet(INTEREST.MY_HMT),
    aiGet(APTITUDE.MY_CST),
  ]);

  const h = hmt.status === 'fulfilled'
    ? (Array.isArray(hmt.value) ? hmt.value
      : Array.isArray(hmt.value?.data) ? hmt.value.data
      : Array.isArray(hmt.value?.result) ? hmt.value.result : [])
    : [];

  const c = cst.status === 'fulfilled'
    ? (Array.isArray(cst.value) ? cst.value
      : Array.isArray(cst.value?.data) ? cst.value.data
      : Array.isArray(cst.value?.result) ? cst.value.result : [])
    : [];

  const taggedH = h.map(v => ({ ...v, type: v.type || v.category || 'interest' }));
  const taggedC = c.map(v => ({ ...v, type: v.type || v.category || 'aptitude' }));

  const merged = [...taggedH, ...taggedC];
  console.log("[AR] fallback merged:", merged.length);
  return merged;
}
