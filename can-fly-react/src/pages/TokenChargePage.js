// src/pages/TokenChargePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/TokenChargePage.css';
import TokenModal from './TokenModal';
import { get, patch } from '../api/Api';
import config from '../config';

const TokenChargePage = () => {
  const [tab, setTab] = useState('charge');

  // 보유 토큰
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // 결제 모달
  const [modalInfo, setModalInfo] = useState(null); // { amount: number, price: number }
  const [submitting, setSubmitting] = useState(false);

  // 충전 내역
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 하드코딩 패키지(디자인 유지)
  const leftPackages = [
    { id: 'pkg_1', amount: 1, price: 100 },
    { id: 'pkg_10', amount: 10, price: 1000 },
    { id: 'pkg_30', amount: 30, price: 3000 },
    { id: 'pkg_50', amount: 50, price: 5000 },
  ];
  const rightPackages = [
    { id: 'pkg_70', amount: 70, price: 7000 },
    { id: 'pkg_90', amount: 90, price: 9000 },
    { id: 'pkg_100', amount: 100, price: 10000 },
    { id: 'pkg_200', amount: 200, price: 20000 },
  ];

  // ─────────────────────────────────────────
  // 유틸: 서버에서 내려올 수 있는 다양한 필드명 → 표준화
  // ─────────────────────────────────────────
  const normalizeHistory = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((it, idx) => {
      const created =
        it.createdAt || it.created_at || it.date || it.datetime || it.paidAt || null;
      const qty = it.amount ?? it.coin ?? it.coins ?? it.delta ?? null;
      const balanceAfter =
        it.balanceAfter ?? it.balance ?? it.currentCoin ?? it.coinAfter ?? null;
      const method = it.method ?? it.paymentMethod ?? it.pg ?? '-';
      const price =
        typeof it.price === 'number'
          ? it.price
          : (typeof it.amountKRW === 'number' ? it.amountKRW : null);
      const cancelable =
        typeof it.cancelable === 'boolean'
          ? it.cancelable
          : (typeof it.canCancel === 'boolean' ? it.canCancel : false);

      return {
        id: it.orderId || it.id || `h_${idx}`,
        createdAt: created ? new Date(created) : null,
        amount: qty,
        balanceAfter,
        method,
        price,
        cancelable,
      };
    });
  };

  // ─────────────────────────────────────────
  // 보유 토큰 조회: GET /users/me (config.USERS.DELETE_ME 경로를 GET으로)
  // ─────────────────────────────────────────
  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const me = await get(config.USERS.DELETE_ME); // 서버가 GET 허용한다고 가정
      const current = me?.result?.currentCoin ?? me?.result?.coin ?? 0;
      setBalance(Number(current));
    } catch (e) {
      console.warn('[balance] 조회 실패', e);
    } finally {
      setLoadingBalance(false);
    }
  };

  // ─────────────────────────────────────────
  // 충전 내역 조회: 여러 후보를 순차 시도 (실 서버 경로 확정되면 하나로 바꿔도 됨)
  // ─────────────────────────────────────────
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // 1) 명시적 history 엔드포인트 후보들
      const base = config.API_URL;
      const candidates = [
        `${base}/users/token/history`,
        `${base}/users/token/logs`,
        `${base}/users/token/transactions`,
        // 4) 혹시 GET /users/token 이 배열 내역을 주는 서버일 수도…
        config.USERS.USE_RECHARGE,
      ];

      let list = null;
      for (const url of candidates) {
        try {
          const res = await get(url);
          // 응답이 {result: [...] } or [...] or {data: [...] } 등일 수 있음
          const arr =
            Array.isArray(res) ? res :
            (Array.isArray(res?.result) ? res.result :
            (Array.isArray(res?.data) ? res.data : null));
          if (arr) {
            list = arr;
            break;
          }
        } catch (e) {
          // 계속 다음 후보로
        }
      }
      setHistory(normalizeHistory(list || []));
    } catch (e) {
      console.error('[history] 조회 실패', e);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 최초 진입 시 보유 토큰
  useEffect(() => {
    fetchBalance();
  }, []);

  // 탭이 history로 바뀌면 내역 갱신
  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab]);

  // ─────────────────────────────────────────
  // 결제 플로우
  // ─────────────────────────────────────────
  const openChargeModal = (amount, price) => {
    setModalInfo({ amount, price });
  };

  // 모달에서 "결제/확인" 클릭 시만 PATCH 호출
  const confirmCharge = async () => {
    if (!modalInfo) return;
    setSubmitting(true);
    try {
      const res = await patch(config.USERS.USE_RECHARGE, { amount: modalInfo.amount });
      const newBalance = res?.result?.currentCoin;
      if (typeof newBalance !== 'undefined') {
        setBalance(Number(newBalance));
      }
      alert('충전이 완료되었습니다.');
      setModalInfo(null);
      if (tab === 'history') fetchHistory();
    } catch (e) {
      console.error('[charge] 실패', e);
      alert('충전에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // prettier 표시용
  const balanceText = useMemo(
    () => (loadingBalance ? '…' : `${balance}개`),
    [loadingBalance, balance]
  );

  return (
    <div className="token-page-container">
      {/* 결제 모달 */}
      {modalInfo && (
        <TokenModal
          amount={modalInfo.amount}
          price={modalInfo.price}
          onClose={() => setModalInfo(null)}
          onConfirm={confirmCharge}   // ← 모달의 확인 버튼에서 이 콜백 호출해야 함
          loading={submitting}
        />
      )}

      <div className="top-section">
        <div className="token-info-box">
          <img src="/img/token.png" alt="token" className="token-icon" />
          <span>보유 중인 토큰</span>
          <strong>{balanceText}</strong>
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
              <div key={pkg.id ?? i} className="token-package">
                <div className="token-horizontal">
                  <img src="/img/token.png" alt="token" />
                  <span>토큰 {pkg.amount}개</span>
                  <button
                    className="price-button"
                    onClick={() => openChargeModal(pkg.amount, pkg.price)}
                  >
                    {pkg.price.toLocaleString()}원
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="column">
            {rightPackages.map((pkg, i) => (
              <div key={pkg.id ?? i} className="token-package">
                <div className="token-horizontal">
                  <img src="/img/token.png" alt="token" />
                  <span>토큰 {pkg.amount}개</span>
                  <button
                    className="price-button"
                    onClick={() => openChargeModal(pkg.amount, pkg.price)}
                  >
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
              {loadingHistory && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>불러오는 중…</td></tr>
              )}
              {!loadingHistory && history.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>내역이 없습니다.</td></tr>
              )}
              {!loadingHistory && history.map((h) => (
                <tr key={h.id}>
                  <td>{h.createdAt ? h.createdAt.toLocaleDateString('ko-KR') : '-'}</td>
                  <td>{h.amount ?? '-'}개</td>
                  <td>{h.balanceAfter ?? '-'}개</td>
                  <td>{h.method ?? '-'}</td>
                  <td>{typeof h.price === 'number' ? h.price.toLocaleString() : '-'}원</td>
                  <td>{h.cancelable ? '취소가능' : '취소불가'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TokenChargePage;
