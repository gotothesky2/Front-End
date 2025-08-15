// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://canfly.ap-northeast-2.elasticbeanstalk.com',
  timeout: 10000,
});

// 매 요청마다 토큰 붙이기
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default client;
