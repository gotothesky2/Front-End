import React from "react";
import '../../styles/StudentGrade.css';


const ExamGrade = () => {
    return(
        <>
            {/* 흰색 배경 영역 */}
                <div className="grade-page-container">
                    <div className="grade-white-section">
                    <div className="grade-path-text">
                        <span className="grade-path-main">성적입력</span>
                        <span className="grade-path-arrow">&nbsp;&gt;&nbsp;</span>
                        <span className="grade-path-sub">모의고사 성적</span>
                    </div>
                    <div className="grade-title-box">
                        <h2>모의고사 성적</h2>
                    </div>
                    </div>
                </div>

                 {/* 회색 배경 영역 */}
                <div className="grade-gray-section">

                </div>
    
    
    
        </>
    )
};

export default ExamGrade;