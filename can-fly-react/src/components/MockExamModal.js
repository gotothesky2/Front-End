import React, { useState, useEffect } from 'react';
import '../styles/MockExamModal.css';
import { postMockExam } from '../api/mockExam';

// ===== 옵션들 =====
const mathOptions    = ['미응시','확률과 통계','미적분','기하'];
const englishOptions = ['미응시','영어'];
const exploreOptions = [
  '미응시','한국지리','윤리와 사상','생활과 윤리','사회문화',
  '정치와 법','경제','세계사','동아시아사','세계지리',
  '물리학1','물리학2','화학1','화학2',
  '생명과학1','생명과학2','지구과학1','지구과학2',
  '공통 사회','공통 과학'
];
const langOptions    = [
  '독일어1','프랑스어1','스페인어1','중국어1','일본어1',
  '러시아어1','아랍어1','베트남어1','한문1'
];

// ===== 초기 로우 =====
const defaultRows = {
  koreanHistory: { raw:'', grade:'', percentile:'' },
  korean:        { raw:'', grade:'', percentile:'' },
  math:          { subject:'', raw:'', grade:'', percentile:'' },
  english:       { subject:'', raw:'', grade:'', percentile:'' },
  explore1:      { subject:'', raw:'', grade:'', percentile:'' },
  explore2:      { subject:'', raw:'', grade:'', percentile:'' },
  secondLang:    { subject:'', raw:'', grade:'', percentile:'' },
};

// ===== 유틸: term → 연/월/학년 파싱 =====
function parseExamFromTerm(term, fallbackYear) {
  // 예: "1학년 6월"
  const g = term?.match(/[1-3](?=학년)/)?.[0];
  const m = term?.match(/(\d+)\s*월/)?.[1];
  const year = Number(fallbackYear || new Date().getFullYear());
  return {
    examYear: year,
    examMonth: m ? Number(m) : null,
    examGrade: g ? Number(g) : null,
  };
}

// ===== 라벨 정규화 =====
function labelForMath(subject) {
  if (!subject || subject === '미응시') return null;
  if (subject === '미적분') return '수학(미적)';
  if (subject === '확률과 통계') return '수학(확통)';
  return `수학(${subject})`; // 기하 → 수학(기하)
}

// ‘1/2’ → ‘Ⅰ/Ⅱ’ 치환
function toRomanOneTwo(txt) {
  return txt
    .replace(/ ?1\b/g, ' Ⅰ')
    .replace(/ ?2\b/g, ' Ⅱ');
}

function labelForExplore(subject) {
  if (!subject || subject === '미응시') return null;
  // 옵션 문자열 그대로 사용하되, 숫자는 로마자로
  return toRomanOneTwo(subject);
}

function labelForSecondLang(subject) {
  if (!subject) return null;
  return toRomanOneTwo(subject);
}

// 표준점수/등급 비활성 규칙
const DISABLE_STD_KEYS = ['koreanHistory','english','secondLang'];
const stdDisabled   = key => DISABLE_STD_KEYS.includes(key);
const gradeDisabled = key => !DISABLE_STD_KEYS.includes(key);

