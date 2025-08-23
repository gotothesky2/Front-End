// src/api/aiApi.js
import axios from "axios";
import { Cookies } from "react-cookie";
import AIconfig from "./AIconfig";

const ai = axios.create({
  baseURL: AIconfig.API_URL, // 'http://43.200.79.118'
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // 쿠키 세션 쓸 거면 true + 서버 CORS 설정 필요
});

const cookies = new Cookies();

// ---- 요청 인터셉터 (토큰 부착) ----
ai.interceptors.request.use((cfg) => {
  const cookieToken = cookies.get("accessToken");
  const lsToken = localStorage.getItem("accessToken");
  const token = cookieToken || lsToken;

  // 디버그
  console.log("[AI token]", token ? "present" : "missing");

  if (token) {
    cfg.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return cfg;
});

// ---- 응답 인터셉터 ----
ai.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    console.error("[AI ERROR]", status, err?.response?.data || err.message);
    if (status === 401) {
      cookies.remove("accessToken", { path: "/" });
      // 필요 시 리다이렉트
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---- 공통 파서 ----
const parse = (res) => {
  const ct = (res.headers["content-type"] || "").toLowerCase();
  if (ct.includes("application/json")) return res.data;
  if (res.status === 204) return null;
  return res.data;
};

// ---- 공개 메서드 ----
export const aiGet = async (endpoint, params = {}, options = {}) => {
  const res = await ai.get(endpoint, { params, ...options });
  return parse(res);
};

export const aiPost = async (endpoint, body = {}, options = {}) => {
  const res = await ai.post(endpoint, body, options);
  return parse(res);
};

export const aiDelete = async (endpoint, options = {}) => {
  const res = await ai.delete(endpoint, options);
  return parse(res);
};

// PDF 업로드(멀티파트)
export const aiPdfPost = async (endpoint, pdfFile, options = {}) => {
  const formData = new FormData();
  formData.append("file", pdfFile);

  const res = await ai.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  });
  return parse(res);
};

export default ai;
