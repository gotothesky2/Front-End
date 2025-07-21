import React from "react";
import "../../styles/Login.css";

const Login = ({ onLogin, isLoggedIn }) => {
  const userName = "사용자"; // 더미 사용자 이름, API로 대체 가능
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }); // 2025년 7월 16일 수요일 (현재 시간: 2025-07-16 00:37 KST)

  if (!isLoggedIn) {
    return (
      <div className="Login-container">
        <div className="Login-card">
          <div className="Login-card-content">
            <h2 className="Login-card-title">만나서 반가워요!</h2>
            <div className="Login-card-icon">
              <img src={`${process.env.PUBLIC_URL}/img/image 6.jpg`} alt="Login Icon" />
            </div>
          </div>
          <div className="Login-card-footer">
            <div
              className="Login-kakao-logo"
              onClick={onLogin}
              style={{ cursor: "pointer" }}
            >
              <div className="Login-kakao-icon">
                <img src={`${process.env.PUBLIC_URL}/icon/kakao_login_icon.svg`} alt="Kakao Icon" />
              </div>
              <span className="Login-kakao-text">로그인</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="profile-card-container">
    <div className="profile-card">
      <div className="profile-top">
        <div className="profile-image">
          <img
            src={`${process.env.PUBLIC_URL}/img/image 6.jpg`}
            alt="프로필 이미지"
          />
        </div>
        <div className="profile-details">
          <div className="profile-name">전성환 님</div>
          <div className="profile-row">
            <img src={`${process.env.PUBLIC_URL}/icon/school.svg`} alt="학교" className="icon" />
            <span>멋사고등학교</span>
          </div>
          <div className="profile-row">
            <img src={`${process.env.PUBLIC_URL}/icon/vector.svg`} alt="학년" className="icon" />
            <span>3학년 2학기</span>
          </div>
          <div className="profile-row">
            <img src={`${process.env.PUBLIC_URL}/icon/coin.svg`} alt="코인" className="icon" />
            <span>100 코인</span>
          </div>
        </div>
      </div>


      <div className="profile-bottom">
        <button className="profile-btn left" >충전하기</button>
        <button className="profile-btn right" >마이페이지</button>
      </div>
    </div>
  </div>
);
};

export default Login;