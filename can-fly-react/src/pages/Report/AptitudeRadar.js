import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

function AptitudeRadar() {
  const data = [
    { type: "R", score: 48.1 },
    { type: "I", score: 30.9 },
    { type: "A", score: 100.0 },
    { type: "S", score: 49.4 },
    { type: "E", score: 43.2 },
    { type: "C", score: 29.6 },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement(
      RadarChart,
      { outerRadius: 90, width: 400, height: 300, data: data },
      React.createElement(PolarGrid, null),
      React.createElement(PolarAngleAxis, { dataKey: 'type' }),
      React.createElement(PolarRadiusAxis, { angle: 30, domain: [0, 100] }),
      React.createElement(Radar, {
        name: "적성 점수",
        dataKey: "score",
        stroke: "#8884d8",
        fill: "#8884d8",
        fillOpacity: 0.6
      })
    )
  );
}

export default AptitudeRadar;

