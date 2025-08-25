// ✅ departmentApi.js
import axios from "axios";

const BASE_URL = "https://www.can-fly.shop/";

const getAccessToken = () => {
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^Bearer\s+/i, "").trim() : null;
};

// ✅ 계열
export const fetchAllMajors = async () => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/field/all`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};

export const fetchLikedMajors = async () => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/field/like`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};

export const toggleMajorBookmark = async (fieldId) => {
  const token = getAccessToken();
  const response = await axios.post(
    `${BASE_URL}/field/${fieldId}/like/toggle`,
    {},
    { headers: { Accept: "*/*", Authorization: `Bearer ${token}` } }
  );
  return response.data.result === true;
};

export const fetchDepartmentsByField = async (fieldId) => {
  const token = getAccessToken();
  const response = await axios.get(
    `${BASE_URL}/field/${fieldId}/like/majors`,
    { headers: { Accept: "*/*", Authorization: `Bearer ${token}` } }
  );
  return response.data.result;
};

// ✅ 학과
export const fetchAllDepartments = async () => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/major/all`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};

export const fetchLikedDepartments = async () => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/major/like`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};

export const toggleDepartmentBookmark = async (departmentId) => {
  const token = getAccessToken();
  const response = await axios.post(
    `${BASE_URL}/major/${departmentId}/like/toggle`,
    {},
    { headers: { Accept: "*/*", Authorization: `Bearer ${token}` } }
  );
  return response.data.result === true;
};

export const fetchUniversitiesByMajor = async (majorId) => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/major/${majorId}/like/universities`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};

// ✅ 대학 + 전공 북마크 목록
export const fetchBookmarkedMajorUniversities = async () => {
  const token = getAccessToken();
  const response = await axios.get(`${BASE_URL}/major/univ/list`, {
    headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
  });
  return response.data.result;
};
// ✅ 전공-대학 즐겨찾기 토글 (POST)
export const toggleMajorUniversityBookmark = async (majorId, univId) => {
  const token = getAccessToken();
  const response = await axios.post(
    `${BASE_URL}/major/${majorId}/like/univ/${univId}/toggle`,
    {},
    { headers: { Accept: "*/*", Authorization: `Bearer ${token}` } }
  );
  return response.data.result === true;
};

