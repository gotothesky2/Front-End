import React, { useState } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";

import api, { post, get, put, del } from "../../api/Api";
import config from "../../config"; // API endpoint 정의
import { Cookies } from "react-cookie";     // 쿠키 저장용

const cookies = new Cookies();

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자"); // 필요시 실제 사용자 이름 저장

  // 로그인 처리 함수
  const handleLogin = async () => {
    try {
    const redirectUrl = 'http://localhost:3000';
     const oauthUrl = `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?redirect_uri=${redirectUrl}`;
      
     window.location.href = oauthUrl;
     setIsLoggedIn(true);
    } catch (error) {
      console.error("로그인 실패:", error.response || error.message);
      alert("로그인 실패! 다시 시도해주세요.");
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    cookies.remove("accessToken", { path: "/" });
    setIsLoggedIn(false);
  };

  return (
    <div className="home-container">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Banner />
      <div className="home-content">
        <Main isLoggedIn={isLoggedIn} />
        <Login onLogin={handleLogin} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
};

export default Home;