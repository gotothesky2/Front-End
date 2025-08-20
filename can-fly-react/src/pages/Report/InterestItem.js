// src/pages/Report/InterestItem.js
import React, { useRef, useEffect } from 'react'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export default function InterestItem({ school, dept, rate }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null) // ★ 차트 인스턴스 저장용

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return // 언마운트 중이면 안전 탈출

    // 기존 차트가 있으면 먼저 파괴
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const ctx = canvas.getContext('2d')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [`${school} – ${dept}`],
        datasets: [{
          data: [Number(rate)],
          backgroundColor: '#0339A6',
          borderRadius: 8,
          barThickness: 12,
        }],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        animation: false, // 언마운트 타이밍 안정성 ↑
        scales: {
          x: { display: false, min: 0, max: 100 },
          y: { display: false },
        },
        plugins: {
          DataLabelPlugin: false,
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [school, dept, rate])

  return (
    <div className="interest-item-wrapper">
      <div className="interest-item-label">
        {school} – {dept}
      </div>
      <div className="interest-item-chart">
        <canvas ref={canvasRef} />
      </div>
      <div className="interest-item-rate">
        {Number(rate).toFixed(0)}%
      </div>
    </div>
  )
}

