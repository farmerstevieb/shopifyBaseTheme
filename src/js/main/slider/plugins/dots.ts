import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";

import type { CreateOptionsType } from "embla-carousel/components/Options";
import type { CreatePluginType } from "embla-carousel/components/Plugins";

import "./dots.scss";

type OptionsType = CreateOptionsType<Record<string, unknown>>;

type PaginationType = CreatePluginType<Record<string, unknown>, OptionsType>;
type PaginationOptionsType = Partial<OptionsType>;

const defaultOptions: OptionsType = {
  active: true,
  breakpoints: {},
};

function createPagination(slideCount: number) {
  const elPagination = document.createElement("div");
  elPagination.className = "slider-dots";

  for (let i = 0; i < slideCount; i++) {
    elPagination.insertAdjacentHTML(
      "beforeend",
      `<button type="button" data-index="${i}"><span class="sr-only">Slide ${i}</span></button>`
    );
  }

  return elPagination;
}

export function Pagination(
  userOptions?: PaginationOptionsType
): PaginationType {
  const optionsHandler = EmblaCarousel.optionsHandler();
  const optionsBase = optionsHandler.merge(
    defaultOptions,
    Pagination.globalOptions
  );

  let slider: EmblaCarouselType;
  let root: HTMLElement;
  let elPagination: HTMLDivElement;

  //

  function init(embla: EmblaCarouselType): void {
    slider = embla;
    root = slider.rootNode();

    elPagination = createPagination(slider.slideNodes().length);

    elPagination.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement) {
        const targetIndex = event.target
          .closest("[data-index]")
          ?.getAttribute("data-index");
        if (targetIndex != null) {
          slider.scrollTo(+targetIndex);
        }
      }
    });

    slider.on("select", () => {
      setSelectedDotBtn();
    });

    setSelectedDotBtn();

    // Append pagination
    const elHeroSplitContainer = root
      .closest(".shopify-section")
      ?.querySelector(".slider__hero-split");
    if (elHeroSplitContainer) {
      elHeroSplitContainer.append(elPagination);
    } else {
      root.insertAdjacentElement("afterend", elPagination);
    }
  }

  function destroy(): void {
    elPagination.remove();
  }

  function setSelectedDotBtn() {
    const elDots = Array.from(elPagination.children);
    const previous = slider.previousScrollSnap();
    const selected = slider.selectedScrollSnap();
    elDots[previous].removeAttribute("aria-current");
    elDots[selected].setAttribute("aria-current", "step");
  }

  return {
    name: "pagination",
    options: optionsHandler.merge(optionsBase, userOptions),
    init,
    destroy,
  };
}

Pagination.globalOptions = undefined as PaginationOptionsType | undefined;
