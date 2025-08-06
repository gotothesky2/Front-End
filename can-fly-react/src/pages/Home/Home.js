import React, { useState } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";

import { post } from "../../Api";           // axios wrapper
import config from "../../config";          // API endpoint 정의
import { Cookies } from "react-cookie";     // 쿠키 저장용

const cookies = new Cookies();

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");

  // 로그인 처리 함수
  const handleLogin = async () => {
    try {
      const redirectUrl = "https://can-fly.netlify.app/";
      const oauthUrl = `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?redirect_uri=${redirectUrl}`;

      // 소셜 로그인 URL로 이동
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("로그인 실패:", error.response || error.message);
      alert("로그인 실패! 다시 시도해주세요.");
    }
  };

  // 로그인 콜백 시 토큰 받아서 저장 (선택적으로 분리 가능)
  const handleTokenExchange = async (code) => {
    try {
      const response = await post(config.TOKEN.GENERATE, { code });
      const accessToken = response.accessToken;

      cookies.set("accessToken", accessToken, {
        path: "/",
        maxAge: 60 * 60 * 24, // 1일
      });

      setIsLoggedIn(true);
    } catch (error) {
      console.error("토큰 발급 실패:", error.response || error.message);
      alert("로그인 토큰 처리 중 실패했습니다.");
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
