// components/Departmentselection.js
import React, { useState } from 'react';
import "../../styles/Departmentselection.css";
import HeartToggle from "../Departmentselection/HeartToggle";
import AddMajorModal from "../Departmentselection/AddMajorModal";
import AddDepartmentModal from "../Departmentselection/AddDepartmentModal";

const initialRecommended = {
  계열: ["xx 계열", "00 계열"],
  학과: ["00 학과", "00 학과"],
};

const Departmentselection = () => {
  const [myDepartments, setMyDepartments] = useState({
    계열: ["00 계열"],
    학과: ["00 학과"],
  });

  const [recommended, setRecommended] = useState(initialRecommended);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [popupAddedDepartments, setPopupAddedDepartments] = useState([]);
  const [popupAddedMajors, setPopupAddedMajors] = useState([]);

  const allMajors = [
    "인문 계열",
    "사회 계열",
    "교육 계열",
    "공학 계열",
    "자연 계열",
    "의학 계열",
  ];

  const allDepartments = [
    "xx 학과",
    "□□ 학과",
    "□□ 학과",
    "□□ 학과",
    "□□ 학과",
    "□□ 학과",
    "□□ 학과",
  ];

  const handleToggle = (type, item) => {
    const isInMyList = myDepartments[type].includes(item);

    if (isInMyList) {
      setMyDepartments(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i !== item),
      }));
      setRecommended(prev => ({
        ...prev,
        [type]: [...prev[type], item],
      }));
    } else {
      setMyDepartments(prev => ({
        ...prev,
        [type]: [...prev[type], item],
      }));
      setRecommended(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i !== item),
      }));
    }
  };

  const handleMajorToggle = (item) => {
    const isInMyList = myDepartments.계열.includes(item);
    const isPopupAdded = popupAddedMajors.includes(item);

    if (isInMyList) {
      setMyDepartments(prev => ({
        ...prev,
        계열: prev.계열.filter(i => i !== item),
      }));

      if (!isPopupAdded) {
        setRecommended(prev => ({
          ...prev,
          계열: [...prev.계열, item],
        }));
      }

      setPopupAddedMajors(prev => prev.filter(i => i !== item));
    } else {
      setMyDepartments(prev => ({
        ...prev,
        계열: [...prev.계열, item],
      }));
      setRecommended(prev => ({
        ...prev,
        계열: prev.계열.filter(i => i !== item),
      }));
    }
  };

  const handleMajorToggleFromPopup = (item) => {
    const isAlreadyInMine = myDepartments.계열.includes(item);

    if (isAlreadyInMine) {
      setMyDepartments(prev => ({
        ...prev,
        계열: prev.계열.filter(i => i !== item),
      }));
      setPopupAddedMajors(prev => prev.filter(i => i !== item));
    } else {
      setMyDepartments(prev => ({
        ...prev,
        계열: [...prev.계열, item],
      }));
      setPopupAddedMajors(prev => [...prev, item]);
    }
  };

  const handleDepartmentToggle = (item) => {
    const isInMyList = myDepartments.학과.includes(item);
    const isPopupAdded = popupAddedDepartments.includes(item);

    if (isInMyList) {
      setMyDepartments(prev => ({
        ...prev,
        학과: prev.학과.filter(i => i !== item),
      }));

      if (!isPopupAdded) {
        setRecommended(prev => ({
          ...prev,
          학과: [...prev.학과, item],
        }));
      }

      setPopupAddedDepartments(prev => prev.filter(i => i !== item));
    } else {
      setMyDepartments(prev => ({
        ...prev,
        학과: [...prev.학과, item],
      }));
      setRecommended(prev => ({
        ...prev,
        학과: prev.학과.filter(i => i !== item),
      }));
    }
  };

  const handleDepartmentToggleFromPopup = (item) => {
    const isAlreadyInMine = myDepartments.학과.includes(item);

    if (isAlreadyInMine) {
      setMyDepartments(prev => ({
        ...prev,
        학과: prev.학과.filter(i => i !== item),
      }));
      setPopupAddedDepartments(prev => prev.filter(i => i !== item));
    } else {
      setMyDepartments(prev => ({
        ...prev,
        학과: [...prev.학과, item],
      }));
      setPopupAddedDepartments(prev => [...prev, item]);
    }
  };

  return (
    <div className="Departmentselection-container">
      <div className="Departmentselection-start">계열/학과 선택</div>
      <div className="Departmentselection-steps">
        {/* 계열 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">계열 목록</div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-subtitle">• 추천 계열</div>
            {recommended.계열.map((item, idx) => (
              <div className="Departmentselection-item" key={idx}>
                <HeartToggle
                  selected={false}
                  onToggle={() => handleToggle("계열", item)}
                />
                {item}
                <span>›</span>
              </div>
            ))}
          </div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-subtitle">• 나의 계열목록</div>
            {myDepartments.계열.map((item, idx) => (
              <div className="Departmentselection-item" key={idx}>
                <HeartToggle
                  selected={true}
                  onToggle={() => handleMajorToggle(item)}
                />
                {item}
                <span>›</span>
              </div>
            ))}
            <div
              className="Departmentselection-add"
              onClick={() => setShowMajorModal(true)}
            >
              +
            </div>
          </div>
        </div>

        {/* 학과 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">학과 목록</div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-subtitle">• 추천 학과</div>
            {recommended.학과.length === 0 ? (
              <div className="Departmentselection-locked">
                🔒<br />
                <span>1-2 성적부터 입력 후 추천 가능</span>
              </div>
            ) : (
              recommended.학과.map((item, idx) => (
                <div className="Departmentselection-item" key={idx}>
                  <HeartToggle
                    selected={false}
                    onToggle={() => handleToggle("학과", item)}
                  />
                  {item}
                  <span>›</span>
                </div>
              ))
            )}
          </div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-subtitle">• 나의 학과목록</div>
            {myDepartments.학과.map((item, idx) => (
              <div className="Departmentselection-item" key={idx}>
                <HeartToggle
                  selected={true}
                  onToggle={() => handleDepartmentToggle(item)}
                />
                {item}
                <span>›</span>
              </div>
            ))}
            <div
              className="Departmentselection-add"
              onClick={() => setShowDepartmentModal(true)}
            >
              +
            </div>
          </div>
        </div>

        {/* 대학 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">대학 목록</div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-locked full">
              🔒<br />
              <span>2-2 성적부터 입력 후 추천 가능</span>
            </div>
            <div className="Departmentselection-add-top">+</div>
          </div>
        </div>
      </div>

      <AddMajorModal
        show={showMajorModal}
        onClose={() => setShowMajorModal(false)}
        allMajors={allMajors}
        myMajors={myDepartments.계열}
        onToggle={handleMajorToggleFromPopup}
      />

      <AddDepartmentModal
        show={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        departments={allDepartments}
        selected={myDepartments.학과}
        onToggle={handleDepartmentToggleFromPopup}
        search={departmentSearch}
        onSearch={setDepartmentSearch}
      />
    </div>
  );
};

export default Departmentselection;
