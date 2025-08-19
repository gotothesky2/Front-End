// src/pages/Mypage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Mypage.css";
import { fetchMe, fetchTokenCount, fetchSchoolGradeSex } from "../../api/client"; // ← 고등학교/학년/성별 조회 추가

const LINKS = {
  aptitudeResult: "/TestResult",
  scoresHistory: "/GradeInput",
  departments: "/Departmentselection",
  reports: "/ReportOverview",
  tokenCharge: "/TokenCharge",
};

const cleanName = (raw) =>
  String(raw || "사용자").replace(/^\{[^}]+\}/, "").trim();

// ✅ 학기 계산: 3~7월은 1학기, 나머지는 2학기
const getSemester = () => {
  const month = new Date().getMonth() + 1; // 1~12
  return month >= 3 && month <= 7 ? "1학기" : "2학기";
};

// ✅ 성별 표시 매핑: 서버값(MAN/WOMAN 등) → 남자/여자
const sexLabel = (s) => {
  const v = String(s || "").toUpperCase();
  if (v === "MAN" || v === "M") return "남자";
  if (v === "WOMAN" || v === "FEMALE" || v === "W") return "여자";
  return "미입력";
};

const Mypage = () => {
  const [profile, setProfile] = useState({
    name: "사용자",
    email: "unknown@example.com",
  });
  const [token, setToken] = useState(0);
  const [semester] = useState(getSemester()); // 페이지 로드 시점 기준으로 고정

  // ← 여기 추가: 고등학교/학년/성별 상태
  const [highschool, setHighschool] = useState("");
  const [gradeNum, setGradeNum] = useState(null);
  const [sex, setSex] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchMe();
        const data = res?.data || {};
        setProfile({
          name: cleanName(data.name),
          email: data.email || "unknown@example.com",
        });
      } catch (err) {
        console.error("프로필 불러오기 실패:", err);
      }
    };

    const loadToken = async () => {
      try {
        const { token, error } = await fetchTokenCount();
        if (error) console.error("토큰 조회 실패:", error);
        setToken(token);
      } catch (err) {
        console.error("토큰 불러오기 실패:", err);
      }
    };

    // ← 여기 추가: 고등학교/학년/성별 조회
    const loadSchool = async () => {
      try {
        const { ok, highschool, gradeNum, sex, error } =
          await fetchSchoolGradeSex();
        if (!ok) console.error("학교/학년/성별 조회 실패:", error);
        setHighschool(highschool || "");
        setGradeNum(gradeNum ?? null);
        setSex(sex || "");
      } catch (err) {
        console.error("학교/학년/성별 불러오기 실패:", err);
      }
    };

    loadProfile();
    loadToken();
    loadSchool();
  }, []);

  return (
    <div className="mypage-container">
      <div className="mypage-cards">
        {/* 첫 번째 줄 */}
        <div className="mypage-card">
          <Link to={LINKS.aptitudeResult} className="mypage-card-title-link">
            적성 검사 결과 &gt;
          </Link>
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step1.jpg`}
            className="mypage-step"
            alt="적성 검사 결과"
          />
        </div>

        <div className="mypage-card">
          <Link to={LINKS.scoresHistory} className="mypage-card-title-link">
            성적 입력 내역 &gt;
          </Link>
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step2.jpg`}
            className="mypage-step"
            alt="성적 입력 내역"
          />
        </div>

        <div className="mypage-card">
          <Link to={LINKS.departments} className="mypage-card-title-link">
            관심 분야 / 학과 선택 &gt;
          </Link>
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step3.jpg`}
            className="mypage-step"
            alt="관심 분야/학과 선택"
          />
        </div>

        <div className="mypage-card">
          <Link to={LINKS.reports} className="mypage-card-title-link">
            레포트 모아보기 &gt;
          </Link>
          <img
            src={`${process.env.PUBLIC_URL}/img/main_step4.jpg`}
            className="mypage-step"
            alt="레포트 모아보기"
          />
        </div>

        {/* 두 번째 줄 */}
        <div className="mypage-card token">
          <div className="mypage-token">
            <img
              src={`${process.env.PUBLIC_URL}/icon/coin.svg`}
              alt="코인"
              className="icon"
            />
            <div className="mypage-token-title">보유 중인 토큰</div>
            <Link to={LINKS.tokenCharge} className="mypage-token-recharge">
              충전하기 &gt;
            </Link>
          </div>
          <div className="mypage-token-value">{token}개</div>
        </div>

        <div className="mypage-card report">
          <div className="mypage-report-title">생성 중인 레포트</div>
          <div className="mypage-report-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 1 1 0 31.831
                   a 15.9155 15.9155 0 1 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray="20, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 1 1 0 31.831
                   a 15.9155 15.9155 0 1 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage" textAnchor="middle">
                20%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* 프로필 영역 */}
      <div className="mypage-profile">
        <div className="mypage-avatar">
          <img src={`${process.env.PUBLIC_URL}/img/image 6.jpg`} alt="프로필" />
        </div>
        <div className="mypage-name">{profile.name} 님</div>
        {/* ← 연결: 고등학교 / 학년 */}
        <div className="mypage-info">· 고등학교: {highschool || "미입력"}고등학교</div>
        <div className="mypage-info">
          · 학년: {gradeNum ?? "-"}학년 {semester}
        </div>
        <div className="mypage-info">· Email: {profile.email}</div>
        <div className="mypage-info">· 성별: {sexLabel(sex)}</div>
        <button className="mypage-edit-btn">개인정보 수정</button>
      </div>
    </div>
  );
};

export default Mypage;
