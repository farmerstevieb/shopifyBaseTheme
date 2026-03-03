import EmblaCarousel from "embla-carousel";

import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import type { CreateOptionsType } from "embla-carousel/components/Options";
import type { CreatePluginType } from "embla-carousel/components/Plugins";
import type { SlideBoundType } from "embla-carousel/components/SlidesInView";

export type OptionsType = CreateOptionsType<{
  destroyHeight: CSSStyleDeclaration["height"];
}>;

export const defaultOptions: OptionsType = {
  active: true,
  breakpoints: {},
  destroyHeight: "auto",
};

export type AutoHeightOptionsType = Partial<OptionsType>;

declare module "embla-carousel/components/Plugins" {
  interface EmblaPluginsType {
    autoHeight?: AutoHeightType;
  }
}

export type AutoHeightType = CreatePluginType<
  Record<string, unknown>,
  OptionsType
>;

function AutoHeight(userOptions?: AutoHeightOptionsType): AutoHeightType {
  const optionsHandler = EmblaCarousel.optionsHandler();
  const optionsBase = optionsHandler.merge(
    defaultOptions,
    AutoHeight.globalOptions
  );
  let options: AutoHeightType["options"];
  let carousel: EmblaCarouselType;

  let slideBounds: SlideBoundType[] = [];
  let slideHeights: number[] = [];
  const heightEvents: EmblaEventType[] = ["select", "pointerUp"];
  const inViewThreshold = 0.5;

  function init(embla: EmblaCarouselType): void {
    carousel = embla;
    options = optionsHandler.atMedia(self.options);
    const {
      options: { axis },
      slidesInView,
      slideRects,
    } = carousel.internalEngine();
    if (axis === "y") return;

    slideBounds = slidesInView.findSlideBounds(undefined, inViewThreshold);
    slideHeights = slideRects.map((rect) => rect.height);

    heightEvents.forEach((evt) => carousel.on(evt, setContainerHeight));
    setContainerHeight();
  }

  function destroy(): void {
    heightEvents.forEach((evt) => carousel.off(evt, setContainerHeight));
    setContainerHeight("destroy");
  }

  function highestInView(): number {
    const { slidesInView, target } = carousel.internalEngine();
    const inViewIndexes = slidesInView.check(target.get(), slideBounds);
    const heights = inViewIndexes.map((index) => slideHeights[index]);
    return heights.reduce((a, b) => Math.max(a, b), 0);
  }

  function setContainerHeight(evt?: EmblaEventType): void {
    const height =
      evt === "destroy" ? options.destroyHeight : `${highestInView()}px`;
    carousel.containerNode().style.height = height;
  }

  const self: AutoHeightType = {
    name: "autoHeight",
    options: optionsHandler.merge(optionsBase, userOptions),
    init,
    destroy,
  };
  return self;
}

AutoHeight.globalOptions = undefined as AutoHeightOptionsType | undefined;

export default AutoHeight;
