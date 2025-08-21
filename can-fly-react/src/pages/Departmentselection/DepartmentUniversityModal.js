// src/components/Departmentselection/DepartmentUniversityModal.js
import React, { useState, useEffect } from "react";
import "../../styles/DepartmentUniversityModal.css";
import {
  fetchUniversitiesByMajor,
  fetchBookmarkedMajorUniversities,
  toggleMajorUniversityBookmark,
} from "../../api/departmentApi";
import HeartToggle from "./HeartToggle";

const DepartmentUniversityModal = ({ show, onClose, departmentName, departmentId }) => {
  const [search, setSearch] = useState("");
  const [universities, setUniversities] = useState([]);
  const [likedPairs, setLikedPairs] = useState([]); // ✅ { majorId, univId } 목록
  const [loading, setLoading] = useState(false);

  // 전공-대학 즐겨찾기 불러오기
  const loadLikedPairs = async () => {
    try {
      const result = await fetchBookmarkedMajorUniversities(); // [{ majorId, univId }]
      setLikedPairs(result);
    } catch (e) {
      console.error("북마크 전공-대학 목록 불러오기 실패:", e);
      setLikedPairs([]);
    }
  };

  // 대학 목록 불러오기
  useEffect(() => {
    const loadUniversities = async () => {
      if (show && departmentId) {
        setLoading(true);
        try {
          await loadLikedPairs(); // ✅ 먼저 북마크 로드
          const result = await fetchUniversitiesByMajor(departmentId); // [{ id, name }]
          setUniversities(result);
        } catch (err) {
          console.error("대학 목록 불러오기 실패:", err);
          setUniversities([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadUniversities();
  }, [show, departmentId]);

  if (!show) return null;

  // 현재 학과 ID 기준으로 좋아요된 대학 ID 목록 추출
  const likedUniversityIds = likedPairs
    .filter((pair) => pair.majorId === departmentId)
    .map((pair) => pair.univId);

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // 하트 토글 핸들러
  const handleToggle = async (univId) => {
    try {
      await toggleMajorUniversityBookmark(departmentId, univId); // ✅ 서버 반영

      const isLiked = likedUniversityIds.includes(univId);
      const updated = isLiked
        ? likedPairs.filter((pair) => !(pair.majorId === departmentId && pair.univId === univId))
        : [...likedPairs, { majorId: departmentId, univId }];
      setLikedPairs(updated);
    } catch (err) {
      console.error("하트 토글 실패:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <span>{departmentName}</span>
          <button onClick={onClose}>
            <img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            />
          </button>
        </div>

        {/* 검색창 */}
        <div className="modal-search">
          <input
            placeholder="대학명을 입력해주세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
              className="search-icon"
              alt="검색"
            />
          </button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          <div className="modal-subtitle">대학 목록</div>

          {loading ? (
            <div className="no-data">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="no-data">대학이 없습니다.</div>
          ) : (
            filtered.map((uni) => (
              <div className="modal-item" key={uni.id}>
                <HeartToggle
                  selected={likedUniversityIds.includes(uni.id)}
                  onToggle={() => handleToggle(uni.id)}
                />
                {uni.name}
                <span>›</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentUniversityModal;
