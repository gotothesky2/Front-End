import { Cookies } from "react-cookie";
import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.API_URL,
});

const cookies = new Cookies();

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("로그인 만료됨. 다시 로그인해주세요.");
      cookies.remove("accessToken", { path: "/" });
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// GET
export const get = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await api.get(endpoint, {
      params,
      ...options,
    });

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST
export const post = async (endpoint, data, options = {}) => {
  try {
    const response = await api.post(endpoint, data, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT
export const put = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.put(endpoint, data, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE
export const del = async (endpoint, options = {}) => {
  try {
    const response = await api.delete(endpoint, options);

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      throw new Error("서버 응답이 올바르지 않습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
