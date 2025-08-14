import React, { useState } from "react";
import "../styles/TestCompletePage.css";

import { aiPdfPost } from "../api/aiApi";
import AIconfig from "../api/AIconfig";

const TestCompletePage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // 사용자 프로필 업로드 api
  const handleProfileUpload = async (file) => {
    try {
      const data = await aiPdfPost(AIconfig.INTEREST.MAKE_HMT, file);
      console.log("흥미검사 생성 성공:", data);
    } catch (err) {
      console.error("흥미검사 생성 실패:", err);
      alert("흥미검사 생성에 실패했습니다.");
    }
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

  const handleUploadClick = () => {
    if (!selectedFile) {
      alert("PDF 파일을 먼저 업로드 해주세요.");
      return;
    }
    handleProfileUpload(selectedFile);
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

        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <img
            src="/img/upload.svg"
            alt="업로드 아이콘"
            className="upload-icon"
          />
          <p className="upload-text">
            {selectedFile
              ? selectedFile.name
              : "검사 결과지 PDF를 업로드 해주세요."}
          </p>
          <input
            type="file"
            id="fileInput"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <button className="save-button" onClick={handleUploadClick}>
          저장 하기
        </button>
      </div>
    </div>
  );
};

export default TestCompletePage;
