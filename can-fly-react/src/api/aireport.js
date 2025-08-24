// src/api/aireport.js
import { aiGet } from './aiApi';
import AIconfig from './AIconfig';

const { AIREPORT, INTEREST, APTITUDE } = AIconfig;

/**
 * 1순위: /aireport/me → ID 목록 → 각각 /aireport/{id}로 상세 내용 조회
 * 실패/빈배열이면 폴백: /hmt/my + /cst/my 병합
 */
export async function fetchAllAiReports() {
  console.log("[AR] start");
  try {
    console.log("[AR] GET", AIREPORT.ME);
    const response = await aiGet(AIREPORT.ME);
    console.log("[AR] /aireport/me response:", response);
    console.log("[AR] response.data:", response?.data);
    console.log("[AR] response.data length:", response?.data?.length);

    // 응답 구조: { success: true, data: [...] }
    const list = response?.data || [];
    console.log("[AR] parsed list:", list);
    
    if (list.length) {
      console.log("[AR] /aireport/me ->", list.length, "items found");
      
      // 각 ID로 상세 내용 조회
      const detailedReports = await Promise.allSettled(
        list.map(async (item, index) => {
          try {
            const id = item.id;
            console.log(`[AR] Processing item ${index}:`, item);
            console.log(`[AR] Item ${index} ID:`, id);
            
            if (!id) {
              console.warn("[AR] item without ID:", item);
              return null;
            }
            
            console.log("[AR] fetching details for ID:", id);
            const details = await aiGet(AIREPORT.BY_ID(id));
            console.log("[AR] details for ID", id, ":", details);
            console.log("[AR] details.data for ID", id, ":", details?.data);
            console.log("[AR] details.data.testReport for ID", id, ":", details?.data?.testReport);
            console.log("[AR] details.data.scoreReport for ID", id, ":", details?.data?.scoreReport);
            console.log("[AR] details.data.HmtID for ID", id, ":", details?.data?.HmtID);
            console.log("[AR] details.data.CstID for ID", id, ":", details?.data?.CstID);
            
            // 상세 응답에서 실제 데이터 추출
            const reportData = details?.data || details;
            console.log("[AR] extracted reportData for ID", id, ":", reportData);
            
            const result = {
              id: id,
              reportGradeNum: reportData?.reportGradeNum,
              reportTermNum: reportData?.reportTermNum,
              created_at: reportData?.created_at,
              CstID: reportData?.CstID,
              HmtID: reportData?.HmtID,
              // testReport, scoreReport, totalReport 내용
              testReport: reportData?.testReport,
              scoreReport: reportData?.scoreReport,
              totalReport: reportData?.totalReport,
              // 원본 데이터 보존
              raw: reportData
            };
            
            console.log("[AR] final result for ID", id, ":", result);
            console.log("[AR] result.testReport for ID", id, ":", result.testReport);
            console.log("[AR] result.scoreReport for ID", id, ":", result.scoreReport);
            console.log("[AR] result.totalReport for ID", id, ":", result.totalReport);
            return result;
          } catch (e) {
            console.error("[AR] failed to fetch details for item:", item, e);
            return null;
          }
        })
      );

      console.log("[AR] detailedReports results:", detailedReports);

      const successfulReports = detailedReports
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);

      console.log("[AR] successfully fetched", successfulReports.length, "detailed reports");
      console.log("[AR] final successfulReports:", successfulReports);
      return successfulReports;
    } else {
      console.log("[AR] No items found in list");
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

  const taggedH = h.map(v => ({ ...v, type: 'interest' }));
  const taggedC = c.map(v => ({ ...v, type: 'aptitude' }));

  const merged = [...taggedH, ...taggedC];
  console.log("[AR] fallback merged:", merged.length);
  return merged;
}
