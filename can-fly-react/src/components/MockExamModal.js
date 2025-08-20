import React, { useState, useEffect } from 'react';
import '../styles/MockExamModal.css';

const mathOptions    = ['미응시','확률과 통계','미적분','기하'];
const englishOptions = ['미응시','영어'];
const exploreOptions = [
  '미응시','한국 지리','윤리와 사상','생활과 윤리','사회문화',
  '정치와 법','경제','세계사','동아시아사','세계 지리',
  '물리학1','물리학2','화학1','화학2',
  '생명 과학1','생명 과학2','지구 과학1','지구 과학2',
  '공통 사회','공통 과학'
];
const langOptions    = [
  '독일어1','프랑스어1','스페인어1','중국어1','일본어1',
  '러시아어1','아랍어1','베트남어1','한문1'
];

const defaultRows = {
  koreanHistory: { raw:'', grade:'', percentile:'' },
  korean:        { raw:'', grade:'', percentile:'' },
  math:          { subject:'', raw:'', grade:'', percentile:'' },
  english:       { subject:'', raw:'', grade:'', percentile:'' },
  explore1:      { subject:'', raw:'', grade:'', percentile:'' },
  explore2:      { subject:'', raw:'', grade:'', percentile:'' },
  secondLang:    { subject:'', raw:'', grade:'', percentile:'' },
};

export default function MockExamModal({
  isOpen, term, initialData={}, onClose, onSave
}) {
  const [rows, setRows] = useState(defaultRows);

  useEffect(() => {
    if (isOpen) setRows({ ...defaultRows, ...initialData });
  }, [isOpen, initialData]);

  const change = (key, field, val) => {
    setRows(r => ({ ...r, [key]: { ...r[key], [field]: val }}));
  };

  const submit = () => onSave(rows);
  if (!isOpen) return null;

  // 표준점수/등급 비활성 규칙 (이전 로직 유지)
  const stdDisabled   = key => ['koreanHistory','english'].includes(key);
  const gradeDisabled = key => !['koreanHistory','english'].includes(key);

  // ✅ 백분위는 전부 비활성 + 빈 값으로 표시
  const renderPercentileBlank = () => (
    <input
      type="number"
      className="percentile-disabled"
      disabled
      value=""
      placeholder=""
      readOnly
      aria-label="백분위(비활성)"
    />
  );

  return (
    <div className="modal-backdrop">
      <div className="mockexam-modal">
        {/* 1) 헤더 - 모달 내부 */}
        <div className="modal-header">
          <strong>
            <span className="modal-term">{term}</span> 모의고사 성적 입력
          </strong>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <hr className="modal-separator"/>

        {/* 2) 2단 헤더 + 탐구 rowSpan 병합 */}
        <table className="modal-table">
          <thead>
            <tr>
              <th colSpan="2">과목</th>
              <th rowSpan="2">표준점수</th>
              <th rowSpan="2">등급</th>
              <th rowSpan="2">백분위</th>
            </tr>
            <tr>
              <th>과목명</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {/* 한국사 */}
            <tr>
              <td>한국사 <span className="required">*</span></td>
              <td></td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('koreanHistory')}
                  value={rows.koreanHistory.raw}
                  onChange={e=>change('koreanHistory','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('koreanHistory')}
                  value={rows.koreanHistory.grade}
                  onChange={e=>change('koreanHistory','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>

            {/* 국어 */}
            <tr>
              <td>국어 <span className="required">*</span></td>
              <td></td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('korean')}
                  value={rows.korean.raw}
                  onChange={e=>change('korean','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('korean')}
                  value={rows.korean.grade}
                  onChange={e=>change('korean','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>

            {/* 수학 */}
            <tr>
              <td>수학 <span className="required">*</span></td>
              <td>
                <select
                  value={rows.math.subject}
                  onChange={e=>change('math','subject',e.target.value)}
                >
                  <option value="">선택</option>
                  {mathOptions.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('math')}
                  value={rows.math.raw}
                  onChange={e=>change('math','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('math')}
                  value={rows.math.grade}
                  onChange={e=>change('math','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>

            {/* 영어 */}
            <tr>
              <td>영어 <span className="required">*</span></td>
              <td>
                <select
                  value={rows.english.subject}
                  onChange={e=>change('english','subject',e.target.value)}
                >
                  <option value="">선택</option>
                  {englishOptions.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('english')}
                  value={rows.english.raw}
                  onChange={e=>change('english','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('english')}
                  value={rows.english.grade}
                  onChange={e=>change('english','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>

            {/* 탐구 (rowSpan=2) */}
            <tr>
              <td rowSpan="2">탐구 <span className="required">*</span></td>
              <td>
                <select
                  value={rows.explore1.subject}
                  onChange={e=>change('explore1','subject',e.target.value)}
                >
                  <option value="">선택1</option>
                  {exploreOptions.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('explore1')}
                  value={rows.explore1.raw}
                  onChange={e=>change('explore1','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('explore1')}
                  value={rows.explore1.grade}
                  onChange={e=>change('explore1','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>
            <tr>
              <td>
                <select
                  value={rows.explore2.subject}
                  onChange={e=>change('explore2','subject',e.target.value)}
                >
                  <option value="">선택2</option>
                  {exploreOptions.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('explore2')}
                  value={rows.explore2.raw}
                  onChange={e=>change('explore2','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('explore2')}
                  value={rows.explore2.grade}
                  onChange={e=>change('explore2','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>

            {/* 제2외국어/한문 */}
            <tr>
              <td>제2외국어/한문 <span className="required">*</span></td>
              <td>
                <select
                  value={rows.secondLang.subject}
                  onChange={e=>change('secondLang','subject',e.target.value)}
                >
                  <option value="">선택</option>
                  {langOptions.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  disabled={stdDisabled('secondLang')}
                  value={rows.secondLang.raw}
                  onChange={e=>change('secondLang','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  disabled={gradeDisabled('secondLang')}
                  value={rows.secondLang.grade}
                  onChange={e=>change('secondLang','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>
          </tbody>
        </table>

        {/* 3) 버튼 */}
        <footer className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-save"   onClick={submit}>저장</button>
        </footer>
      </div>
    </div>
  );
}





