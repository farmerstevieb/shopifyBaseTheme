import React, { useEffect, useState } from "react";
import he from "he";

import Image from "./elements/image";

export type BannerBlock = {
  id: string;
  type: "banner";
  settings: {
    banner_width: "single" | "double" | "triple" | "full";
    order: number;

    content_width?: number;
    offset_heading?: number;

    subheading_spacing?: number;
    heading_spacing?: number;
    overline_spacing?: number;
    description_spacing?: number;

    subheading_spacing_desktop?: number;
    heading_spacing_desktop?: number;
    overline_spacing_desktop?: number;
    description_spacing_desktop?: number;

    cta_sizes?: "standard" | "small" | "medium" | "large" | "full";
    cta_sizes_dsk?: "standard" | "small" | "medium" | "large" | "full";
    cta_align?: "horizontal" | "vertical";
    cta_align_desktop?: "horizontal" | "vertical";

    position?: "start" | "center" | "end";
    vertical_position?: "top" | "center" | "bottom";
    position_desktop?: "start" | "center" | "end";
    vertical_position_desktop?: "top" | "center" | "bottom";

    color?: "dark" | "secondary" | "light" | "amsterdam";
    color_desk?: "dark" | "secondary" | "light" | "amsterdam";

    subheading_size?: "2xs" | "xs" | "sm" | "md" | "base" | "lg" | "2xl";
    heading_size?:
      | "md"
      | "base"
      | "lg"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl"
      | "7xl"
      | "8xl"
      | "9xl";
    overline_size?: "2xs" | "sm" | "md" | "base" | "lg" | "2xl";
    text_size?: "2xs" | "sm" | "smd" | "md" | "base" | "lg" | "2xl";

    subheading_size_desktop?:
      | "2xs"
      | "xs"
      | "sm"
      | "md"
      | "base"
      | "lg"
      | "2xl";
    heading_size_desktop?:
      | "md"
      | "base"
      | "lg"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl"
      | "7xl"
      | "8xl"
      | "9xl";
    overline_size_desktop?: "2xs" | "sm" | "md" | "base" | "lg" | "2xl";
    text_size_desktop?: "2xs" | "sm" | "smd" | "md" | "base" | "lg" | "2xl";

    mobile_subheading?: string;
    mobile_heading?: string;
    mobile_overline?: string;
    mobile_text?: string;

    subheading?: string;
    subheading_tranform?: "uppercase" | "capitalize";
    heading?: string;
    heading_font_weight?:
      | ""
      | "font-thin"
      | "font-light"
      | "font-normal"
      | "font-medium"
      | "font-semibold"
      | "font-bold"
      | "font-extrabold"
      | "font-black";
    heading_font_weight_mobile?:
      | ""
      | "font-thin"
      | "font-light"
      | "font-normal"
      | "font-medium"
      | "font-semibold"
      | "font-bold"
      | "font-extrabold"
      | "font-black";
    overline?: string;
    text?: string;
    text_tranform?: "uppercase" | "capitalize";
    text_weight?: "font-medium" | "font-semibold" | "font-bold";
    text_undeline?: boolean;

    cta_1_text?: string;
    cta_1_icon?: string;
    cta_1_icon_html?: string;
    cta_1_icon_position?: "left" | "right";
    cta_1_link?: string;
    cta_1_link_style?:
      | "primary"
      | "secondary"
      | "tertiary"
      | "quaternary"
      | "link";
    cta_1_target?: boolean;

    cta_2_text?: string;
    cta_2_icon?: string;
    cta_2_icon_html?: string;
    cta_2_icon_position?: "left" | "right";
    cta_2_link?: string;
    cta_2_link_style?:
      | "primary"
      | "secondary"
      | "tertiary"
      | "quaternary"
      | "link";
    cta_2_target?: boolean;

    image?: string;
    image_mobile?: string;
    image_fit?: "cover" | "contain";
    hide_mobile_media?: boolean;
    video_url?: string;
    video_file?: string;
    video_autoplay?: boolean;
    video_muted?: boolean;
  };
};

type BannerProps = {
  block: BannerBlock;
  index: number;
};

function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return {
    isMobile: windowWidth < 1024,
    isMobileImage: windowWidth < 768,
    windowWidth,
  };
}

