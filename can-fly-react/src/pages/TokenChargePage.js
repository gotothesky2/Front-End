import React, { useState } from 'react';
import '../styles/TokenChargePage.css';
import TokenModal from './TokenModal';

const TokenChargePage = () => {
  const [tab, setTab] = useState('charge');
  const [modalInfo, setModalInfo] = useState(null); // { amount: 10, price: 1000 }

  const leftPackages = [
    { amount: 1, price: 100 },
    { amount: 10, price: 1000 },
    { amount: 30, price: 3000 },
    { amount: 50, price: 5000 },
  ];
  const rightPackages = [
    { amount: 70, price: 7000 },
    { amount: 90, price: 9000 },
    { amount: 100, price: 10000 },
    { amount: 200, price: 20000 },
  ];

  const handleChargeClick = (amount, price) => {
    setModalInfo({ amount, price });
  };

  return (
    <div className="token-page-container">
      {/* 모달 */}
      {modalInfo && (
        <TokenModal
          amount={modalInfo.amount}
          price={modalInfo.price}
          onClose={() => setModalInfo(null)}
        />
      )}

      <div className="top-section">
        <div className="token-info-box">
          <img src="/img/token.png" alt="token" className="token-icon" />
          <span>보유 중인 토큰</span>
          <strong>10개</strong>
        </div>
        <div className="token-description-box">
          <h3>토큰이란?</h3>
          <p>
            직업·심리·적성, 성적, 관심학과를 바탕으로 한 맞춤형 진로·진학 분석 리포트를 받아보세요.
            토큰은 종합 분석 서비스를 이용하기 위한 재화입니다.
          </p>
        </div>
      </div>

      <div className="tab-menu">
        <span className={tab === 'charge' ? 'active' : ''} onClick={() => setTab('charge')}>토큰충전</span>
        <span className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>충전내역</span>
      </div>

      {tab === 'charge' && (
        <div className="charge-columns">
          <div className="column">
            {leftPackages.map((pkg, i) => (
              <div key={i} className="token-package">
                <div className="token-horizontal">
                  <img src="/img/token.png" alt="token" />
                  <span>토큰 {pkg.amount}개</span>
                  <button className="price-button" onClick={() => handleChargeClick(pkg.amount, pkg.price)}>
                    {pkg.price.toLocaleString()}원
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="column">
            {rightPackages.map((pkg, i) => (
              <div key={i} className="token-package">
                <div className="token-horizontal">
                  <img src="/img/token.png" alt="token" />
                  <span>토큰 {pkg.amount}개</span>
                  <button className="price-button" onClick={() => handleChargeClick(pkg.amount, pkg.price)}>
                    {pkg.price.toLocaleString()}원
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="charge-history">
          <table>
            <thead>
              <tr>
                <th>구매일자</th>
                <th>구매 수량</th>
                <th>잔여 수량</th>
                <th>결제 수단</th>
                <th>금액</th>
                <th>결제 취소</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025.05.10</td>
                <td>10개</td>
                <td>100개</td>
                <td>신용카드</td>
                <td>1,000원</td>
                <td>취소불가</td>
              </tr>
              <tr>
                <td>2025.05.03</td>
                <td>30개</td>
                <td>80개</td>
                <td>계좌간편결제</td>
                <td>3,000원</td>
                <td>취소불가</td>
              </tr>
              <tr>
                <td>2025.05.10</td>
                <td>100개</td>
                <td>100개</td>
                <td>계좌간편결제</td>
                <td>10,000원</td>
                <td>취소불가</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TokenChargePage;
