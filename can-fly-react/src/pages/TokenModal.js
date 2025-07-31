import React, { useState } from 'react';
import '../styles/TokenModal.css';

const TokenModal = ({ onClose, amount, price }) => {
  const [selected, setSelected] = useState('account');

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <span>결제</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="price-section">
            <strong>{price.toLocaleString()}원</strong>
            <div className="token">🪙 토큰 {amount}개</div>
          </div>

          <div className="pay-amount">결제수단 <span>{price.toLocaleString()}원</span></div>

          <div className="payment-methods">
            <label>
              <input type="radio" name="payment" value="account" checked={selected === 'account'} onChange={() => setSelected('account')} />
              계좌간편결제
            </label>
            {!selected || selected === 'account' ? (
              <div className="pay-box account-box">
                <div className="register-box"><button>➕ 계좌등록하기</button></div>
              </div>
            ) : null}

            <label>
              <input type="radio" name="payment" value="card" checked={selected === 'card'} onChange={() => setSelected('card')} />
              카드간편결제
            </label>
            {selected === 'card' ? (
              <div className="pay-box card-box">
                <div className="register-box"><button>➕ 카드등록하기</button></div>
              </div>
            ) : null}

            <label>
              <input type="radio" name="payment" value="general" checked={selected === 'general'} onChange={() => setSelected('general')} />
              일반결제
            </label>
          </div>

          <div className="pay-detail">
            <div className="row">
              결제상세 <span>{price.toLocaleString()}원</span>
            </div>
            <div className="row detail-desc">
              <span className="selected-method">
                {selected === 'account'
                  ? '계좌간편결제'
                  : selected === 'card'
                  ? '카드간편결제'
                  : '일반결제'}
              </span>
              <span>{price.toLocaleString()}원</span>
            </div>
          </div>

          <div className="agreement">
            거래정보제공동의! <a href="#">입시혁명</a><br />
            주문 내용을 확인하였으며, 정보제공 등에 동의합니다.
          </div>
        </div>

        <button className="pay-button">결제하기</button>
      </div>
    </div>
  );
};

export default TokenModal;
