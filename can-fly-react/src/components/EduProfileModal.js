// src/components/EduProfileModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/EduProfileModal.css";
const normalize = (v) => (v ?? "").toString();

const EduProfileModal = ({
  open,
  onClose,
  onSave,
  defaultSchool = "",
  defaultGrade = "",
  defaultZipcode = "",
  defaultAddress = "",
  defaultAddressDetail = "",
}) => {
  const [school, setSchool] = useState(defaultSchool);
  const [grade, setGrade] = useState(defaultGrade);
  const [zipcode, setZipcode] = useState(defaultZipcode);
  const [address, setAddress] = useState(defaultAddress);
  const [addressDetail, setAddressDetail] = useState(defaultAddressDetail);

  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  useEffect(() => {
    // 모달 열릴 때 기본값 반영(부모에서 바뀔 수 있으니 동기화)
    if (!open) return;
    setSchool(defaultSchool);
    setGrade(defaultGrade);
    setZipcode(defaultZipcode);
    setAddress(defaultAddress);
    setAddressDetail(defaultAddressDetail);
  }, [open, defaultSchool, defaultGrade, defaultZipcode, defaultAddress, defaultAddressDetail]);

  if (!open) return null;

  const handleSearchPostCode = () => {
    // window.daum.Postcode는 index.html에 스크립트가 삽입되어 있어야 동작
    if (!window.daum || !window.daum.Postcode) {
      alert("우편번호 검색 스크립트가 로드되지 않았습니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        setZipcode(normalize(data.zonecode));
        setAddress(normalize(data.roadAddress || data.jibunAddress));
        // 상세주소 포커스 주기
        setTimeout(() => {
          const el = document.getElementById("edu-address-detail");
          if (el) el.focus();
        }, 0);
      },
    }).open();
  };

  const handleSubmit = () => {
    onSave?.({
      school: normalize(school),
      grade: normalize(grade),
      zipcode: normalize(zipcode),
      address: normalize(address),
      addressDetail: normalize(addressDetail),
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
          {/* 학력 */}
          <div className="edu-field">
            <input
              id="edu-school"
              className="edu-input"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder=""
            />
            <label className="edu-label" htmlFor="edu-school">고등학교</label>
            
          </div>

          <div className="edu-field">
            <input
              id="edu-grade"
              className="edu-input"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder=""
            />
            <label className="edu-label" htmlFor="edu-grade">학년</label>
            
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
              placeholder=""
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
