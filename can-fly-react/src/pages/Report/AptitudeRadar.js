// AptitudeRadar.js
import React from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

// 1) 커스텀 플러그인 정의
const DataLabelPlugin = {
  id: 'DataLabelPlugin',
  afterDraw(chart) {
    const { ctx } = chart
    chart.getDatasetMeta(0).data.forEach((point, idx) => {
      const val = chart.data.datasets[0].data[idx] + '%'
      const x = point.x
      const y = point.y
      ctx.save()
      ctx.fillStyle = '#333'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(val, x, y - 10)
      ctx.restore()
    })
  }
}

// 차트 모듈만 등록 (datalabels 플러그인 제거)
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  DataLabelPlugin
)

const labels = ['R(현실형)','I(탐구형)','A(예술형)','S(사회형)','E(기업형)','C(관습형)']
const data = {
  labels,
  datasets: [{
    label: '현재 검사',
    data: [48.1,30.9,100,49.4,43.2,29.6],
    backgroundColor: 'rgba(41, 41, 185, 0.7)',
    borderColor: 'rgb(41, 41, 185)',
    pointBackgroundColor: 'rgb(41, 41, 185)',
    pointBorderColor: '#fff',
    pointRadius: 5,
    borderWidth: 2,
    tension: 0.1
  }]
}

const options = {
  responsive: true,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        callback: v=>v+'%',
        color: '#666'
      },
      grid: { color: 'rgba(0,0,0,0.1)' },
      angleLines: { color: 'rgba(0,0,0,0.1)' },
      pointLabels: { color: '#555', font: { size: 14 } }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx=>`${ctx.dataset.label}: ${ctx.formattedValue}%`
      }
    },
    //  ----> 커스텀 데이터 라벨 플러그인 등록
    afterDraw: chart => {
      const {ctx, data, chartArea: {top,bottom,left,right}} = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((point, idx) => {
          const val = dataset.data[idx] + '%';
          const {x, y} = point.getProps(['x','y'], true);
          ctx.save();
          ctx.fillStyle = '#333';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(val, x, y - 10);
          ctx.restore();
        });
      });
    }
  }
}

export default function AptitudeRadar() {
  return <Radar data={data} options={options} />
}




