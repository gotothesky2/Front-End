// src/pages/Report/InterestChart.js
import React from 'react'
import InterestItem from './InterestItem'
import '../../styles/InterestChart.css'

// 내부 더미 데이터
const DUMMY_INTEREST = [
  { school: '한국항공대학교', dept: '소프트웨어학과', rate: 89 },
  { school: '한국항공대학교', dept: '컴퓨터공학과',   rate: 85 },
  { school: '연세대학교',       dept: '신학과',       rate: 74 },
  { school: '연세대학교',       dept: '의예과',       rate: 1  }
]

export default function InterestChart({ interestData }) {
  const data = (interestData && interestData.length)
    ? interestData
    : DUMMY_INTEREST

  return (
    <div className="interest-chart-container">
      {data.map((item, i) => (
        <InterestItem
          key={i}
          school={item.school}
          dept={item.dept}
          rate={item.rate}
        />
      ))}
    </div>
  )
}




