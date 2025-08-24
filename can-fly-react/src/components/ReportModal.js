// src/components/ReportModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ReportModal.css';
import {
  fetchTokenCount,
  useTokens as apiUseTokens, // PATCH /users/token  (amount: -cost)
} from '../api/client';
import { createAiReport } from '../api/realaireport';
import { useNavigate } from 'react-router-dom';

const ReportModal = ({ isOpen, onClose }) => {
  const [grade, setGrade] = useState('1학년');
  const [term, setTerm] = useState('1학기');
  const [hasInput, setHasInput] = useState(true);

  const [tokens, setTokens] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // 학년별 차감량
  const costByGrade = {
    '1학년': 30,
    '2학년': 50,
    '3학년': 70,
  };
  const cost = costByGrade[grade] ?? 0;

  const toGradeNum = (g) => Number(String(g).match(/[1-3]/)?.[0] || 0);  // '3학년' -> 3
  const toTermNum  = (t) => Number(String(t).match(/[1-2]/)?.[0] || 0);  // '1학기' -> 1

  // 모달 열릴 때 보유 토큰 조회
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    (async () => {
      setLoading(true);
      try {
        const { ok, token, error } = await fetchTokenCount();
        if (!ok) {
          console.warn('토큰 조회 실패:', error);
          setTokens(0);
        } else {
          setTokens(Number(token || 0));
        }
      } catch (e) {
        console.error('토큰 조회 중 오류:', e);
        setTokens(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  // ✅ '예' 클릭 → (1) 토큰 확인 → (2) AiReport 생성 → (3) 토큰 차감 → (4) 상세 페이지로 이동
  const handleConfirm = async () => {
    setError('');
    if (tokens < cost) {
      setError('토큰 부족으로 레포트 생성에 실패하였습니다');
      return;
    }

    const reportGradeNum = toGradeNum(grade);
    const reportTermNum  = toTermNum(term);
    if (!reportGradeNum || !reportTermNum) {
      setError('학년/학기 선택을 확인해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // (2) AiReport 생성
      // 필요 시 서버 스펙에 맞게 payload 키를 조정하세요. (예: HmtID/CstID 필요하면 포함)
      const makeRes = await createAiReport({ reportGradeNum, reportTermNum, hasInput });
      if (!makeRes?.success) {
        setError(makeRes?.message || '레포트 생성 실패');
        setSubmitting(false);
        return;
      }

      const created = makeRes.data; // 서버가 내려준 생성된 보고서(POST 응답 스키마)
      // 응답에서 id를 유연하게 추출
      const reportId =
        created?.id ??
        created?.Id ??
        created?.reportId ??
        created?.reportID ??
        created?.data?.id; // 혹시 중첩 구조일 대비

      if (!reportId) {
        setError('생성 응답에 report id가 없습니다.');
        setSubmitting(false);
        return;
      }

      // (3) 토큰 차감
      const tokenRes = await apiUseTokens(cost);
      if (!tokenRes.ok) {
        setError(tokenRes.message || '토큰 차감 실패');
        setSubmitting(false);
        return;
      }

      // (4) ✅ 로컬스토리지 쓰지 않고, 상세 페이지(/report/:id)로 이동
      navigate(`/report/${reportId}`);
    } catch (err) {
      console.error('레포트 생성 에러:', err);
      setError('레포트 생성 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
        <div className="report-modal-header">
          <h2>레포트 생성하기</h2>
          <button className="report-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="report-modal-body">
          {/* 1. 학년·학기 선택 */}
          <div className="section">
            <h3>1. 학년 및 학기를 선택</h3>
            <div className="selects">
              <label className="inline-label">
                <span className="inline-label-text">학년</span>
                <select value={grade} onChange={e => setGrade(e.target.value)} disabled={submitting}>
                  <option>1학년</option>
                  <option>2학년</option>
                  <option>3학년</option>
                </select>
              </label>
              <label className="inline-label">
                <span className="inline-label-text">학기</span>
                <select value={term} onChange={e => setTerm(e.target.value)} disabled={submitting}>
                  <option>1학기</option>
                  <option>2학기</option>
                </select>
              </label>
            </div>
          </div>

          {/* 2. 관심 계열 입력 여부 */}
          <div className="section">
            <h3>2. 관심 계열 및 학과 입력 여부</h3>
            <div className="radios">
              <label>
                <input type="radio" checked={hasInput} onChange={() => setHasInput(true)} disabled={submitting} /> 입력함
              </label>
              <label>
                <input type="radio" checked={!hasInput} onChange={() => setHasInput(false)} disabled={submitting} /> 입력하지 않음
              </label>
            </div>
          </div>

          {/* 3. 토큰 사용 */}
          <div className="section">
            <h3>3. 토큰 사용</h3>
            <div className="tokens">
              <div className="token-item">
                <div className="token-label">보유 토큰</div>
                <div className="token-value">
                  {loading ? '조회 중…' : `${tokens}개`}
                </div>
              </div>
              <div className="token-item">
                <div className="token-label">생성 시 차감 토큰</div>
                <div className="token-value">{cost}개</div>
              </div>
            </div>
          </div>

          {/* 확인 문구 */}
          <p className="confirm-text">
            {grade} {term} 레포트를 생성하시겠습니까?
          </p>

          {/* 버튼 */}
          <div className="buttons">
            <button
              className="btn confirm"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? '생성 중…' : '예'}
            </button>
            <button className="btn cancel" onClick={onClose} disabled={submitting}>아니오</button>
          </div>

          {/* 에러 메시지 */}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

