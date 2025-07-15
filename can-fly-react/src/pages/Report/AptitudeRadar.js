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


ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)


const labels = ['Math','Chinese','English','Geography','Physics','History']

const data = {
  labels,
  datasets: [
    {
      label: 'A반 점수',
      data: [120, 98, 86, 99, 85, 65],
      fill: true,
      tension: 0.1
    },
    {
      label: 'B반 점수',
      data: [110, 130, 130, 100, 90, 80],
      fill: true,
      tension: 0.1
    }
  ]
}


const options = {
  responsive: true,
  scales: {
    r: {
      beginAtZero: true,
      max: 150,
      ticks: { stepSize: 30 }
    }
  },
  plugins: {
    legend: { position: 'top' },
    tooltip: { enabled: true }
  }
}

const AptitudeRadar = () => {
  return <Radar options={options} data={data} />;
};


export default AptitudeRadar;



