import React, { useState } from "react";

import { rcn } from "../../tools/react-class-name";

type ImageProps = {
  url: string;
  loading: "lazy" | "eager";
  pictureClassName?: string;
  imgClassName?: string;
  alt?: string;
};

export default function Image({
  url,
  loading,
  pictureClassName,
  imgClassName,
  alt,
}: ImageProps) {
  const [imageWidth, setImageWidth] = useState<number | undefined>();
  const [imageHeight, setImageHeight] = useState<number | undefined>();

  const widths = "375,550,750,900,1100,1250,1500,1780,1950,2100".split(",");
  const srcSet = widths.map((width) => `${url}&width=${width} ${width}w`);
  const masterImage = `${url}&width=${widths[widths.length]}`;

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.target as HTMLImageElement;
    setImageWidth(naturalWidth);
    setImageHeight(naturalHeight);
  };

  return (
    <picture
      className={`o-picture ${rcn(pictureClassName)}`}
      style={
        {
          "--ar": "var(--nosto-card-size-dsk)",
          "--ar-mob": "var(--nosto-card-size-mob)",
        } as React.CSSProperties
      }
    >
      <source
        media="(max-width: 640px)"
        srcSet={srcSet.join(",")}
        width={imageWidth}
        height={imageHeight}
      />
      <img
        src={masterImage}
        data-src={masterImage}
        {...(alt && { alt: alt })}
        data-srcset={srcSet.join(",")}
        width={imageWidth}
        height={imageHeight}
        loading={loading}
        sizes={widths[0]}
        className={`o-img ${rcn(imgClassName)}`}
        srcSet={srcSet.join(",")}
        onLoad={handleImageLoad}
      />
    </picture>
  );
}
