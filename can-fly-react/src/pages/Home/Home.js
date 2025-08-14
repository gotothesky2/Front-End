import React, { useState, useEffect } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";
import { useCookies } from "react-cookie";

import api, { post, get, put, del } from "../../api/Api";
import config from "../../config"; // API endpoint 정의
import { Cookies } from "react-cookie"; // 쿠키 저장용

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자"); // 필요시 실제 사용자 이름 저장
  const [cookies, setCookie] = useCookies(["accessToken"]);

  const handleLogin = async () => {
    try {
      const redirectUrl = "http://localhost:3000";
      const oauthUrl = `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?front_redirect=${redirectUrl}`;

      window.location.href = oauthUrl;
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

  useEffect(() => {
    const url = window.location.href; // 현재 브라우저 주소
    const params = new URLSearchParams(new URL(url).search);
    const accessToken = params.get("accessToken");

    console.log("???", accessToken);

    if (accessToken) {
      setIsLoggedIn(true);
      setCookie("accessToken", accessToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  }, []);

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
