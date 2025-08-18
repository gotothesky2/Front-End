// src/pages/Login.jsx
import React from "react";
import "../../styles/Login.css";
import { Link } from "react-router-dom";

const Login = ({ onLogin, isLoggedIn, userName }) => {
  if (!isLoggedIn) {
    return (
      <div className="Login-container">
        <div className="Login-card">
          <div className="Login-card-content">
            <div className="Login-card-title">만나서 반가워요!</div>
            <div className="Login-card-icon">
              <img
                src={`${process.env.PUBLIC_URL}/img/image 6.jpg`}
                alt="Login Icon"
              />
            </div>
          </div>
          <div className="Login-card-footer">
            <div
              className="Login-kakao-logo"
              onClick={onLogin}
              style={{ cursor: "pointer" }}
            >
              <div className="Login-kakao-icon">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/kakao_login_icon.svg`}
                  alt="Kakao Icon"
                />
              </div>
              <span className="Login-kakao-text">로그인</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태: 실제 사용자 이름 표시
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
            <div className="profile-name">{userName} 님</div>
            <div className="profile-row-wrapper">
              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/school.svg`}
                  alt="학교"
                  className="icon"
                />
                <span>멋사고등학교</span>
              </div>
              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/vector.svg`}
                  alt="학년"
                  className="icon"
                />
                <span>3학년 2학기</span>
              </div>
              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/coin.svg`}
                  alt="코인"
                  className="icon"
                />
                <span>100 코인</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-bottom">
          <Link to="/TokenCharge" className="profile-btn left">
            충전하기
          </Link>
          <Link to="/Mypage" className="profile-btn right">
            마이페이지
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
