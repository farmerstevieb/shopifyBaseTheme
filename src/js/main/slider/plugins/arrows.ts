import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import type { CreateOptionsType } from "embla-carousel/components/Options";
import type { CreatePluginType } from "embla-carousel/components/Plugins";

import { getAll } from "../../../utils";

import "./arrows.scss";

type OptionsType = CreateOptionsType<Record<string, unknown>>;

type ArrowsType = CreatePluginType<Record<string, unknown>, OptionsType>;
type ArrowsOptionsType = Partial<OptionsType>;

const defaultOptions: OptionsType = {
  active: true,
  breakpoints: {},
};

function createArrows() {
  const leftArrow = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 17.3779L9 11.665L15 5.95215" stroke="inherit" stroke-linecap="square"/>
    </svg>
  `;

  const rightArrow = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5.95215L15 11.665L9 17.3779" stroke="inherit" stroke-linecap="square"/>
    </svg>
  `;

  /* Left Arrow */
  const elArrowLeft = document.createElement("button");
  elArrowLeft.type = "button";
  elArrowLeft.className =
    "slider-arrows__item slider-arrows__item--prev slider-arrows__item--disabled";
  elArrowLeft.ariaLabel = "Previous slide";
  elArrowLeft.insertAdjacentHTML("afterbegin", leftArrow);

  /* Right Arrow */
  const elArrowRight = document.createElement("button");
  elArrowRight.type = "button";
  elArrowRight.className = "slider-arrows__item slider-arrows__item--next";
  elArrowRight.ariaLabel = "Next slide";
  elArrowRight.insertAdjacentHTML("afterbegin", rightArrow);

  return [elArrowLeft, elArrowRight];
}

export function Arrows(userOptions?: ArrowsOptionsType): ArrowsType {
  const optionsHandler = EmblaCarousel.optionsHandler();
  const optionsBase = optionsHandler.merge(
    defaultOptions,
    Arrows.globalOptions,
  );

  let slider: EmblaCarouselType;
  let root: HTMLElement;
  let elArrowsContainer: HTMLElement;
  let elArrowLeft: HTMLButtonElement;
  let elArrowRight: HTMLButtonElement;

  function init(embla: EmblaCarouselType): void {
    slider = embla;
    root = slider.rootNode();

    const slides = getAll(".slider__item", root);
    const lastSlide = slides.at(-1) as HTMLElement;

    [elArrowLeft, elArrowRight] = createArrows();

    /* Left Arrow */
    if (slider.canScrollPrev()) {
      elArrowLeft.classList.remove("slider-arrows__item--disabled");
    } else {
      elArrowLeft.classList.add("slider-arrows__item--disabled");
    }

    elArrowLeft.addEventListener("click", () => {
      slider.scrollPrev();
      elArrowRight.classList.remove("slider-arrows__item--disabled");

      if (slider.canScrollPrev()) {
        elArrowLeft.classList.remove("slider-arrows__item--disabled");
      } else {
        elArrowLeft.classList.add("slider-arrows__item--disabled");
      }
    });

    /* Right Arrow */
    elArrowRight.addEventListener("click", () => {
      if (slider.scrollSnapList()[slider.selectedScrollSnap()] !== 1) {
        slider.scrollNext();
        elArrowLeft.classList.remove("slider-arrows__item--disabled");
      }

      if (lastSlide.classList.contains("is-selected")) {
        elArrowRight.classList.add("slider-arrows__item--disabled");
      } else {
        elArrowRight.classList.remove("slider-arrows__item--disabled");
      }
    });

    elArrowsContainer = document.createElement("div");
    elArrowsContainer.className = "slider-arrows";
    elArrowsContainer.append(elArrowLeft, elArrowRight);

    toggleArrows();
    slider.on("resize", () => {
      toggleArrows();
    });

    // Append arrows
    const elContainer =
      root.closest(".shopify-section")?.querySelector(".section-header") ??
      root.parentElement;
    const elHeroSplitContainer = root
      .closest(".shopify-section")
      ?.querySelector(".slider__hero-split");
    if (elHeroSplitContainer) {
      elHeroSplitContainer.append(elArrowsContainer);
    } else {
      elContainer?.append(elArrowsContainer);
    }
  }

  function destroy(): void {
    elArrowsContainer.remove();
  }

  function toggleArrows() {
    if (!slider.canScrollNext() && !slider.canScrollPrev()) {
      elArrowsContainer.classList.add("invisible");
    } else {
      elArrowsContainer.classList.remove("invisible");
    }
  }

  return {
    name: "arrows",
    options: optionsHandler.merge(optionsBase, userOptions),
    init,
    destroy,
  };
}

Arrows.globalOptions = undefined as ArrowsOptionsType | undefined;
