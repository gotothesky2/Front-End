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

/** ===================== 헬퍼들 ===================== */
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
    // 화면에서 "0토큰" 표시는 가능하도록 0을 기본값으로 내려줌
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "토큰 조회 실패";
    return { token: 0, error: msg };
  }
};

export default client;
