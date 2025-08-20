// src/pages/Mypage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Mypage.css";
import {
  fetchMe,
  fetchTokenCount,
  fetchSchoolGradeSex,
  updateUserProfile,
} from "../../api/client";
import EduProfileModal from "../../components/EduProfileModal";

const LINKS = {
  aptitudeResult: "/TestResult",
  scoresHistory: "/GradeInput",
  departments: "/Departmentselection",
  reports: "/ReportOverview",
  tokenCharge: "/TokenCharge",
};

const cleanName = (raw) =>
  String(raw || "사용자").replace(/^\{[^}]+\}/, "").trim();

const getSemester = () => {
  const month = new Date().getMonth() + 1;
  return month >= 3 && month <= 7 ? "1학기" : "2학기";
};

const sexLabel = (s) => {
  const v = String(s || "").toUpperCase();
  if (v === "MAN" || v === "M") return "남자";
  if (v === "WOMAN" || v === "FEMALE" || v === "W") return "여자";
  return "미입력";
};

const Mypage = () => {
  const [profile, setProfile] = useState({ name: "사용자", email: "unknown@example.com" });
  const [token, setToken] = useState(0);
  const [semester] = useState(getSemester());

  // 고등학교/학년/성별/주소
  const [highschool, setHighschool] = useState("");
  const [gradeNum, setGradeNum] = useState(null);
  const [sex, setSex] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

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

    const loadSchool = async () => {
      try {
        const { ok, highschool, gradeNum, sex, zipcode, address, addressDetail, error } =
          await fetchSchoolGradeSex();
        if (!ok) console.error("학교/학년/성별/주소 조회 실패:", error);
        setHighschool(highschool || "");
        setGradeNum(gradeNum ?? null);
        setSex(sex || "");
        setZipcode(zipcode || "");
        setAddress(address || "");
        setAddressDetail(addressDetail || "");
      } catch (err) {
        console.error("학교/학년/성별/주소 불러오기 실패:", err);
      }
    };

    loadProfile();
    loadToken();
    loadSchool();
  }, []);

  // 모달 저장 → 서버 업데이트
  const handleSaveEdu = async ({
    highschool,
    gradeNum,
    zipcode,
    address,
    addressDetail,
    sex,
  }) => {
    if (saving) return;
    setSaving(true);
    try {
      const { ok, error } = await updateUserProfile({
        highschool,
        gradeNum,
        zipcode,
        address,
        addressDetail,
        sex,
      });
      if (!ok) {
        alert(`프로필 저장 실패: ${error}`);
        return;
      }

      // 화면 즉시 반영
      setHighschool(highschool || "");
      setGradeNum(gradeNum ? Number(gradeNum) : null);
      setSex(sex || "");
      setZipcode(zipcode || "");
      setAddress(address || "");
      setAddressDetail(addressDetail || "");

      alert("프로필이 저장되었습니다.");
      setOpenEdit(false);
    } catch (e) {
      console.error("프로필 저장 중 오류:", e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="mypage-info">· 고등학교: {highschool || "미입력"}고등학교</div>
        <div className="mypage-info">· 학년: {gradeNum ?? "-"}학년 {semester}</div>
        <div className="mypage-info">· Email: {profile.email}</div>
        <div className="mypage-info">· 성별: {sexLabel(sex)}</div>
        <button className="mypage-edit-btn" onClick={() => setOpenEdit(true)}>
          개인정보 수정
        </button>
      </div>

      {/* 개인정보 수정 모달 */}
      <EduProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSave={handleSaveEdu}
        defaultHighschool={highschool}
        defaultGradeNum={gradeNum ?? ""}
        defaultZipcode={zipcode}
        defaultAddress={address}
        defaultAddressDetail={addressDetail}
        defaultSex={sex}
      />
    </div>
  );
};

export default Mypage;
