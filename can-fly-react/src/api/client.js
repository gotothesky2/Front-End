// src/api/client.js
import axios from "axios";

export const API_BASE =
  process.env.REACT_APP_API_BASE || "http://43.200.79.118";

/** Axios 인스턴스 */
const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

/** 토큰 정규화: "Bearer x"든 "x"든 순수 토큰만 추출 */
const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");

/** 요청 인터셉터: 매 요청에 Authorization 자동 첨부 */
client.interceptors.request.use((cfg) => {
  const stored = localStorage.getItem("accessToken");
  const bare = normalizeToken(stored);
  if (bare) {
    cfg.headers.Authorization = `Bearer ${bare}`;
  } else {
    delete cfg.headers.Authorization;
  }
  return cfg;
});

/** /auth/me 호출 헬퍼 */
export const fetchMe = async () => {
  const res = await client.get("/auth/me");
  // 보통 { success, message, data: {...} } 형태
  return res.data;
};

export default client;
