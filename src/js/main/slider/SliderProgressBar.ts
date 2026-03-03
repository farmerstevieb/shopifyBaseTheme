import type { EmblaCarouselType } from "embla-carousel";

import { createElement } from "../../utils";

export function setupSliderProgressBar(embla: EmblaCarouselType, { element }) {
  // Create progress bar
  const elProgressBar = createElement({
    type: "div",
    props: {
      className: "slider__progress",
      children: [{ type: "div" }],
    },
  });

  // Events
  const updateProgressBar = () => {
    const progress = Math.max(0, Math.min(1, embla.scrollProgress()));
    element.style.setProperty("--progress-bar-position", `${progress * 100}%`);
  };

  embla.on("scroll", updateProgressBar);
  embla.on("reInit", updateProgressBar);
  embla.on("destroy", () => {
    elProgressBar.remove();
  });

  // Append
  element.append(elProgressBar);
}
