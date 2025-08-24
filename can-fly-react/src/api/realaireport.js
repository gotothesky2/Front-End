// src/api/aireport.js
import ai from './aiApi';
import AIconfig from './AIconfig';

// 공통 파서(파일/204 대비) — 프로젝트에 이미 있으면 그거 써도 됨
const parse = (res) => res?.data ?? null;

// Ai Report 생성(POST)
export const createAiReport = async (payload) => {
  // payload 안에 HmtID, CstID 등 서버에서 요구하는 '대문자' 키를 그대로 전달하세요.
  const res = await ai.post('/aireport', payload);
  //(정영모) 이거 링크가 /ai/report로 되어있었는데 스웨거 상에서는 /aireport 였었음. 링크 수정했더니 정상작동
  return parse(res); // 예: { id: 123, ...나머지 리포트 내용 }
};

// Ai Report 단건 조회(GET)
export const fetchAiReportById = async (id) => {
  const res = await ai.get(`/aireport/${id}`);
  //(정영모) 이거 링크가 /ai/report로 되어있었는데 스웨거 상에서는 /aireport 였었음. 링크 수정했더니 정상작동
  return parse(res); // POST 응답과 동일한 스키마라고 했으니 그대로 사용
};