// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";
import { useCookies } from "react-cookie";

import { fetchMe } from "../../api/client"; // ← axios 헬퍼 사용
import { API_BASE } from "../../api/client"; // (선택) 확인용

// 토큰 정규화 유틸
const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

  const handleLogin = async () => {
    try {
      const redirectUrl = "http://localhost:3000";
      // 백엔드 스펙에 맞게 파라미터 사용 (front_redirect 또는 redirect_uri)
      const oauthUrl = `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?front_redirect=${redirectUrl}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("로그인 실패:", error.response || error.message);
      alert("로그인 실패! 다시 시도해주세요.");
    }
  };

  const handleLogout = () => {
    removeCookie("accessToken", { path: "/" });
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUserName("사용자");
  };

  // 1) URL의 accessToken 회수 → 쿠키 + localStorage 저장
  useEffect(() => {
    const parsed = new URL(window.location.href);
    const params = new URLSearchParams(parsed.search);
    const fromUrl = params.get("accessToken");

    if (fromUrl) {
      const bare = normalizeToken(fromUrl);

      // 쿠키 저장 (7일)
      setCookie("accessToken", bare, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      // localStorage 저장 (axios 인터셉터가 읽음)
      localStorage.setItem("accessToken", bare);

      setIsLoggedIn(true);

      // (원하면 URL 깔끔하게 만들기)
      // window.history.replaceState({}, "", parsed.origin + parsed.pathname);
    } else if (cookies.accessToken) {
      // 쿠키에 이미 존재하면 localStorage에도 동기화
      const bare = normalizeToken(cookies.accessToken);
      localStorage.setItem("accessToken", bare);
      setIsLoggedIn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회만

  // 2) 로그인/토큰 변동 시 /auth/me로 이름 조회
  useEffect(() => {
    const token = cookies.accessToken || localStorage.getItem("accessToken");
    if (!isLoggedIn || !token) return;

    let cancelled = false;

    const loadMe = async () => {
      try {
        const json = await fetchMe(); // axios client 사용 (Authorization 자동 첨부)
        // 예: { success:true, data: { name:"{kakao}전성환", ... } }
        const raw =
          json?.data?.name ??
          json?.name ??
          json?.username ??
          json?.nickname ??
          json?.nickName ??
          json?.user?.name ??
          "사용자";

        const cleaned = String(raw).replace(/^\{[^}]+\}/, "").trim() || "사용자";
        if (!cancelled) setUserName(cleaned);
      } catch (e) {
        console.error("/auth/me 실패:", e?.response?.status, e?.message);
        // 실패해도 로그인 상태는 유지, 이름만 기본값
      }
    };

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, cookies.accessToken]);

  return (
    <div className="home-container">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Banner />
      <div className="home-content">
        <Main isLoggedIn={isLoggedIn} />
        <Login onLogin={handleLogin} isLoggedIn={isLoggedIn} userName={userName} />
      </div>
    </div>
  );
};

export default Home;
