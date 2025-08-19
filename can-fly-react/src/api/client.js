// src/api/client.js
import axios from "axios";

/** ─────────────────────────────────────────────────────────────
 *  베이스 URL (고정값)
 *  - 사용자 정보 서버: http://43.200.79.118
 *  - 토큰/코인 서버:   http://canfly.ap-northeast-2.elasticbeanstalk.com
 *  ────────────────────────────────────────────────────────────*/
export const API_BASE = "http://43.200.79.118";
export const COIN_BASE = "http://canfly.ap-northeast-2.elasticbeanstalk.com";

/** 공통: 토큰 정규화 ("Bearer x"든 "x"든 순수 토큰만) */
const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");

/** Axios 인스턴스들 */
const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

const coinClient = axios.create({
  baseURL: COIN_BASE,
  timeout: 10000,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

/** 요청 인터셉터: 매 요청에 Authorization 자동 첨부 */
const attachAuth = (cfg) => {
  const stored = localStorage.getItem("accessToken");
  const bare = normalizeToken(stored);
  if (bare) cfg.headers.Authorization = `Bearer ${bare}`;
  else delete cfg.headers.Authorization;
  return cfg;
};
client.interceptors.request.use(attachAuth);
coinClient.interceptors.request.use(attachAuth);

/* ===================== 헬퍼들 ===================== */

/** 1) 사용자 정보 (/auth/me) */
export const fetchMe = async () => {
  const res = await client.get("/auth/me");
  return res.data;
};

/** 2) 토큰 개수 조회 (/users/info → result.token)
 *    - 성공: { token: number, raw: any }
 *    - 실패(네트워크/권한/CORS 등): { token: 0, error: string }
 */
export const fetchTokenCount = async () => {
  try {
    const res = await coinClient.get("/users/info");
    const token = res?.data?.result?.token ?? 0;
    return { token, raw: res.data };
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "토큰 조회 실패";
    return { token: 0, error: msg };
  }
};

/** 3) 서버 로그아웃 (DELETE /users/logout)
 *    - 스웨거 응답: { isSuccess, code, message, result }
 */
export const requestLogout = async () => {
  try {
    const res = await coinClient.delete("/users/logout");
    return res.data;
  } catch (err) {
    return {
      isSuccess: false,
      message:
        err?.response?.data?.message || err?.message || "로그아웃 요청 실패",
    };
  }
};

/** 4) 프로필 수정 (PUT /users/me/profile)
 *    - 모달에서 넘어온 키(gradaeNum)를 서버 키(gradeNum)로 매핑
 *    - 성공: { ok:true, data }, 실패: { ok:false, error, status }
 */
export const updateUserProfile = async ({
  highschool,
  gradaeNum, // 로컬 키명
  sex,
  zipcode,
  address,
  addressDetail,
}) => {
  try {
    const payload = {
      highschool,
      gradeNum: gradaeNum, // 서버 기대 키명
      sex,
      zipcode,
      address,
      addressDetail,
    };
    const res = await coinClient.put("/users/me/profile", payload);
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status,
      error:
        err?.response?.data?.message || err?.message || "프로필 수정 실패",
    };
  }
};

/** 5) 고등학교/학년/성별 조회 (GET /users/info)
 *    - 성공: { ok:true, highschool, gradeNum, sex, raw }
 *    - 실패: { ok:false, error }
 */
export const fetchSchoolGradeSex = async () => {
  try {
    const res = await coinClient.get("/users/info");
    const r = res?.data?.result || {};
    return {
      ok: true,
      highschool: r.highschool ?? "",
      gradeNum: r.gradeNum ?? null,
      sex: r.sex ?? "",
      raw: res.data,
    };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "학교/학년/성별 조회 실패";
    return { ok: false, highschool: "", gradeNum: null, sex: "", error: msg };
  }
};

export default client;
