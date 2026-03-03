import React from "react";

type IconProps = {
  name?: string;
  className?: string;
  width?: string;
  height?: string;
};

export default function Icon({
  name,
  className,
  width = "24",
  height = "24",
}: IconProps) {
  const nameClass = name ? `nst-icons-${name}` : "";
  const customClasses = [nameClass, className];

  return (
    <i
      className={`nst-icons ${customClasses.join(" ")}`}
      style={
        {
          "--nst-width-icon": `${width}px`,
          "--nst-height-icon": `${height}px`,
        } as React.CSSProperties
      }
    ></i>
  );
}
