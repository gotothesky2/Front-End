// src/pages/Main.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Main.css";
import ReportModal from "../../components/ReportModal";

const steps = [
  {
    step: "STEP 1",
    title: "적성/흥미",
    description: "적성검사",
    action: "적성검사 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step1.jpg`} alt="step1" />,
  },
  {
    step: "STEP 2",
    title: "내신/모의고사",
    description: "성적 입력",
    action: "성적입력 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step2.jpg`} alt="step2" />,
  },
  {
    step: "STEP 3",
    title: "계열/학과",
    description: (
      <>
        관심계열,
        <br />
        학과선택
      </>
    ),
    action: "선택 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step3.jpg`} alt="step3" />,
  },
  {
    step: "STEP 4",
    title: "종합분석",
    description: "학기레포트",
    action: "생성 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step4.jpg`} alt="step4" />,
  },
];

// STEP 1~3 이동 경로만 정의 (STEP 4는 링크 없음)
const actionLinks = ["/Test", "/GradeInput", "/Departmentselection"];

const Main = () => {
  const [isReportOpen, setReportOpen] = useState(false);

  return (
    <div className="Main-container">
      <div className="Main-start">시작하기</div>
      <div className="Main-steps-container">
        {steps.map((step, index) => (
          <div className="Main-step" key={index}>
            <div className="Main-step-content">
              <div className="Main-step-number">{step.step}</div>
              <div className="Main-step-title">{step.title}</div>
              <div className="Main-step-description">{step.description}</div>
            </div>

            {/* STEP 4는 기존 로직 그대로 유지(모달) / STEP 1~3만 링크 */}
            <div
              className="Main-step-action"
              onClick={() => {
                if (index === 3) setReportOpen(true); // STEP 4만 모달 오픈
              }}
              style={{ cursor: index === 3 ? "pointer" : "default" }}
            >
              {index < 3 ? (
                <Link to={actionLinks[index]} className="Main-step-action-link">
                  {step.action}
                </Link>
              ) : (
                step.action
              )}
            </div>

            <div className="Main-step-icon">{step.icon}</div>
          </div>
        ))}
      </div>

      {/* 팝업 모달 */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setReportOpen(false)}
        initialTokens={200}  // 더미 보유토큰
        cost={100}           // 차감토큰
      />
    </div>
  );
};

export default Main;
