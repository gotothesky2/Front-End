import React, { useState } from 'react';
import "../../styles/Departmentselection.css";
import "../../styles/AddDepartmentModal.css";
import HeartToggle from "../Departmentselection/HeartToggle";
import AddMajorModal from "../Departmentselection/AddMajorModal";
import AddDepartmentModal from "../Departmentselection/AddDepartmentModal";
import MajorDepartmentModal from "../Departmentselection/MajorDepartmentModal";
import DepartmentUniversityModal from "../Departmentselection/DepartmentUniversityModal";
import AddUniversityModal from "../Departmentselection/AddUniversityModal";

const initialRecommended = {
  계열: [],
  학과: [],
};

const Departmentselection = () => {
  const [myDepartments, setMyDepartments] = useState({
    계열: [],
    학과: [],
  });

  const [recommended, setRecommended] = useState(initialRecommended);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [popupAddedDepartments, setPopupAddedDepartments] = useState([]); // 팝업에서 추가한 학과
  const [popupAddedMajors, setPopupAddedMajors] = useState([]); // 팝업에서 추가한 계열
  const [selectedMajorForDepartments, setSelectedMajorForDepartments] = useState(null);
  const [selectedDepartmentForUniversities, setSelectedDepartmentForUniversities] = useState(null);

  const allMajors = [
    "인문 계열", "사회 계열", "교육 계열",
    "공학 계열", "자연 계열", "의학 계열"
  ];

  const allDepartments = [
    "xx 학과", "□□ 학과", "□□ 학과",
    "□□ 학과", "□□ 학과", "□□ 학과",
    "□□ 학과", "oo 학과",
  ];

  const filteredDepartmentsByMajor = {
    "인문 계열": ["국어국문학과", "영어영문학과", "사학과", "철학과", "문예창작과", "중어중문학과", "불어불문학과"],
    "사회 계열": ["경영학과", "경제학과", "정치외교학과", "사회학과", "심리학과", "미디어커뮤니케이션학과"],
    "교육 계열": ["교육학과", "유아교육과", "특수교육과", "체육교육과"],
    "공학 계열": ["기계공학과", "전기전자공학과", "컴퓨터공학과", "건축공학과", "화학공학과", "산업공학과"],
    "자연 계열": ["수학과", "물리학과", "화학과", "생물학과", "통계학과"],
    "의학 계열": ["의학과", "치의학과", "한의학과", "간호학과", "약학과", "물리치료학과"]
  };

  // 공통 토글 함수 (계열 / 학과 둘 다)
  const handleToggle = (type, item) => {
    const isInMyList = myDepartments[type].includes(item);
    const isPopupAdded =
      type === "계열"
        ? popupAddedMajors.includes(item)
        : popupAddedDepartments.includes(item);

    if (isInMyList) {
      // 나의 목록 → 제거
      setMyDepartments(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i !== item),
      }));

      // 팝업에서 추가한 항목이 아니면 추천으로 복귀
      if (!isPopupAdded) {
        setRecommended(prev => ({
          ...prev,
          [type]: [...prev[type], item],
        }));
      }

      // popupAdded 배열에서도 제거
      if (type === "계열") {
        setPopupAddedMajors(prev => prev.filter(i => i !== item));
      } else {
        setPopupAddedDepartments(prev => prev.filter(i => i !== item));
      }
    } else {
      // 추천 → 나의 목록
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
      setPopupAddedMajors(prev => [...prev, item]); // 팝업 추가 기록
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
      setPopupAddedDepartments(prev => [...prev, item]); // 팝업 추가 기록
    }
  };

  const handleOpenUniversityPopup = (department) => {
    setSelectedDepartmentForUniversities(department);
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
                <HeartToggle selected={false} onToggle={() => handleToggle("계열", item)} />
                {item}
                <span style={{ cursor: "pointer" }} onClick={() => setSelectedMajorForDepartments(item)}>›</span>
              </div>
            ))}
          </div>
          <div className="Departmentselection-section">
            <div className="Departmentselection-subtitle">• 나의 계열목록</div>
            {myDepartments.계열.map((item, idx) => (
              <div className="Departmentselection-item" key={idx}>
                <HeartToggle selected={true} onToggle={() => handleToggle("계열", item)} />
                {item}
                <span style={{ cursor: "pointer" }} onClick={() => setSelectedMajorForDepartments(item)}>›</span>
              </div>
            ))}
            <div className="Departmentselection-add" onClick={() => setShowMajorModal(true)}>+</div>
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
                <div
                  className="Departmentselection-item"
                  key={idx}
                  onClick={() => handleOpenUniversityPopup(item)}
                >
                  <HeartToggle
                    selected={false}
                    onToggle={(e) => {
                      e.stopPropagation();
                      handleToggle("학과", item);
                    }}
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
              <div
                className="Departmentselection-item"
                key={idx}
                onClick={() => handleOpenUniversityPopup(item)}
              >
                <HeartToggle
                  selected={true}
                  onToggle={(e) => {
                    e.stopPropagation();
                    handleToggle("학과", item);
                  }}
                />
                {item}
                <span>›</span>
              </div>
            ))}
            <div className="Departmentselection-add" onClick={() => setShowDepartmentModal(true)}>+</div>
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
            <div
              className="Departmentselection-add-top"
              onClick={() => setShowUniversityModal(true)}
            >
              +
            </div>
          </div>
        </div>
      </div>

      {/* 팝업들 */}
      <AddMajorModal
        show={showMajorModal}
        onClose={() => setShowMajorModal(false)}
        allMajors={allMajors}
        myMajors={myDepartments.계열}
        onToggle={handleMajorToggleFromPopup}
        onOpenMajorDepartments={(major) => {
          setShowMajorModal(false);
          setSelectedMajorForDepartments(major);
        }}
      />

      <AddDepartmentModal
        show={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        departments={allDepartments}
        selected={myDepartments.학과}
        onToggle={handleDepartmentToggleFromPopup}
        search={departmentSearch}
        onSearch={setDepartmentSearch}
        onOpenUniversityPopup={handleOpenUniversityPopup}
      />

      <MajorDepartmentModal
        show={!!selectedMajorForDepartments}
        onClose={() => setSelectedMajorForDepartments(null)}
        title={selectedMajorForDepartments}
        departments={filteredDepartmentsByMajor[selectedMajorForDepartments] || []}
        selected={myDepartments.학과}
        onToggle={handleDepartmentToggleFromPopup}
      />

      <DepartmentUniversityModal
        show={!!selectedDepartmentForUniversities}
        onClose={() => setSelectedDepartmentForUniversities(null)}
        departmentName={selectedDepartmentForUniversities}
      />

      <AddUniversityModal
        show={showUniversityModal}
        onClose={() => setShowUniversityModal(false)}
      />
    </div>
  );
};

export default Departmentselection;
