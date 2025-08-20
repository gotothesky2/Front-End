// src/components/EduProfileModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/EduProfileModal.css";
const normalize = (v) => (v ?? "").toString();

const EduProfileModal = ({
  open,
  onClose,
  onSave,
  defaultHighschool = "",
  defaultGradeNum = "",
  defaultZipcode = "",
  defaultAddress = "",
  defaultAddressDetail = "",
  defaultSex = "",
}) => {
  const [highschool, setHighschool] = useState(defaultHighschool);
  const [gradeNum, setGradeNum] = useState(defaultGradeNum);
  const [zipcode, setZipcode] = useState(defaultZipcode);
  const [address, setAddress] = useState(defaultAddress);
  const [addressDetail, setAddressDetail] = useState(defaultAddressDetail);
  const [sex, setSex] = useState(defaultSex);

  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setHighschool(defaultHighschool);
    setGradeNum(defaultGradeNum);
    setZipcode(defaultZipcode);
    setAddress(defaultAddress);
    setAddressDetail(defaultAddressDetail);
    setSex(defaultSex);
  }, [
    open,
    defaultHighschool,
    defaultGradeNum,
    defaultZipcode,
    defaultAddress,
    defaultAddressDetail,
    defaultSex,
  ]);

  if (!open) return null;

  const handleSearchPostCode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("우편번호 검색 스크립트가 로드되지 않았습니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        setZipcode(normalize(data.zonecode));
        setAddress(normalize(data.roadAddress || data.jibunAddress));
        setTimeout(() => {
          const el = document.getElementById("edu-address-detail");
          if (el) el.focus();
        }, 0);
      },
    }).open();
  };

  const handleSubmit = () => {
    const g = normalize(gradeNum);
    // ✅ 안전 검증: 1/2/3만 허용
    if (!["1", "2", "3"].includes(g)) {
      alert("학년은 1, 2, 3 중에서 선택해주세요.");
      return;
    }

    onSave?.({
      highschool: normalize(highschool),
      gradeNum: g, // 항상 "1" | "2" | "3"
      zipcode: normalize(zipcode),
      address: normalize(address),
      addressDetail: normalize(addressDetail),
      sex: normalize(sex),
    });
    onClose?.();
  };

  return (
    <div
      className="edu-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target.classList.contains("edu-backdrop")) onClose?.();
      }}
    >
      <div
        className="edu-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edu-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="edu-header">
          <h2 id="edu-title">학력 정보</h2>
          <button className="edu-close" aria-label="닫기" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="edu-body">
          {/* 고등학교 */}
          <div className="edu-field">
            <input
              id="edu-school"
              className="edu-input"
              type="text"
              value={highschool}
              onChange={(e) => setHighschool(e.target.value)}
            />
            <label className="edu-label" htmlFor="edu-school">고등학교</label>
          </div>

          {/* 학년 (1~3만) */}
          <div className="edu-field">
            <select
              id="edu-grade"
              className="edu-input"
              value={gradeNum ?? ""}
              onChange={(e) => setGradeNum(e.target.value)}
            >
              <option value="">선택</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <label className="edu-label" htmlFor="edu-grade">학년</label>
          </div>

          {/* 성별 */}
          <div className="edu-field">
            <span className="edu-label">성별</span>
            <div className="edu-radio-group">
              <label className="edu-radio-label">
                <input
                  type="radio"
                  name="sex"
                  value="MAN"
                  checked={sex === "MAN"}
                  onChange={(e) => setSex(e.target.value)}
                />
                <span className="edu-radio-text">남자(MAN)</span>
              </label>
              <label className="edu-radio-label">
                <input
                  type="radio"
                  name="sex"
                  value="WOMAN"
                  checked={sex === "WOMAN"}
                  onChange={(e) => setSex(e.target.value)}
                />
                <span className="edu-radio-text">여자(WOMAN)</span>
              </label>
            </div>
          </div>

          {/* 주소 */}
          <div className="edu-section-title"></div>

          <div className="edu-field">
            <label className="edu-label" htmlFor="edu-zipcode">우편번호</label>
            <input
              id="edu-zipcode"
              className="edu-input"
              type="text"
              value={zipcode}
              readOnly
            />
            <button type="button" className="edu-mini-btn" onClick={handleSearchPostCode}>
              우편번호찾기
            </button>
          </div>

          <div className="edu-field">
            <label className="edu-label" htmlFor="edu-address">기본주소</label>
            <input
              id="edu-address"
              className="edu-input-long"
              type="text"
              value={address}
              readOnly
            />
          </div>

          <div className="edu-field">
            <label className="edu-label" htmlFor="edu-address-detail">상세주소</label>
            <input
              id="edu-address-detail"
              className="edu-input-long"
              type="text"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세 주소를 입력해주세요"
            />
          </div>
        </div>

        <div className="edu-footer">
          <button className="edu-submit" onClick={handleSubmit}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default EduProfileModal;
