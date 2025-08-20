// src/api/client.js
import axios from "axios";

/** ─────────────────────────────────────────────────────────────
 *  베이스 URL (고정값)
 *  - 사용자 정보 서버: http://43.200.79.118
 *  - 토큰/코인 서버:   http://canfly.ap-northeast-2.elasticbeanstalk.com
 *  ────────────────────────────────────────────────────────────*/
export const API_BASE = "http://43.200.79.118";
export const COIN_BASE = "http://canfly.ap-northeast-2.elasticbeanstalk.com";

/** 공통: 토큰 정규화 */
const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");

/** Axios 인스턴스 */
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

/** 매 요청 Authorization 자동 첨부 */
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

/** /auth/me */
export const fetchMe = async () => {
  const res = await client.get("/auth/me");
  return res.data;
};

/** /users/info → 토큰 */
export const fetchTokenCount = async () => {
  try {
    const res = await coinClient.get("/users/info");
    const token = res?.data?.result?.token ?? 0;
    return { token, raw: res.data };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "토큰 조회 실패";
    return { token: 0, error: msg };
  }
};

/** 서버 로그아웃 */
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

/** 프로필 수정 (PUT /users/me/profile)
 *  - 키 통일: gradeNum 사용
 */
export const updateUserProfile = async ({
  highschool,
  gradeNum,
  sex,
  zipcode,
  address,
  addressDetail,
}) => {
  try {
    const payload = {
      highschool,
      gradeNum,
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
        err?.response?.data?.message ||
        err?.message ||
        "프로필 수정 실패",
    };
  }
};

// ✅ 주소 객체(result.address)를 안전하게 평탄화해서 문자열로 반환
export const fetchSchoolGradeSex = async () => {
  try {
    const res = await coinClient.get("/users/info");
    const r = res?.data?.result || {};

    // 서버가 address를 중첩 객체로 줄 수도 있음: { zipcode, address, addressDetail, empty }
    const addrObj = (r && typeof r.address === "object" && r.address) || null;

    const zipcode = addrObj
      ? (addrObj.zipcode ?? "")
      : (r.zipcode ?? "");

    const baseAddress = addrObj
      ? (addrObj.address ?? "")
      : (r.address ?? "");

    const addressDetail = addrObj
      ? (addrObj.addressDetail ?? "")
      : (r.addressDetail ?? "");

    // 문자열로 강제 변환 (숫자/널/객체 대비)
    const toStr = (v) =>
      v == null
        ? ""
        : typeof v === "object"
        ? ""
        : String(v);

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
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "학교/학년/성별/주소 조회 실패";
    return {
      ok: false,
      highschool: "",
      gradeNum: null,
      sex: "",
      zipcode: "",
      address: "",
      addressDetail: "",
      error: msg,
    };
  }
};


export default client;
