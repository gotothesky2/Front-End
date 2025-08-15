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
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

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
    removeCookie("accessToken", { path: "/" });
    setIsLoggedIn(false);
    setUserName("사용자");
  };

  // 1) URL에서 accessToken 회수 → 쿠키 저장
  // (요청에 따라 URL 정리/토큰 가리기는 하지 않습니다.)
  useEffect(() => {
    const url = window.location.href; // 현재 브라우저 주소
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    const accessToken = params.get("accessToken");

    if (accessToken) {
      // 로그인 상태 설정
      setIsLoggedIn(true);

      // 쿠키 저장 (7일)
      setCookie("accessToken", accessToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      // ⛔️ 토큰을 URL에서 제거하지 않습니다. (replaceState 제거)
    } else if (cookies.accessToken) {
      // 이미 쿠키에 토큰이 있으면 로그인 유지
      setIsLoggedIn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // 2) 쿠키의 토큰이 생기거나 로그인 상태가 바뀌면 /auth/me로 이름 조회
  useEffect(() => {
    const token = cookies.accessToken;
    if (!isLoggedIn || !token) return;

    let ignore = false;

    const fetchMe = async () => {
      try {
        // config.API_URL이 있다면 사용, 없으면 서버 기본값
        const base =
          (config && (config.API_URL || config.API_BASE_URL)) ||
          "http://canfly.ap-northeast-2.elasticbeanstalk.com";

        const res = await fetch(`${base}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (ignore) return;

        // 백엔드 응답 필드명에 맞춰 이름 추출 (여러 케이스 대비)
        const name =
          data?.name ||
          data?.username ||
          data?.nickname ||
          data?.nickName ||
          data?.user?.name ||
          "사용자";

        setUserName(name);
      } catch (err) {
        console.error("내 정보 조회 실패:", err);
        // 실패 시 처리 필요하면 아래 주석 해제
        // removeCookie("accessToken", { path: "/" });
        // setIsLoggedIn(false);
        // setUserName("사용자");
      }
    };

    fetchMe();
    return () => {
      ignore = true;
    };
  }, [isLoggedIn, cookies.accessToken, removeCookie]);

  return (
    <div className="home-container">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Banner />
      <div className="home-content">
        <Main isLoggedIn={isLoggedIn} />
        {/* userName을 Login으로 전달 */}
        <Login onLogin={handleLogin} isLoggedIn={isLoggedIn} userName={userName} />
      </div>
    </div>
  );
};

export default Home;
