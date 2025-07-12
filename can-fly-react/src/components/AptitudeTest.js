import React from 'react';

const AptitudeTest = (props) => {
  return (
    <div 
      style={{
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        width: '200px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
      }}
      onClick={props.onClick}
    >
      <div style={{ fontSize: '80px' }}>📝</div>
      <h3>직업 적성 검사</h3>
      <div style={{ color: 'blue', marginTop: '10px' }}>하러가기 &gt;</div>
    </div>
  );
}

export default AptitudeTest;
