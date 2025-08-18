import React, { useState } from 'react'
import '../../styles/ReportSidebar.css'

export default function ReportSidebar({ initialActive = 'aptitude', onJump }) {
  const [active, setActive] = useState(initialActive)

  const items = [
    { id: 'aptitude', label: '적성·흥미 검사 분석 결과' },
    { id: 'grades',   label: '성적 추이' },
    { id: 'interest', label: '관심 학과·학교 분석' },
    { id: 'summary',  label: '종합 분석' },
  ]

  return (
    <aside className="report-sidebar">
      <h2 className="report-sidebar__title">레포트 목차</h2>
      <nav className="report-sidebar__nav">
        {items.map(item => (
          <button
            key={item.id}
            className={
              `report-sidebar__item${item.id === active ? ' report-sidebar__item--active' : ''}`
            }
            onClick={() => {
              setActive(item.id)  // 클릭한 id를 active로 변경
              onJump?.(item.id)
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

