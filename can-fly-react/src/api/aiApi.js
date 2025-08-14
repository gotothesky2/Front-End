// src/api/aiApi.js
import axios from "axios";
import { Cookies } from "react-cookie";

const ai = axios.create({
  baseURL: "http://43.200.79.118", // 예: 'http://43.200.79.118'  (docs 주소 아님!)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

const cookies = new Cookies();

// 요청 인터셉터: accessToken 있으면 붙이기
ai.interceptors.request.use((cfg) => {
  const token = cookies.get("accessToken");
  if (token) cfg.headers.Authorization = `${token}`;
  return cfg;
});

// 응답 인터셉터: 401 처리(필요 시 재로그인)
ai.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      cookies.remove("accessToken", { path: "/" });
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// 공통 파서(파일/204 대비)
const parse = (res) => {
  const ct = (res.headers["content-type"] || "").toLowerCase();
  if (ct.includes("application/json")) return res.data;
  if (res.status === 204) return null;
  return res.data;
};

export const aiGet = async (endpoint, params = {}, options = {}) => {
  const res = await ai.get(endpoint, { params, ...options });
  return parse(res);
};

export default ai;
