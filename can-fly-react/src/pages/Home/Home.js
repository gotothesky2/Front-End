// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";
import { useCookies } from "react-cookie";

import config from "../../config"; // (쓰지 않아도 되지만 남겨둠)
import EduProfileModal from "../../components/EduProfileModal";

// ✅ axios 헬퍼로 /auth/me 호출 (Mypage가 쓰던 것과 동일한 경로)
// 만약 경로가 다르면 "../../api/client"에서 fetchMe를 export 하도록 해주세요.
import { fetchMe } from "../../api/client";

const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");
const cleanName = (raw) => (String(raw || "사용자").replace(/^\{[^}]+\}/, "").trim() || "사용자");

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const [showEduModal, setShowEduModal] = useState(false);

  const handleLogin = async () => {
    try {
      const redirectUrl = "http://localhost:3000";
      const oauthUrl =
        `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?front_redirect=${redirectUrl}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("로그인 실패:", error?.response || error?.message);
      alert("로그인 실패! 다시 시도해주세요.");
    }
  };

  const handleLogout = () => {
    removeCookie("accessToken", { path: "/" });
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUserName("사용자");
  };

  // 🔑 토큰으로 즉시 /auth/me 호출 (axios 헬퍼 사용)
  const loadMe = useCallback(async () => {
    try {
      const res = await fetchMe(); // { success, data: { name, ... } } 형태 가정
      const name = cleanName(
        res?.data?.name ??
        res?.name ??
        res?.username ??
        res?.nickname ??
        res?.nickName ??
        res?.user?.name
      );
      setUserName(name);
      setIsLoggedIn(true);
    } catch (e) {
      console.error("/auth/me 실패:", e?.response?.status || e?.message || e);
    }
  }, []);

  // 1) URL 쿼리 → 토큰 저장 + needsProfile 처리 + ✅ 저장 직후 loadMe() 실행
  useEffect(() => {
    const parsed = new URL(window.location.href);
    const params = new URLSearchParams(parsed.search);
    const tokenFromUrl = params.get("accessToken");
    const needsProfile = params.get("needsProfile");

    if (tokenFromUrl) {
      const bare = normalizeToken(tokenFromUrl);
      // 쿠키 & localStorage 저장
      setCookie("accessToken", bare, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      localStorage.setItem("accessToken", bare);
      // axios 인터셉터가 localStorage의 토큰을 바로 읽을 수 있어야 함
      loadMe(); // ✅ 토큰 저장 '직후' 곧바로 /auth/me
    } else if (cookies.accessToken) {
      const bare = normalizeToken(cookies.accessToken);
      localStorage.setItem("accessToken", bare); // axios용 동기화
      loadMe(); // ✅ 쿠키에 이미 있으면 바로 /auth/me
    }

    if (String(needsProfile).toLowerCase() === "true") {
      setShowEduModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // (선택/안전망) 토큰/로그인 상태 변화 시에도 한 번 더 시도
  useEffect(() => {
    const bare = normalizeToken(
      cookies.accessToken || localStorage.getItem("accessToken")
    );
    if (bare && !isLoggedIn) {
      loadMe();
    }
  }, [cookies.accessToken, isLoggedIn, loadMe]);

  const handleSaveEdu = ({ school, grade, zipcode, address, addressDetail }) => {
    console.log("저장된 학력/주소:", { school, grade, zipcode, address, addressDetail });
    // TODO: 필요시 서버 저장 API 호출
  };

  return (
    <div className="home-container">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Banner />
      <div className="home-content">
        <Main isLoggedIn={isLoggedIn} />
        <Login onLogin={handleLogin} isLoggedIn={isLoggedIn} userName={userName} />
      </div>

      <EduProfileModal
        open={showEduModal}
        onClose={() => setShowEduModal(false)}
        onSave={handleSaveEdu}
      />
    </div>
  );
};

export default Home;
