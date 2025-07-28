import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/StudentGradeModal.css';

const subjectCategories = ['국어', '수학', '영어', '사회', '과학'];
const achievementOptions = ['A', 'B', 'C', 'D', 'E', 'P'];

const StudentGradeModalRow = ({ row, index, isEditing, onChange }) => {
  const [isCustomInput, setIsCustomInput] = useState(false);

  // 공통 입력/셀렉트 변경 핸들러
  const handleFieldChange = field => e => {
    onChange(row.id, field, e.target.value);
  };

  // 교과 선택 시 과목도 같은 값으로 초기화
  const handleSubjectCategoryChange = e => {
    const value = e.target.value;
    onChange(row.id, 'subjectCategory', value);
    onChange(row.id, 'subject', value);
    setIsCustomInput(false);
  };

  // 과목 select → 직접입력 전환 처리
  const handleSubjectChange = e => {
    const value = e.target.value;
    if (value === '직접입력') {
      setIsCustomInput(true);
      onChange(row.id, 'subject', '');
    } else {
      setIsCustomInput(false);
      onChange(row.id, 'subject', value);
    }
  };

  return (
    <div className="modal-table-row">
      {/* 체크박스 */}
      <div className="cell checkbox">
        {isEditing && (
          <input
            type="checkbox"
            checked={row.checked || false}
            onChange={e => onChange(row.id, 'checked', e.target.checked)}
          />
        )}
      </div>

      {/* 번호 */}
      <div className="cell number">{index + 1}</div>

      {/* 교과종류구분 */}
      <div className="cell course-type">
        {isEditing ? (
          <select value={row.courseType} disabled>
            <option>일반선택</option>
          </select>
        ) : (
          <span>{row.courseType}</span>
        )}
      </div>

      {/* 교과 */}
      <div className="cell subject-category">
        {isEditing ? (
          <select
            value={row.subjectCategory}
            onChange={handleSubjectCategoryChange}
          >
            {subjectCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          <span>{row.subjectCategory}</span>
        )}
      </div>

      {/* 과목 */}
      <div className="cell subject">
        {isEditing ? (
          isCustomInput ? (
            <input
              type="text"
              value={row.subject}
              onChange={handleFieldChange('subject')}
              placeholder="직접 입력"
            />
          ) : (
            <select
              value={row.subject}
              onChange={handleSubjectChange}
            >
              <option value={row.subject}>{row.subject}</option>
              <option value="직접입력">직접입력</option>
            </select>
          )
        ) : (
          <span>{row.subject}</span>
        )}
      </div>

      {/* 숫자 입력 필드 */}
      {['credits', 'rank', 'score', 'average', 'deviation', 'students'].map(field => (
        <div className="cell" key={field}>
          {isEditing ? (
            <input
              type="number"
              value={row[field]}
              onChange={handleFieldChange(field)}
            />
          ) : (
            <span>{row[field] || 0}</span>
          )}
        </div>
      ))}

      {/* 성취도 */}
      <div className="cell">
        {isEditing ? (
          <select
            value={row.achievement}
            onChange={handleFieldChange('achievement')}
          >
            <option value="">선택</option>
            {achievementOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <span>{row.achievement || '-'}</span>
        )}
      </div>
    </div>
  );
};

StudentGradeModalRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    courseType: PropTypes.string,
    subjectCategory: PropTypes.string,
    subject: PropTypes.string,
    credits: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    average: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deviation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    students: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    achievement: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default StudentGradeModalRow;

