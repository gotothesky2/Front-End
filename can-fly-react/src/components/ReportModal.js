import React, { useState, useEffect } from 'react';
import '../styles/ReportModal.css';

const ReportModal = ({ isOpen, onClose, initialTokens = 200, cost = 100 }) => {
  const [grade, setGrade] = useState('3학년');
  const [term, setTerm] = useState('1학기');
  const [hasInput, setHasInput] = useState(true);
  const [tokens, setTokens] = useState(initialTokens);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) setError('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (tokens < cost) {
      setError('토큰 부족으로 레포트 생성에 실패하였습니다');
      return;
    }
    // TODO: 실제 생성 API 호출
    onClose();
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

          {/* 3. 토큰 사용 */}
          <div className="section">
            <h3>3. 토큰 사용</h3>
            <div className="tokens">
              <div className="token-item">
                <div className="token-label">보유 토큰</div>
                <div className="token-value">{tokens}개</div>
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
            <button className="btn confirm" onClick={handleConfirm}>예</button>
            <button className="btn cancel" onClick={onClose}>아니오</button>
          </div>

          {/* 에러 메시지 */}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

