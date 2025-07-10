import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';


const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header data-page={isHome ? 'Home' : ''}>
      <div className="header-logo">
        <Link to="/" aria-label="입시혁명 홈페이지로 이동">
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="입시혁명 로고" className="logo-image" />
          <span>입시혁명</span> 
        </Link>
      </div>
    </header>
  );
};

export default Header;