import React from "react";

import { rcn } from "../../tools/react-class-name";

type LoaderProps = {
  className?: string;
  stroke?: string;
  size?: number;
  hidden?: boolean;
};

export default function Loader({
  className,
  stroke = "black",
  size = 50,
  hidden = false,
}: LoaderProps) {
  const sizeString = `${size}px`;
  return (
    <div
      className={`loading-overlay flex animate-fade-in items-center justify-center${rcn(className)}`}
      hidden={hidden}
      style={{
        width: sizeString,
      }}
    >
      <div
        className="loading-overlay__spinner"
        style={{
          width: sizeString,
        }}
      >
        <svg
          className="spinner"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 66 66"
          xmlns="http://www.w3.org/2000/svg"
          stroke={stroke}
          width={size}
          height={size}
        >
          <circle
            className="path"
            fill="none"
            strokeWidth="6"
            cx="33"
            cy="33"
            r="30"
          ></circle>
        </svg>
      </div>
    </div>
  );
}