export default function MockExamModal({
  isOpen, term, initialData = {}, onClose, onSave, examYear: propExamYear
}) {
  const [rows, setRows] = useState(defaultRows);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setRows({ ...defaultRows, ...initialData });
  }, [isOpen, initialData]);

  const change = (key, field, val) => {
    setRows(r => ({ ...r, [key]: { ...r[key], [field]: val }}));
  };

  // ----- API payload 빌드 -----
  function buildInputs() {
    const inputs = [];

    // 한국사 (등급 입력)
    if (rows.koreanHistory.grade) {
      inputs.push({ label: '한국사', value: Number(rows.koreanHistory.grade) });
    }

    // 국어 (표준점수)
    if (rows.korean.raw) {
      inputs.push({ label: '국어', value: Number(rows.korean.raw) });
    }

    // 수학 (선택 + 표준점수)
    const mathLabel = labelForMath(rows.math.subject);
    if (mathLabel && rows.math.raw) {
      inputs.push({ label: mathLabel, value: Number(rows.math.raw) });
    }

    // 영어 (등급)
    if (rows.english.subject && rows.english.subject !== '미응시' && rows.english.grade) {
      inputs.push({ label: '영어', value: Number(rows.english.grade) });
    } else if (!rows.english.subject && rows.english.grade) {
      // 셀렉트 없이 등급만 입력했을 때도 ‘영어’로 취급
      inputs.push({ label: '영어', value: Number(rows.english.grade) });
    }

    // 탐구 1/2 (표준점수)
    const ex1 = labelForExplore(rows.explore1.subject);
    if (ex1 && rows.explore1.raw) {
      inputs.push({ label: ex1, value: Number(rows.explore1.raw) });
    }
    const ex2 = labelForExplore(rows.explore2.subject);
    if (ex2 && rows.explore2.raw) {
      inputs.push({ label: ex2, value: Number(rows.explore2.raw) });
    }

    // 제2외국어/한문 (등급)
    const sl = labelForSecondLang(rows.secondLang.subject);
    if (sl && rows.secondLang.grade) {
      inputs.push({ label: sl, value: Number(rows.secondLang.grade) });
    }

    // 미응시/빈 값 제거는 위에서 이미 처리됨
    return inputs;
  }

  async function submit() {
    if (saving) return;

    const { examYear, examMonth, examGrade } =
      parseExamFromTerm(term, propExamYear);

    const inputs = buildInputs();

    // 간단 검증
    if (!examYear || !examMonth || !examGrade || inputs.length === 0) {
      alert('학년/월 또는 입력값이 부족합니다. (좌측 학년·월 선택, 과목 입력 확인)');
      return;
    }

    const payload = { examYear, examMonth, examGrade, inputs };

    try {
      setSaving(true);
      const data = await postMockExam(payload); // {isSuccess, code, message, result}
      if (data?.isSuccess) {
        alert(data.message || '모의고사 등록이 완료되었습니다.');
        // 부모에게 결과 전달(선택사항)
        onSave && onSave(data.result);
        onClose && onClose();
      } else {
        alert(data?.message || '등록에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('모의고사 등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  // 백분위(항상 비활성)
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

  const cls = (isDisabled) => `modal-input ${isDisabled ? 'is-disabled' : 'is-enabled'}`;

  return (
    <div className="modal-backdrop">
      <div className="mockexam-modal">
        {/* 헤더 */}
        <div className="modal-header">
          <strong>
            <span className="modal-term">{term}</span> 모의고사 성적 입력
          </strong>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <hr className="modal-separator"/>

        {/* 표 */}
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
                  className={cls(stdDisabled('koreanHistory'))}
                  disabled={stdDisabled('koreanHistory')}
                  value={rows.koreanHistory.raw}
                  onChange={e=>change('koreanHistory','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('koreanHistory'))}
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
                  className={cls(stdDisabled('korean'))}
                  disabled={stdDisabled('korean')}
                  value={rows.korean.raw}
                  onChange={e=>change('korean','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('korean'))}
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
                  className={cls(stdDisabled('math'))}
                  disabled={stdDisabled('math')}
                  value={rows.math.raw}
                  onChange={e=>change('math','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('math'))}
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
                  className={cls(stdDisabled('english'))}
                  disabled={stdDisabled('english')}
                  value={rows.english.raw}
                  onChange={e=>change('english','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('english'))}
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
                  className={cls(stdDisabled('explore1'))}
                  disabled={stdDisabled('explore1')}
                  value={rows.explore1.raw}
                  onChange={e=>change('explore1','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('explore1'))}
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
                  className={cls(stdDisabled('explore2'))}
                  disabled={stdDisabled('explore2')}
                  value={rows.explore2.raw}
                  onChange={e=>change('explore2','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('explore2'))}
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
                  className={cls(stdDisabled('secondLang'))}
                  disabled={stdDisabled('secondLang')}
                  value={rows.secondLang.raw}
                  onChange={e=>change('secondLang','raw',e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={cls(gradeDisabled('secondLang'))}
                  disabled={gradeDisabled('secondLang')}
                  value={rows.secondLang.grade}
                  onChange={e=>change('secondLang','grade',e.target.value)}
                />
              </td>
              <td>{renderPercentileBlank()}</td>
            </tr>
          </tbody>
        </table>

        {/* 버튼 */}
        <footer className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>취소</button>
          <button className="btn-save" onClick={submit} disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </footer>
      </div>
    </div>
  );
}






