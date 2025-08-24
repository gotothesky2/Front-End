import React, { useState, useEffect } from 'react'
import '../../styles/ComprehensiveAnalysis.css'

export default function ComprehensiveAnalysis() {
  // ➊ 로컬 상태로 분석 텍스트 관리
  const [analysisText, setAnalysisText] = useState([])

  useEffect(() => {
    // TODO: 실제 API가 준비되면 여기서 fetch 사용
    // fetch('/api/report/comprehensive')
    //   .then(res => res.json())
    //   .then(data => setAnalysisText(data))

    // 백엔드 준비 전 더미 데이터 세팅
    setAnalysisText([
      '학생의 적성과 흥미, 성적 데이터를 종합적으로 분석한 결과, 탐구형과 기업형 성향이 두드러지며 논리적 사고력과 리더십이 우수함을 확인할 수 있습니다.',
      '수학과 과학 영역에서 꾸준한 향상을 보이며, 특히 논리적 사고와 분석 능력이 뛰어납니다. 이러한 강점을 바탕으로 이학/공학/의학계열의 학과에 적합합니다.',
      '국어와 영어 영역에서는 독해력과 어휘력이 점진적으로 향상되고 있으며, 사회 영역에서는 개념 이해와 사고력이 체계적으로 발전하고 있습니다.',
      '종합적으로 학생은 체계적이고 지속적인 학습 방법을 잘 활용하고 있으며, 향후 목표 대학 진학을 위해 강점 영역을 더욱 심화하고 취약 영역을 보완하는 것이 중요합니다.'
    ])
  }, [])

  return (
    <ol className="comprehensive-analysis__list">
      {analysisText.map((line, idx) => (
        <li key={idx} className="comprehensive-analysis__item">
          {line}
        </li>
      ))}
    </ol>
  )
}

