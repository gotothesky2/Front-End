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

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    // 이미 그려진 차트가 있으면 파괴
    if (canvasRef.current._chart) {
      canvasRef.current._chart.destroy()
    }

    canvasRef.current._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [`${school} – ${dept}`],
        datasets: [{
          data: [rate],
          backgroundColor: '#0339A6',
          borderRadius: 8,
          barThickness: 12
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
          x: { display: false, max: 100 },
          y: { display: false}
        },
        plugins: {
          DataLabelPlugin: false,
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    })

    return () => {
      canvasRef.current._chart.destroy()
    }
  }, [school, dept, rate])

  return (
    <div className="interest-item-wrapper">
      <div className="interest-item-label">
        {school} – {dept}
      </div>
      <div className="interest-item-chart">
        <canvas ref={canvasRef}></canvas>
      </div>
      <div className="interest-item-rate">
        {rate}%
      </div>
    </div>
  )
}
