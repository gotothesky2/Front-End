// ✅ 전체 코드: 나의 대학목록에 북마크된 전공-대학쌍 표시

import React, { useState, useEffect } from 'react';
import "../../styles/Departmentselection.css";
import "../../styles/AddDepartmentModal.css";
import HeartToggle from "../Departmentselection/HeartToggle";
import AddMajorModal from "../Departmentselection/AddMajorModal";
import AddDepartmentModal from "../Departmentselection/AddDepartmentModal";
import MajorDepartmentModal from "../Departmentselection/MajorDepartmentModal";
import DepartmentUniversityModal from "../Departmentselection/DepartmentUniversityModal";
import AddUniversityModal from "../Departmentselection/AddUniversityModal";
import {
  fetchLikedMajors,
  toggleMajorBookmark,
  fetchLikedDepartments,
  toggleDepartmentBookmark,
  fetchAllDepartments,
  fetchBookmarkedMajorUniversities,
  toggleMajorUniversityBookmark, // ✅ 추가
} from "../../api/departmentApi";

const Departmentselection = () => {
  const [myDepartments, setMyDepartments] = useState({ 계열: [], 학과: [] });
  const [departmentNameToIdMap, setDepartmentNameToIdMap] = useState({});
  const [myMajorUnivs, setMyMajorUnivs] = useState([]);

  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [popupAddedDepartments, setPopupAddedDepartments] = useState([]);
  const [popupAddedUniversities, setPopupAddedUniversities] = useState([]);
  const [selectedMajorForDepartments, setSelectedMajorForDepartments] = useState(null);
  const [selectedDepartmentForUniversities, setSelectedDepartmentForUniversities] = useState(null);

  const nameToIdMap = {
    "인문 계열": 1,
    "사회 계열": 2,
    "교육 계열": 3,
    "공학 계열": 4,
    "자연 계열": 5,
    "의학 계열": 6,
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [likedMajors, likedDepartments, allDepartments, majorUnivs] = await Promise.all([
          fetchLikedMajors(),
          fetchLikedDepartments(),
          fetchAllDepartments(),
          fetchBookmarkedMajorUniversities(),
        ]);

        const nameToId = {};
        allDepartments.forEach((d) => {
          nameToId[d.name] = d.id;
        });

        setDepartmentNameToIdMap(nameToId);
        setMyDepartments({
          계열: likedMajors.map((m) => m.name),
          학과: likedDepartments.map((d) => d.name),
        });
        setMyMajorUnivs(majorUnivs);
      } catch (e) {
        console.error("초기 데이터 불러오기 실패:", e);
      }
    };
    loadData();
  }, []);

  const handleToggle = async (type, item) => {
    if (type === "계열") {
      const id = nameToIdMap[item];
      if (!id) return;
      try {
        await toggleMajorBookmark(id);
        const isIn = myDepartments.계열.includes(item);
        setMyDepartments((prev) => ({
          ...prev,
          계열: isIn ? prev.계열.filter(i => i !== item) : [...prev.계열, item],
        }));
      } catch (e) {
        console.error("계열 토글 실패:", e);
      }
    } else if (type === "학과") {
      const id = departmentNameToIdMap[item];
      if (!id) return;
      try {
        await toggleDepartmentBookmark(id);
        const isIn = myDepartments.학과.includes(item);
        setMyDepartments((prev) => ({
          ...prev,
          학과: isIn ? prev.학과.filter(i => i !== item) : [...prev.학과, item],
        }));
      } catch (e) {
        console.error("학과 토글 실패:", e);
      }
    }
  };

  const handleDepartmentToggleFromPopup = (item) => {
    const isIn = myDepartments.학과.includes(item);
    setMyDepartments((prev) => ({
      ...prev,
      학과: isIn ? prev.학과.filter(i => i !== item) : [...prev.학과, item],
    }));
    setPopupAddedDepartments((prev) =>
      isIn ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleUniversityToggleFromPopup = (item) => {
    const isExist = popupAddedUniversities.includes(item);
    setPopupAddedUniversities((prev) =>
      isExist ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleUniversityBookmarkToggle = async (majorId, univId) => {
    try {
      await toggleMajorUniversityBookmark(majorId, univId);
      setMyMajorUnivs((prev) =>
        prev.filter((item) => !(item.majorId === majorId && item.univId === univId))
      );
    } catch (e) {
      console.error("전공-대학 북마크 토글 실패:", e);
    }
  };

  const handleOpenUniversityPopup = (department) => {
    setSelectedDepartmentForUniversities(department);
  };

  return (
    <div className="Departmentselection-container">
      <div className="Departmentselection-steps">

        {/* 계열 목록 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">나의 계열 목록</div>
          <div className="Departmentselection-section">
            {myDepartments.계열.map((item, idx) => (
              <div className="Departmentselection-item" key={idx} onClick={() => setSelectedMajorForDepartments(item)}>
                <HeartToggle
                  selected={true}
                  onToggle={(e) => {
                    e.stopPropagation();
                    handleToggle("계열", item);
                  }}
                />
                <span className="department-name">{item}</span>
                <span className="arrow">›</span>
              </div>
            ))}
            <div className="Departmentselection-add" onClick={() => setShowMajorModal(true)}>+</div>
          </div>
        </div>

        {/* 학과 목록 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">나의 학과 목록</div>
          <div className="Departmentselection-section">
            {myDepartments.학과.map((item, idx) => (
              <div className="Departmentselection-item" key={idx} onClick={() => handleOpenUniversityPopup(item)}>
                <HeartToggle
                  selected={true}
                  onToggle={(e) => {
                    e.stopPropagation();
                    handleToggle("학과", item);
                  }}
                />
                {item}<span>›</span>
              </div>
            ))}
            <div className="Departmentselection-add" onClick={() => setShowDepartmentModal(true)}>+</div>
          </div>
        </div>

        {/* 대학 목록 */}
        <div className="Departmentselection-step">
          <div className="Departmentselection-step-title">나의 대학 목록</div>
          <div className="Departmentselection-section">
            {myMajorUnivs.map((item, idx) => (
              <div className="Departmentselection-item" key={idx}>
                <HeartToggle
                  selected={true}
                  onToggle={() => handleUniversityBookmarkToggle(item.majorId, item.univId)}
                />
                {item.name}
                <span>›</span>
              </div>
            ))}
            <div className="Departmentselection-add-top" >+</div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <AddMajorModal
        show={showMajorModal}
        onClose={() => {
          setShowMajorModal(false);
          window.location.reload();
        }}
        myMajors={myDepartments.계열}
        onOpenMajorDepartments={(major) => setSelectedMajorForDepartments(major)}
      />

      <AddDepartmentModal
        show={showDepartmentModal}
        onClose={() => {
          setShowDepartmentModal(false);
          window.location.reload();
        }}
        selected={myDepartments.학과}
        search={departmentSearch}
        onSearch={setDepartmentSearch}
        onToggle={handleDepartmentToggleFromPopup}
        onOpenUniversityPopup={handleOpenUniversityPopup}
      />

      <MajorDepartmentModal
        show={!!selectedMajorForDepartments}
        onClose={() => {
          setSelectedMajorForDepartments(null);
          if (!showMajorModal) window.location.reload();
        }}
        title={selectedMajorForDepartments}
        fieldId={nameToIdMap[selectedMajorForDepartments]}
        selected={myDepartments.학과}
        onToggle={handleDepartmentToggleFromPopup}
      />

      <DepartmentUniversityModal
        show={!!selectedDepartmentForUniversities}
        onClose={() => setSelectedDepartmentForUniversities(null)}
        departmentName={selectedDepartmentForUniversities}
        departmentId={departmentNameToIdMap[selectedDepartmentForUniversities]}
      />

      <AddUniversityModal
        show={showUniversityModal}
        onClose={() => setShowUniversityModal(false)}
        onToggle={handleUniversityToggleFromPopup}
        selected={popupAddedUniversities}
      />
    </div>
  );
};

export default Departmentselection;
