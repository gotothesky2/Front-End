import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = ({ isLoggedIn, onLogout }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // 부모 컴포넌트에서 제공된 로그아웃 함수 호출
    }
  };

  return (
    <header data-page={isHome ? "Home" : ""}>
      <div className="header-logo">
        <Link to="/" aria-label="입시혁명 홈페이지로 이동">
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="입시혁명 로고"
            className="logo-image"
          />
          <span>입시혁명</span>
        </Link>
      </div>
      {isLoggedIn && (
        <div className="header-logout">
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;