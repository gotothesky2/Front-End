import React from 'react';
import AptitudeTest from '../components/AptitudeTest';
import InterestTest from '../components/InterestTest';

const TestSelectPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <div style={{ display: 'flex', gap: '50px' }}>
        <AptitudeTest onClick={() => alert('직업 적성 검사로 이동')} />
        <InterestTest onClick={() => alert('직업 흥미 검사로 이동')} />
      </div>
      <div style={{ marginTop: '50px' }}>
        <button style={{
          padding: '10px 20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          돌아가기
        </button>
      </div>
    </div>
  );
}

export default TestSelectPage;
