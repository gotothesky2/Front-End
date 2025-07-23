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
      '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
      '남산 위에 저 소나무 철갑을 두른 듯 바람서리 불변함은 우리 기상일세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
      '가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴 일편단심일세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.',
      '이 기상과 이 맘으로 충성을 다하여 괴로우나 즐거우나 나라 사랑하세 무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세.'
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

