import React from "react";
import "../../styles/Main.css";

const steps = [
  {
    step: "STEP 1",
    title: "적성/흥미",
    description: "적성검사",
    action: "적성검사 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step1.jpg`} />
  },
  {
    step: "STEP 2",
    title: "내신/모의고사",
    description: "성적 입력",
    action: "성적입력 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step2.jpg`} />
  },
  {
    step: "STEP 3",
    title: "계열/학과",
    description: (
      <>
        관심계열,<br />
        학과선택
      </>
    ),
    action: "선택 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step3.jpg`} />
  },
  {
    step: "STEP 4",
    title: "종합분석",
    description: "학기레포트",
    action: "생성 하기 >",
    icon: <img src={`${process.env.PUBLIC_URL}/img/main_step4.jpg`} />
  },
];

const Main = () => {
  return (
    <div className="Main-container">
      <div className="Main-start">시작하기</div>
      <div className="Main-steps-container">
        {steps.map((step, index) => (
          <div className="Main-step" key={index}>
            <div className="Main-step-number">{step.step}</div>
            <div className="Main-step-title">{step.title}</div>
            <div className="Main-step-description">{step.description}</div>
            <div className="Main-step-action">{step.action}</div>
            <div className="Main-step-icon">{step.icon}</div> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;