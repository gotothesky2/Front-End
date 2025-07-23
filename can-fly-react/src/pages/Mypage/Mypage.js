import React from "react";
import "../../styles/Mypage.css";

const Mypage = () => {
  return (
    <div className="mypage-container">
      <div className="mypage-cards">
        {/* 첫 번째 줄 */}
        <div className="mypage-card">
          적성 검사 결과 &gt;
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step1.jpg`}
            className="mypage-step"
          />
        </div>
        <div className="mypage-card">
          성적 입력 내역 &gt;
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step2.jpg`}
            className="mypage-step"
          />
        </div>
        <div className="mypage-card">
          관심 분야 / 학과 선택 &gt;
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step3.jpg`}
            className="mypage-step"
          />
        </div>
        <div className="mypage-card">
          레포트 모아보기 &gt;
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step4.jpg`}
            className="mypage-step"
          />
        </div>
          

        {/* 두 번째 줄 */}
        <div className="mypage-card token">
          <div className="mypage-token">
            <img src={`${process.env.PUBLIC_URL}/icon/coin.svg`} alt="코인" className="icon" />
            <div className="mypage-token-title">보유 중인 토큰</div>
            <div className="mypage-token-recharge">충전하기 &gt;</div>
          </div>
          <div className="mypage-token-value">100개</div>
        </div>

        <div className="mypage-card report">
          <div className="mypage-report-title">생성 중인 레포트</div>
          <div className="mypage-report-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 1 1 0 31.831
                   a 15.9155 15.9155 0 1 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray="20, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 1 1 0 31.831
                   a 15.9155 15.9155 0 1 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage" textAnchor="middle">
                20%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* 프로필 영역 */}
      <div className="mypage-profile">
        <div className="mypage-avatar"><img src={`${process.env.PUBLIC_URL}/img/image 6.jpg`} alt="Login Icon" /></div>
        <div className="mypage-name">전성환 님</div>
        <div className="mypage-info">· 고등학교: 멋사고등학교</div>
        <div className="mypage-info">· 학년: 3학년 2학기</div>
        <div className="mypage-info">· Email: tgidgks@naver.com</div>
        <div className="mypage-info">· 생일: 2001.01.30</div>
        <button className="mypage-edit-btn">개인정보 수정</button>
      </div>
    </div>
  );
};

export default Mypage;
