import React, { useState, useEffect } from "react";
import HeartToggle from './HeartToggle';
import "../../styles/AddMajorModal.css";
import { fetchAllMajors, toggleMajorBookmark } from "../../api/departmentApi";

const AddMajorModal = ({ show, onClose, myMajors, onOpenMajorDepartments }) => {
  const [localSelectedMajors, setLocalSelectedMajors] = useState([]);
  const [allMajors, setAllMajors] = useState([]);

  const nameToIdMap = Object.fromEntries(allMajors.map((m) => [m.name, m.id]));

  useEffect(() => {
    if (show) {
      setLocalSelectedMajors(myMajors);
      fetchAllMajors()
        .then(setAllMajors)
        .catch((err) => {
          console.error("계열 목록 불러오기 실패:", err);
          setAllMajors([]);
        });
    }
  }, [show, myMajors]);

  const handleToggleLocal = async (itemName) => {
    const newList = localSelectedMajors.includes(itemName)
      ? localSelectedMajors.filter((i) => i !== itemName)
      : [...localSelectedMajors, itemName];

    setLocalSelectedMajors(newList);

    const fieldId = nameToIdMap[itemName];
    if (fieldId) {
      try {
        await toggleMajorBookmark(fieldId);
      } catch (e) {
        console.error("서버 토글 실패:", e);
        setLocalSelectedMajors(localSelectedMajors); // rollback
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <span>계열 목록</span>
          <button onClick={onClose} className="close-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            />
          </button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          {allMajors.length === 0 ? (
            <div className="modal-empty">불러올 계열이 없습니다.</div>
          ) : (
            allMajors.map(({ id, name }) => (
                <div
                  className="modal-item"
                  key={id}
                  onClick={() => onOpenMajorDepartments(name)}
                >
                  <HeartToggle
                    selected={localSelectedMajors.includes(name)}
                    onToggle={(e) => {
                      e.stopPropagation();
                      handleToggleLocal(name);
                    }}
                  />
                  <span className="major-name">{name}</span>
                  <span className="arrow">›</span>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMajorModal;
