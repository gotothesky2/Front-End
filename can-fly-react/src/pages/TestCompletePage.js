import React, { useState } from "react";
import "../styles/TestCompletePage.css";

import { aiPdfPost } from "../api/aiApi";
import AIconfig from "../api/AIconfig";

const TestCompletePage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [examType, setExamType] = useState("interest"); // 'interest' | 'aptitude'
  const [loading, setLoading] = useState(false);

  // 흥미검사 생성 api
  const handleProfileUpload = async (file) => {
    const data = await aiPdfPost(AIconfig.INTEREST.MAKE_HMT, file);
    console.log("흥미검사 생성 성공:", data);
    return data;
  };

  // 적성검사 생성 api
  const handleCstfileUpload = async (file) => {
    const data = await aiPdfPost(AIconfig.APTITUDE.MAKE_CST, file);
    console.log("적성검사 생성 성공:", data);
    return data;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("PDF 파일만 업로드 가능합니다.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("PDF 파일만 업로드 가능합니다.");
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert("PDF 파일을 먼저 업로드 해주세요.");
      return;
    }

    try {
      setLoading(true);
      if (examType === "interest") {
        await handleProfileUpload(selectedFile);
        alert("흥미검사 생성에 성공했습니다.");
      } else {
        await handleCstfileUpload(selectedFile);
        alert("적성검사 생성에 성공했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert(
        examType === "interest"
          ? "흥미검사 생성에 실패했습니다."
          : "적성검사 생성에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-complete-page">
      <div className="test-complete-container">
        <h1 className="complete-title">
          검사가 <span className="blue">완료</span>되었습니다.
        </h1>
        <p className="complete-desc">
          커리어넷에서 검사 결과를 PDF로 다운로드 하신 뒤 아래에 업로드 해주세요
          <br />
          분석을 통해 맞춤형 전공·진로를 추천해드립니다.
        </p>

        {/* 검사 종류 선택 */}
        <div className="exam-type-row" style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="radio"
              name="examType"
              value="interest"
              checked={examType === "interest"}
              onChange={() => setExamType("interest")}
            />
            흥미검사 PDF 업로드
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="radio"
              name="examType"
              value="aptitude"
              checked={examType === "aptitude"}
              onChange={() => setExamType("aptitude")}
            />
            적성검사 PDF 업로드
          </label>
        </div>

        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <img src="/img/upload.svg" alt="업로드 아이콘" className="upload-icon" />
          <p className="upload-text">
            {selectedFile ? selectedFile.name : "검사 결과지 PDF를 업로드 해주세요."}
          </p>
          <input
            type="file"
            id="fileInput"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <button className="save-button" onClick={handleUploadClick} disabled={loading}>
          {loading ? "저장 중..." : "저장 하기"}
        </button>
      </div>
    </div>
  );
};

export default TestCompletePage;

