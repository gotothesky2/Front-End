// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Login.css";
import { Link } from "react-router-dom";
import {
  fetchTokenCount,
  fetchSchoolGradeSex,
  fetchUserSummary,
} from "../../api/client";

const Login = ({ onLogin, isLoggedIn, userName }) => {
  const [token, setToken] = useState(0);
  const [semester, setSemester] = useState("1학기");
  const [school, setSchool] = useState({ highschool: "", gradeNum: null });
  const [name, setName] = useState("");

  // ✅ 이름 접두사 정리:
  //   - "{kakao}홍길동", "[kakao] 홍길동", "(kakao) 홍길동", "kakao: 홍길동", "kakao 홍길동" 등 제거
  //   - "google", "naver"도 동일 처리 (대소문자 무시)
  const cleanName = (raw) => {
    if (!raw) return "";
    const s = String(raw).trim();
    return s
      .replace(/^\s*[\{\[\(]?\s*(kakao|naver|google)\s*[\}\]\)]?\s*[:\-]?\s*/i, "")
      .trim();
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isLoggedIn) return;

      // 1) 이름/요약
      const sum = await fetchUserSummary();
      if (isMounted) {
        if (!sum.ok) console.error("이름 조회 실패:", sum.error);
        setName(cleanName(sum.name || ""));
      }

      // 2) 토큰
      const { token: tokenCount, error: tokenErr } = await fetchTokenCount();
      if (isMounted) {
        if (tokenErr) console.error("토큰 조회 실패:", tokenErr);
        setToken(Number(tokenCount ?? 0));
      }

      // 3) 학교/학년
      const { ok, highschool, gradeNum, error: schoolErr } =
        await fetchSchoolGradeSex();
      if (isMounted) {
        if (!ok && schoolErr) console.error("학교/학년 조회 실패:", schoolErr);
        setSchool({
          highschool: highschool || "",
          gradeNum: gradeNum ?? null,
        });
      }
    };

    load();

    // 학기 계산 (3~7월: 1학기, 나머지: 2학기)
    const month = new Date().getMonth() + 1;
    setSemester(month >= 3 && month <= 7 ? "1학기" : "2학기");

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // 로그인 전
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

  // 학교명 중복 "고등학교" 방지
  const displayHighschool = (() => {
    const n = (school.highschool || "").trim();
    if (!n) return "고등학교 미입력";
    return /고등학교$/.test(n) ? n : `${n}고등학교`;
  })();

  // ✅ DB 이름 최우선, prop도 클린 후 fallback
  const displayName = (() => {
    const apiName = cleanName(name).trim();
    const propName = cleanName(userName).trim();
    if (apiName) return apiName;
    if (propName && propName !== "사용자") return propName;
    return "사용자";
  })();

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
            <div className="profile-name">{displayName} 님</div>

            <div className="profile-row-wrapper">
              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/school.svg`}
                  alt="학교"
                  className="icon"
                />
                <span>{displayHighschool}</span>
              </div>

              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/vector.svg`}
                  alt="학년"
                  className="icon"
                />
                <span>
                  {school.gradeNum ?? "-"}학년 {semester}
                </span>
              </div>

              <div className="profile-row">
                <img
                  src={`${process.env.PUBLIC_URL}/icon/coin.svg`}
                  alt="코인"
                  className="icon"
                />
                <span>{Number.isFinite(token) ? token : 0} 토큰</span>
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
