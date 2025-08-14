// proxy-server.js — CareerNet proxy (Aptitude v1 + Interest v2)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

// ★ CareerNet API Key
const API_KEY = '69611c6585da333774ecf91966fc17f0';

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/health', (_req, res) => res.send('ok'));

// axios 인스턴스 (https; 필요시 http로 교체 가능)
const api = axios.create({
  baseURL: 'https://www.career.go.kr',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

// [유지] 적성검사 질문(v1)
app.get('/api/questions', async (req, res) => {
  try {
    const q = req.query.q || '21';
    const { data } = await api.get('/inspct/openapi/test/questions', {
      params: { apikey: API_KEY, q },
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch aptitude questions',
      detail: err.response?.data || err.message,
    });
  }
});

// [흥미 v2] 문항 조회
app.get('/api/interest/questions', async (req, res) => {
  try {
    const q = req.query.q || '34'; // 33 or 34
    const { data } = await api.get('/inspct/openapi/v2/test', {
      params: { apikey: API_KEY, q },
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'Interest questions fetch failed',
      detail: err.response?.data || err.message,
    });
  }
});

// [흥미 v2] 제출
app.post('/api/interest/submit', async (req, res) => {
  try {
    const payload = { ...req.body, apikey: API_KEY };
    const { data } = await api.post('/inspct/openapi/v2/report', payload);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'Interest submit failed',
      detail: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
