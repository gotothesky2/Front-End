import React from "react";

const HeartToggle = ({ selected, onToggle }) => {
  return (
    <img
      src={
        selected
          ? `${process.env.PUBLIC_URL}/icon/blue_heart.svg`
          : `${process.env.PUBLIC_URL}/icon/white_heart.svg`
      }
      alt="heart"
      onClick={onToggle}
      style={{
        width: "20px",
        height: "20px",
        marginRight: "8px",
        cursor: "pointer",
        verticalAlign: "middle",
      }}
    />
  );
};

export default HeartToggle;