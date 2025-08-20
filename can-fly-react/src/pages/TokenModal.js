// src/components/TokenModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/TokenModal.css';

const TokenModal = ({ onClose, onConfirm, amount, price, loading = false }) => {
  const [selected, setSelected] = useState('card');
  const clickedRef = useRef(false);

  const methodLabel =
    selected === 'account' ? '계좌간편결제'
      : selected === 'card' ? '카드간편결제'
      : '일반결제';

  const handlePay = () => {
    if (loading) return;
    if (clickedRef.current) return;
    clickedRef.current = true;
    try { onConfirm && onConfirm(); }
    finally { setTimeout(() => (clickedRef.current = false), 800); }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') handlePay(); if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading]);

  return (
    <div className="tm-overlay" role="dialog" aria-modal="true">
      <div className="tm-modal">
        <div className="tm-header">
          <span className="tm-title">결제</span>
          <button className="tm-close" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="tm-body">
          <div className="tm-price">
            <div className="tm-price-left">
              <strong>{price.toLocaleString()}원</strong>
              <div className="tm-token-line">
                <span className="tm-token-dot" />
                <span>토큰 {amount}개</span>
              </div>
            </div>
          </div>

          <div className="tm-row tm-between tm-mt24">
            <span className="tm-section-title">결제수단</span>
            <span className="tm-amount-blue">{price.toLocaleString()}원</span>
          </div>

          <div className="tm-card tm-mt12">
            <label className="tm-radio-row">
              <input type="radio" name="pay" value="account" checked={selected === 'account'} onChange={() => setSelected('account')} />
              <span>계좌간편결제</span>
            </label>
            <div className="tm-divider" />
            <label className="tm-radio-row">
              <input type="radio" name="pay" value="card" checked={selected === 'card'} onChange={() => setSelected('card')} />
              <span>카드간편결제</span>
            </label>
            {selected === 'card' && (
              <div className="tm-register-wrap">
                <button type="button" className="tm-chevron" aria-label="prev">‹</button>
                <button type="button" className="tm-register-btn" disabled>
                  <span className="tm-plus">+</span>
                  <span>카드등록하기</span>
                </button>
                <button type="button" className="tm-chevron" aria-label="next">›</button>
              </div>
            )}
            <div className="tm-divider tm-mt12" />
            <label className="tm-radio-row">
              <input type="radio" name="pay" value="general" checked={selected === 'general'} onChange={() => setSelected('general')} />
              <span>일반결제</span>
            </label>
          </div>

          <div className="tm-row tm-between tm-mt24">
            <span className="tm-section-title">결제상세</span>
            <span className="tm-amount-blue">{price.toLocaleString()}원</span>
          </div>

          <div className="tm-card tm-mt12">
            <div className="tm-row tm-between">
              <span>{methodLabel}</span>
              <span>{price.toLocaleString()}원</span>
            </div>
          </div>

          <div className="tm-card tm-mt16">
            <span>거래정보제공 동의: <span className="tm-link">입시혁명</span></span>
          </div>

          <p className="tm-footnote">주문 내용을 확인하였으며, 정보제공 등에 동의합니다.</p>
        </div>

        <button type="button" className={`tm-pay-btn${loading ? ' tm-disabled' : ''}`} onClick={handlePay} disabled={loading}>
          {loading ? '결제 중…' : '결제하기'}
        </button>
      </div>
    </div>
  );
};

export default TokenModal;