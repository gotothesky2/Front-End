// src/components/ReportModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // navigate 추가
import '../styles/ReportModal.css';
import { fetchTokenCount } from '../api/client';
import { aiPost } from '../api/aiApi'; // AI API 추가
import AIconfig from '../api/AIconfig'; // AI 설정 추가

const ReportModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // navigate 훅 추가
  
  const [grade, setGrade] = useState('3학년');
  const [term, setTerm] = useState('1학기');
  const [hasInput, setHasInput] = useState(true);

  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 학년별 차감량 (표시용)
  const costByGrade = {
    '1학년': 30,
    '2학년': 50,
    '3학년': 70,
  };
  const cost = costByGrade[grade] ?? 0;

  // 모달 열릴 때 보유 토큰 조회 (표시만)
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

  // ✅ 확인 → 실제 레포트 생성 처리
  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 학년과 학기를 숫자로 변환
      const gradeNum = parseInt(grade.replace('학년', ''));
      const termNum = parseInt(term.replace('학기', ''));
      
      // 사용자 입력 정보 수집
      const reportData = {
        reportGradeNum: gradeNum,
        reportTermNum: termNum
      };
      
      console.log('AI 레포트 생성 요청 데이터:', reportData);
      
      // AI 레포트 생성 API 호출
      const result = await aiPost(AIconfig.AIREPORT.CREATE, reportData);
      console.log('AI 레포트 생성 API 응답:', result);
      
      // aiPost는 res.data만 반환하므로 result 자체가 응답 데이터
      const responseData = result;
      
      if (responseData.success && responseData.data) {
        const reportData = responseData.data;
        console.log('생성된 레포트 데이터:', reportData);
        
        // 성공 시 생성된 레포트 페이지로 이동 (state 포함)
        navigate('/report', { 
          state: { 
            selectedReport: {
              id: reportData.id,
              type: 'aireport',
              dateText: new Date(reportData.created_at).toLocaleString('ko-KR'),
              // API 응답에서 실제 데이터 추출
              testReport: reportData.testReport,
              scoreReport: reportData.scoreReport,
              totalReport: reportData.totalReport,
              HmtID: reportData.HmtID,
              CstID: reportData.CstID,
              // 원본 데이터
              raw: reportData
            },
            fromOverview: false // 새로 생성된 레포트
          } 
        });
      } else if (responseData.success === false && responseData.error) {
        // 에러 응답 처리
        const errorMessage = responseData.error.error_message || '레포트 생성에 실패했습니다.';
        console.error('레포트 생성 에러:', responseData.error);
        setError(errorMessage);
      } else {
        console.error('예상치 못한 응답 구조:', responseData);
        throw new Error('레포트 생성에 실패했습니다.');
      }
      
    } catch (e) {
      console.error('레포트 생성 실패:', e);
      
      // API 응답에서 에러 메시지 추출 시도
      let errorMessage = '레포트 생성에 실패했습니다.';
      
      if (e.response?.data?.error?.error_message) {
        // API 에러 응답에서 메시지 추출
        errorMessage = e.response.data.error.error_message;
      } else if (e.response?.data?.message) {
        // 일반적인 API 에러 메시지
        errorMessage = e.response.data.message;
      } else if (e.message) {
        // JavaScript 에러 메시지
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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
                <select value={grade} onChange={e => setGrade(e.target.value)}>
                  <option>1학년</option>
                  <option>2학년</option>
                  <option>3학년</option>
                </select>
              </label>
              <label className="inline-label">
                <span className="inline-label-text">학기</span>
                <select value={term} onChange={e => setTerm(e.target.value)}>
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
                <input
                  type="radio"
                  checked={hasInput}
                  onChange={() => setHasInput(true)}
                /> 입력함
              </label>
              <label>
                <input
                  type="radio"
                  checked={!hasInput}
                  onChange={() => setHasInput(false)}
                /> 입력하지 않음
              </label>
            </div>
          </div>

          {/* 3. 토큰 사용 (표시용) */}
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
              disabled={loading}
            >
              {loading ? '생성 중...' : '예'}
            </button>
            <button className="btn cancel" onClick={onClose}>아니오</button>
          </div>

          {/* 에러 메시지 (현재는 표시될 일 없음) */}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