export default function Banner({ block, index }: BannerProps) {
  const { settings } = block;
  const { isMobile, isMobileImage, windowWidth } = useResponsive();

  const transformHeadingHTML = (html: string) => {
    try {
      return html
        .replace(/p>/g, "span>")
        .replace(/\[highlight\]/g, '<span class="text-highlight">')
        .replace(/\[\/highlight\]/g, "</span>");
    } catch (_e) {
      return html;
    }
  };

  const getWidthClass = (width: string) => {
    switch (width) {
      case "double":
        return "col-span-2";
      case "triple":
        return "col-span-2 md:col-span-3";
      case "full":
        return "col-span-2 md:col-span-2 xl:col-span-4";
      default:
        return "col-span-1";
    }
  };

  const getAspectRatio = (width: string) => {
    switch (width) {
      case "double":
        return "min-h-[200px]";
      case "triple":
        return "min-h-[200px]";
      case "full":
        return "min-h-[300px]";
      default:
        return "min-h-[200px]";
    }
  };

  const getTextSizeClass = (size: string | undefined, isDesktop = false) => {
    if (!size) return "";
    switch (size) {
      case "2xs":
        return isDesktop ? "lg:text-[10px]" : "text-[10px]";
      case "xs":
        return isDesktop ? "lg:text-[11px]" : "text-[11px]";
      case "sm":
        return isDesktop ? "lg:text-[12px]" : "text-[12px]";
      case "smd":
        return isDesktop ? "lg:text-[13px]" : "text-[13px]";
      case "md":
        return isDesktop ? "lg:text-[14px]" : "text-[14px]";
      case "base":
        return isDesktop ? "lg:text-[16px]" : "text-[16px]";
      case "lg":
        return isDesktop ? "lg:text-[18px]" : "text-[18px]";
      case "2xl":
        return isDesktop ? "lg:text-[24px]" : "text-[24px]";
      case "3xl":
        return isDesktop ? "lg:text-[28px]" : "text-[28px]";
      case "4xl":
        return isDesktop ? "lg:text-[32px]" : "text-[32px]";
      case "5xl":
        return isDesktop ? "lg:text-[36px]" : "text-[36px]";
      case "6xl":
        return isDesktop ? "lg:text-[40px]" : "text-[40px]";
      case "7xl":
        return isDesktop ? "lg:text-[48px]" : "text-[48px]";
      case "8xl":
        return isDesktop ? "lg:text-[64px]" : "text-[64px]";
      case "9xl":
        return isDesktop ? "lg:text-[72px]" : "text-[72px]";
      default:
        return "";
    }
  };

  const getSpacingStyle = (
    mobileSpacing: number | undefined,
    desktopSpacing: number | undefined,
  ) => {
    const styles: React.CSSProperties & { [key: string]: any } = {};

    if (mobileSpacing !== undefined) {
      styles["--mobile-margin-bottom"] = `${mobileSpacing}px`;
      styles.marginBottom = `${mobileSpacing}px`;
    }

    if (desktopSpacing !== undefined) {
      styles["--desktop-margin-bottom"] = `${desktopSpacing}px`;
    }

    return styles;
  };

  const getPositionClasses = () => {
    const horizontal = settings.position || "center";
    const vertical = settings.vertical_position || "center";

    const horizontalDesktop = settings.position_desktop || horizontal;
    const verticalDesktop = settings.vertical_position_desktop || vertical;

    const horizontalClassMobile =
      horizontal === "start" ? "items-start text-left"
      : horizontal === "end" ? "items-end text-right"
      : "items-center text-center";

    const verticalClassMobile =
      vertical === "top" ? "justify-start"
      : vertical === "bottom" ? "justify-end"
      : "justify-center";

    const horizontalClassDesktop =
      horizontalDesktop === "start" ? "lg:items-start lg:text-left"
      : horizontalDesktop === "end" ? "lg:items-end lg:text-right"
      : "lg:items-center lg:text-center";

    const verticalClassDesktop =
      verticalDesktop === "top" ? "lg:justify-start"
      : verticalDesktop === "bottom" ? "lg:justify-end"
      : "lg:justify-center";

    return `${horizontalClassMobile} ${verticalClassMobile} ${horizontalClassDesktop} ${verticalClassDesktop}`;
  };

  const getTextColorClass = () => {
    const color =
      (isMobile ? settings.color : settings.color_desk) ||
      settings.color ||
      "light";

    switch (color) {
      case "dark":
        return "text-brand-bramble";
      case "light":
        return "text-primaryInverse";
      default:
        return "text-brand-bramble";
    }
  };

  const getCtaSizeClass = () => {
    const size =
      (isMobile ? settings.cta_sizes : settings.cta_sizes_dsk) ||
      settings.cta_sizes ||
      "full";

    switch (size) {
      case "standard":
        return "w-[180px]";
      case "small":
        return "w-[160px]";
      case "medium":
        return "w-[246px]";
      case "large":
        return "w-[309px]";
      case "full":
        return "w-full";
      default:
        return "w-full";
    }
  };

  const getCtaAlignClass = () => {
    const align =
      (isMobile ? settings.cta_align : settings.cta_align_desktop) ||
      settings.cta_align ||
      "vertical";

    return align === "horizontal" ? "flex-row gap-4" : "flex-col gap-2";
  };

  const getImageObjectFit = () => {
    return settings.image_fit === "contain" ? "object-contain" : "object-cover";
  };

  const getContentWidthStyle = () => {
    if (!settings.content_width) return {};
    return { maxWidth: `${settings.content_width}px` };
  };

  const getContentWidthClass = () => {
    const size =
      (isMobile ? settings.cta_sizes : settings.cta_sizes_dsk) ||
      settings.cta_sizes ||
      "full";

    return size === "full" ? "w-full" : "";
  };

  const getHeadingWidthStyle = () => {
    if (!settings.offset_heading || !settings.content_width) return {};
    return {
      maxWidth: `${settings.content_width + settings.offset_heading}px`,
    };
  };

  const getTransformClass = (transform: string | undefined) => {
    switch (transform) {
      case "uppercase":
        return "uppercase";
      case "capitalize":
        return "capitalize";
      default:
        return "";
    }
  };

  const currentSubheading =
    (isMobile && settings.mobile_subheading) || settings.subheading;
  const currentHeading =
    (isMobile && settings.mobile_heading) || settings.heading;
  const getHeadingFontWeightClasses = () => {
    const mobileWeight = settings.heading_font_weight_mobile;
    const desktopWeight = settings.heading_font_weight;

    const effectiveMobileWeight =
      mobileWeight === "" || mobileWeight === undefined ?
        desktopWeight
      : mobileWeight;

    const mobileClass =
      effectiveMobileWeight === "" || effectiveMobileWeight === undefined ?
        "font-normal"
      : effectiveMobileWeight || "font-bold";
    const desktopClass =
      desktopWeight === "" || desktopWeight === undefined ?
        "font-normal"
      : desktopWeight || "font-bold";

    if (mobileClass === desktopClass) {
      return mobileClass;
    } else {
      const finalClass = `${mobileClass} lg:${desktopClass}`;
      return finalClass;
    }
  };
  const currentOverline =
    (isMobile && settings.mobile_overline) || settings.overline;
  const currentText = (isMobile && settings.mobile_text) || settings.text;

  const videoSrc = settings.video_file || settings.video_url;
  const imageUrl = (isMobileImage && settings.image_mobile) || settings.image;

  const shouldShowVideo =
    !!videoSrc && !(isMobileImage && settings.image_mobile);
  const shouldHideMedia = isMobile && settings.hide_mobile_media;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Mobile spacing (default) */
          [style*="--mobile-margin-bottom"] {
            margin-bottom: var(--mobile-margin-bottom);
          }

          /* Desktop spacing override */
          @media (min-width: 1024px) {
            [style*="--desktop-margin-bottom"] {
              margin-bottom: var(--desktop-margin-bottom) !important;
            }
          }

        `,
        }}
      />
      <li
        className={`nosto-banner ${getWidthClass(settings.banner_width)} card__banner order-[var(--order)]`}
        style={{ "--order": settings.order || 1 } as React.CSSProperties}
      >
        <div
          className={`card card--banner-grid relative overflow-hidden ${getAspectRatio(settings.banner_width)}`}
        >
          {!shouldHideMedia && (
            <div className="relative h-full">
              {isMobileImage && settings.image_mobile ?
                <Image
                  url={settings.image_mobile}
                  loading={index > 2 ? "lazy" : "eager"}
                  imgClassName={`o-img--cover w-full h-auto ${getImageObjectFit()}`}
                  pictureClassName="w-full h-full"
                />
              : shouldShowVideo ?
                (() => {
                  const video = videoSrc as any;
                  let videoId = `video-${index}`;
                  let videoType = "html5";
                  let videoDataAttrs = {};

                  if (
                    typeof video === "string" &&
                    video.includes("youtube.com")
                  ) {
                    videoType = "youtube";
                    const youtubeMatch = video.match(
                      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                    );
                    if (youtubeMatch && youtubeMatch[1]) {
                      videoId = youtubeMatch[1];
                    }
                    videoDataAttrs = { "data-url": video };
                  } else if (
                    typeof video === "string" &&
                    video.includes("vimeo.com")
                  ) {
                    videoType = "vimeo";
                    const vimeoMatch = video.match(/vimeo\.com\/(\d+)/);
                    if (vimeoMatch && vimeoMatch[1]) {
                      videoId = vimeoMatch[1];
                    }
                    videoDataAttrs = { "data-url": video };
                  } else if (
                    video &&
                    typeof video === "object" &&
                    video.sources?.length > 0
                  ) {
                    videoType = "html5";
                    videoId = video.id || `video-${index}`;
                    videoDataAttrs = { "data-sources": JSON.stringify(video) };
                  } else if (video && typeof video === "object") {
                    if (video.host === "youtube") {
                      videoType = "youtube";
                      videoId =
                        video.external_id || video.id || `video-${index}`;
                      videoDataAttrs = { "data-url": video.url || video };
                    } else if (video.host === "vimeo") {
                      videoType = "vimeo";
                      videoId =
                        video.external_id || video.id || `video-${index}`;
                      videoDataAttrs = { "data-url": video.url || video };
                    } else {
                      videoType = "html5";
                      videoId = video.id || `video-${index}`;
                      videoDataAttrs = { "data-url": video.url || video };
                    }
                  } else {
                    videoType = "html5";
                    videoDataAttrs = { "data-url": video };
                  }

                  return (
                    <div
                      className="o-video js-video h-full w-full"
                      data-id={videoId}
                      data-type={videoType}
                      data-status="paused"
                      data-settings={`${settings.video_autoplay ? "autoplay " : ""}${settings.video_muted ? "mute " : ""}loop cover canPlayOnMobile`}
                      data-video-type={video?.media_type || "video"}
                      style={{
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="o-video__container js-video-container"
                        {...videoDataAttrs}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                        }}
                      ></div>
                    </div>
                  );
                })()
              : imageUrl ?
                <Image
                  url={imageUrl}
                  loading={index > 2 ? "lazy" : "eager"}
                  imgClassName={`o-img--cover w-full h-auto ${getImageObjectFit()}`}
                  pictureClassName="w-full h-full"
                />
              : <div className="bg-gray-200 flex h-full w-full items-center justify-center">
                  <span className="text-gray-500">No media</span>
                </div>
              }
            </div>
          )}

          {(currentHeading ||
            currentSubheading ||
            currentOverline ||
            currentText ||
            settings.cta_1_text ||
            settings.cta_2_text) && (
            <div
              className={`absolute inset-0 flex flex-col p-4 lg:p-6 ${getPositionClasses()} ${getTextColorClass()}`}
            >
              <div
                style={getContentWidthStyle()}
                className={getContentWidthClass()}
              >
                {currentSubheading && (
                  <div
                    className={` ${getTextSizeClass(settings.subheading_size)} ${getTextSizeClass(settings.subheading_size_desktop, true)} ${getTransformClass(settings.subheading_tranform)} font-medium uppercase tracking-wide opacity-90`}
                    style={getSpacingStyle(
                      settings.subheading_spacing,
                      settings.subheading_spacing_desktop,
                    )}
                    dangerouslySetInnerHTML={{ __html: currentSubheading }}
                  />
                )}

                {currentHeading && (
                  <div
                    className={`[&_span]:leading-[1] ${getTextSizeClass(settings.heading_size)} ${getTextSizeClass(settings.heading_size_desktop, true)} ${getHeadingFontWeightClasses()} font-heading`}
                    style={{
                      ...getHeadingWidthStyle(),
                      ...getSpacingStyle(
                        settings.heading_spacing,
                        settings.heading_spacing_desktop,
                      ),
                    }}
                    dangerouslySetInnerHTML={{
                      __html: transformHeadingHTML(currentHeading),
                    }}
                  />
                )}

                {currentOverline && (
                  <div
                    className={` ${getTextSizeClass(settings.overline_size)} ${getTextSizeClass(settings.overline_size_desktop, true)} opacity-90`}
                    style={getSpacingStyle(
                      settings.overline_spacing,
                      settings.overline_spacing_desktop,
                    )}
                    dangerouslySetInnerHTML={{ __html: currentOverline }}
                  />
                )}

                {currentText && (
                  <div
                    className={`rte ${getTextSizeClass(settings.text_size)} ${getTextSizeClass(settings.text_size_desktop, true)} ${getTransformClass(settings.text_tranform)} ${settings.text_weight || ""} ${settings.text_undeline ? "underline" : ""} leading-snug opacity-90`}
                    style={getSpacingStyle(
                      settings.description_spacing,
                      settings.description_spacing_desktop,
                    )}
                    dangerouslySetInnerHTML={{ __html: currentText }}
                  />
                )}

                {(settings.cta_1_text || settings.cta_2_text) && (
                  <div className={`flex ${getCtaAlignClass()}`}>
                    {settings.cta_1_text && settings.cta_1_link && (
                      <a
                        href={settings.cta_1_link}
                        target={settings.cta_1_target ? "_blank" : undefined}
                        rel={
                          settings.cta_1_target ?
                            "noopener noreferrer"
                          : undefined
                        }
                        className={` ${settings.cta_1_link_style === "link" ? "link underline" : `button button--remove-icon button--${settings.cta_1_link_style || "primary"}`} ${getCtaSizeClass()} flex !min-w-unset items-center justify-center gap-2 px-4 py-rem text-sm font-bold transition-all hover:scale-105 lg:px-6`}
                      >
                        {settings.cta_1_icon_html &&
                          settings.cta_1_icon !== "none" &&
                          settings.cta_1_icon_position === "left" && (
                            <>
                              {settings.cta_1_link_style === "link" ?
                                <div className="o-ctas__cta-icon flex aspect-square min-h-[18px] min-w-[18px] items-center justify-center">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: settings.cta_1_icon_html,
                                    }}
                                  />
                                </div>
                              : <span
                                  dangerouslySetInnerHTML={{
                                    __html: settings.cta_1_icon_html,
                                  }}
                                />
                              }
                            </>
                          )}

                        <span>{he.decode(settings.cta_1_text)}</span>

                        {settings.cta_1_icon_html &&
                          settings.cta_1_icon !== "none" &&
                          settings.cta_1_icon_position === "right" && (
                            <>
                              {settings.cta_1_link_style === "link" ?
                                <div className="o-ctas__cta-icon flex aspect-square min-h-[18px] min-w-[18px] items-center justify-center">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: settings.cta_1_icon_html,
                                    }}
                                  />
                                </div>
                              : <span
                                  dangerouslySetInnerHTML={{
                                    __html: settings.cta_1_icon_html,
                                  }}
                                />
                              }
                            </>
                          )}
                      </a>
                    )}

                    {settings.cta_2_text && settings.cta_2_link && (
                      <a
                        href={settings.cta_2_link}
                        target={settings.cta_2_target ? "_blank" : undefined}
                        rel={
                          settings.cta_2_target ?
                            "noopener noreferrer"
                          : undefined
                        }
                        className={` ${settings.cta_2_link_style === "link" ? "link underline" : `button button--remove-icon button--${settings.cta_2_link_style || "primary"}`} ${getCtaSizeClass()} flex !min-w-unset items-center justify-center gap-2 px-4 py-rem text-sm font-bold transition-all hover:scale-105 lg:px-6`}
                      >
                        {settings.cta_2_icon_html &&
                          settings.cta_2_icon !== "none" &&
                          settings.cta_2_icon_position === "left" && (
                            <>
                              {settings.cta_2_link_style === "link" ?
                                <div className="o-ctas__cta-icon flex aspect-square min-h-[18px] min-w-[18px] items-center justify-center">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: settings.cta_2_icon_html,
                                    }}
                                  />
                                </div>
                              : <span
                                  dangerouslySetInnerHTML={{
                                    __html: settings.cta_2_icon_html,
                                  }}
                                />
                              }
                            </>
                          )}

                        <span>{he.decode(settings.cta_2_text)}</span>

                        {settings.cta_2_icon_html &&
                          settings.cta_2_icon !== "none" &&
                          settings.cta_2_icon_position === "right" && (
                            <>
                              {settings.cta_2_link_style === "link" ?
                                <div className="o-ctas__cta-icon flex aspect-square min-h-[18px] min-w-[18px] items-center justify-center">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: settings.cta_2_icon_html,
                                    }}
                                  />
                                </div>
                              : <span
                                  dangerouslySetInnerHTML={{
                                    __html: settings.cta_2_icon_html,
                                  }}
                                />
                              }
                            </>
                          )}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </li>
    </>
  );
}
