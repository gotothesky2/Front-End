// src/api/client.js
import { Cookies } from "react-cookie";
import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

const cookies = new Cookies();

/** 토큰 정규화 + Bearer 접두사 보장 */
const asBearer = (raw) => {
  if (!raw) return "";
  return /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
};

/** 👉 provider prefix 제거 함수 추가 */
const cleanProviderPrefix = (username = "") => {
  // {kakao}홍길동 → 홍길동
  return username.replace(/^\{[a-zA-Z0-9_]+\}/, "");
};

/* ===================== 인터셉터 ===================== */
api.interceptors.request.use(
  (cfg) => {
    const fromCookie = cookies.get("accessToken");
    const fromLS =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const raw = fromCookie || fromLS;

    if (raw) {
      cfg.headers.Authorization = asBearer(raw);
    } else {
      delete cfg.headers.Authorization;
    }

    return cfg;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.error("인증 만료: 다시 로그인해주세요.");
      cookies.remove("accessToken", { path: "/" });
      try {
        localStorage.removeItem("accessToken");
      } catch {}
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ===================== 기능 헬퍼 ===================== */

/** 로그인 사용자 기본정보 (/auth/me) */
export const fetchMe = async () => {
  try {
    const res = await api.get("/auth/me");
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      error:
        err?.response?.data?.message || err?.message || "사용자 조회 실패",
    };
  }
};

/** 유저 전체정보 (/users/info)에서 토큰만 */
export const fetchTokenCount = async () => {
  try {
    const res = await api.get(config.USERS.User_info);
    const token = res?.data?.result?.token ?? 0;
    return { ok: true, token, raw: res.data };
  } catch (err) {
    return {
      ok: false,
      token: 0,
      error:
        err?.response?.data?.message || err?.message || "토큰 조회 실패",
    };
  }
};

/** 로그아웃 */
export const requestLogout = async () => {
  try {
    const res = await api.delete(config.USERS.LOGOUT);
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      error:
        err?.response?.data?.message || err?.message || "로그아웃 요청 실패",
    };
  }
};

/** 프로필 수정 */
export const updateUserProfile = async ({
  highschool,
  gradeNum,
  sex,
  zipcode,
  address,
  addressDetail,
}) => {
  try {
    const payload = { highschool, gradeNum, sex, zipcode, address, addressDetail };
    const res = await api.put("/users/me/profile", payload);
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

/** 주소 객체 평탄화 포함 조회 */
export const fetchSchoolGradeSex = async () => {
  try {
    const res = await api.get(config.USERS.User_info);
    const r = res?.data?.result || {};

    const addrObj =
      (r && typeof r.address === "object" && r.address) || null;
    const zipcode = addrObj ? addrObj.zipcode ?? "" : r.zipcode ?? "";
    const baseAddress = addrObj ? addrObj.address ?? "" : r.address ?? "";
    const addressDetail = addrObj
      ? addrObj.addressDetail ?? ""
      : r.addressDetail ?? "";

    const toStr = (v) => (v == null ? "" : typeof v === "object" ? "" : String(v));

    return {
      ok: true,
      highschool: toStr(r.highschool),
      gradeNum: r.gradeNum == null ? null : Number(r.gradeNum),
      sex: toStr(r.sex),
      zipcode: toStr(zipcode),
      address: toStr(baseAddress),
      addressDetail: toStr(addressDetail),
      raw: res.data,
    };
  } catch (err) {
    return {
      ok: false,
      highschool: "",
      gradeNum: null,
      sex: "",
      zipcode: "",
      address: "",
      addressDetail: "",
      error:
        err?.response?.data?.message ||
        err?.message ||
        "학교/학년/성별/주소 조회 실패",
    };
  }
};

/** 토큰 잔액 업데이트 */
export const updateTokenBalance = async (delta) => {
  try {
    if (typeof delta !== "number" || Number.isNaN(delta) || delta === 0) {
      throw new Error("delta는 0이 아닌 숫자여야 합니다.");
    }

    const res = await api.patch("/users/token", { amount: delta });

    const result = res?.data?.result ?? {};
    const currentCoin =
      result?.currentCoin ?? res?.data?.currentCoin ?? 0;
    const username =
      result?.username ?? res?.data?.username ?? "";

    return {
      ok: true,
      currentCoin: Number(currentCoin) || 0,
      message:
        res?.data?.message ||
        (delta > 0
          ? "코인 충전이 완료되었습니다."
          : "코인 사용이 완료되었습니다."),
      username,
      usernameClean: cleanProviderPrefix(username), // ✅ 여기서 함수 사용
      raw: res.data,
    };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "토큰 처리 실패";
    return { ok: false, currentCoin: null, message: msg, error: msg };
  }
};

/** 충전 */
export const chargeTokens = async (amount) => {
  const n = Math.abs(Number(amount));
  return updateTokenBalance(n);
};

/** 사용 */
export const useTokens = async (amount) => {
  const n = -Math.abs(Number(amount));
  return updateTokenBalance(n);
};

/** 요약 */
export const fetchUserSummary = async () => {
  try {
    const res = await api.get(config.USERS.User_info);
    const r = res?.data?.result ?? {};
    const toStr = (v) => (v == null ? "" : String(v));
    return {
      ok: true,
      name: toStr(r.name),
      gradeNum: r.gradeNum == null ? null : Number(r.gradeNum),
      email: toStr(r.email),
      sex: toStr(r.sex),
      token: r.token == null ? 0 : Number(r.token),
      raw: res.data,
    };
  } catch (err) {
    return {
      ok: false,
      name: "",
      gradeNum: null,
      email: "",
      sex: "",
      token: 0,
      error:
        err?.response?.data?.message || err?.message || "유저 요약 조회 실패",
    };
  }
};

export default api;
