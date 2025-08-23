// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from "react";
import "../../styles/Home.css";
import Banner from "./Banner";
import Main from "./Main";
import Login from "./Login";
import Header from "../../components/Header";
import { useCookies } from "react-cookie";

import config from "../../config"; // 사용하지 않으면 삭제해도 무방
import EduProfileModal from "../../components/EduProfileModal";

import { fetchMe, requestLogout, updateUserProfile } from "../../api/client";

const normalizeToken = (t) => (t ? t.replace(/^Bearer\s+/i, "").trim() : "");
const cleanName = (raw) =>
  (String(raw || "사용자").replace(/^\{[^}]+\}/, "").trim() || "사용자");

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
   const [cookies, setCookie, removeCookie] = useCookies(["accessToken", "isShowEduModal"]);
  const [showEduModal, setShowEduModal] = useState(false);

  const handleLogin = async () => {
    try {
      const redirectUrl = "http://localhost:3000";
      const oauthUrl = `http://canfly.ap-northeast-2.elasticbeanstalk.com/oauth2/authorization/kakao?front_redirect=${redirectUrl}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("로그인 실패:", error?.response || error?.message);
      alert("로그인 실패! 다시 시도해주세요.");
    }
  };

  // 서버 로그아웃 → 로컬 토큰 삭제 → 상태 초기화 → 홈으로 리다이렉트
  const handleLogout = async () => {
    try {
      await requestLogout(); // DELETE /users/logout
    } catch (e) {
      console.warn("서버 로그아웃 실패(로컬만 정리):", e?.message || e);
    } finally {
      removeCookie("accessToken", { path: "/", sameSite: "lax" });
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUserName("사용자");
      window.location.href = "/"; // 새로고침 & URL 파라미터 제거
    }
  };

  // /auth/me로 사용자명 조회
  const loadMe = useCallback(async () => {
    try {
      const res = await fetchMe(); // { data: { name, ... } } 가정
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

  // 1) URL 쿼리에서 accessToken 수신 시 저장 → 즉시 /auth/me
  useEffect(() => {
    const parsed = new URL(window.location.href);
    const params = new URLSearchParams(parsed.search);
    const tokenFromUrl = params.get("accessToken");
    const needsProfile = params.get("needsProfile");

    if (tokenFromUrl) {
      const bare = normalizeToken(tokenFromUrl);
      setCookie("accessToken", bare, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
      localStorage.setItem("accessToken", bare);
      loadMe();
    } else if (cookies.accessToken) {
      const bare = normalizeToken(cookies.accessToken);
      localStorage.setItem("accessToken", bare);
      loadMe();
    }

    if (String(needsProfile).toLowerCase() === "true") {
      setShowEduModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회만

  // 2) 안전망: 토큰이 있는데 로그인 false면 한 번 더 시도
  useEffect(() => {
    const bare = normalizeToken(
      cookies.accessToken || localStorage.getItem("accessToken")
    );
    if (bare && !isLoggedIn) {
      loadMe();
    }
  }, [cookies.accessToken, isLoggedIn, loadMe]);

  // 학력/주소/성별 저장 → PUT /users/me/profile
  const handleSaveEdu = async ({
    highschool,
    gradeNum,
    zipcode,
    address,
    addressDetail,
    sex,
  }) => {
    const { ok, error } = await updateUserProfile({
      highschool,
      gradeNum, // client.js에서 gradeNum으로 매핑됨
      zipcode,
      address,
      addressDetail,
      sex,
    });

    if (!ok) {
      alert(`프로필 저장 실패: ${error}`);
      return;
    }
    alert("프로필이 저장되었습니다.");
      setCookie("isShowEduModal", true, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });

    setShowEduModal(false);
    // 필요 시 최신 사용자 정보 재조회
    // await loadMe();
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
        open={!cookies.isShowEduModal && showEduModal}
        onClose={() => setShowEduModal(false)}
        onSave={handleSaveEdu}
      />
    </div>
  );
};

export default Home;
