import EmblaCarousel from "embla-carousel";

import type { EmblaCarouselType } from "embla-carousel";
import type { CreateOptionsType } from "embla-carousel/components/Options";
import type { CreatePluginType } from "embla-carousel/components/Plugins";

export type OptionsType = CreateOptionsType<{
  delay: number;
  jump: boolean;
  playOnInit: boolean;
  stopOnInteraction: boolean;
  stopOnMouseEnter: boolean;
  stopOnLastSnap: boolean;
  rootNode: ((emblaRoot: HTMLElement) => HTMLElement | null) | null;
}>;

export const defaultOptions: OptionsType = {
  active: true,
  breakpoints: {},
  delay: 6000,
  jump: false,
  playOnInit: true,
  stopOnInteraction: true,
  stopOnMouseEnter: false,
  stopOnLastSnap: false,
  rootNode: null,
};

export type AutoplayOptionsType = Partial<OptionsType>;

declare module "embla-carousel/components/Plugins" {
  interface EmblaPluginsType {
    autoplay?: AutoplayType;
  }
}

export type AutoplayType = CreatePluginType<
  {
    play: (jump?: boolean) => void;
    stop: () => void;
    reset: () => void;
  },
  OptionsType
>;

function Autoplay(userOptions?: AutoplayOptionsType): AutoplayType {
  const optionsHandler = EmblaCarousel.optionsHandler();
  const optionsBase = optionsHandler.merge(
    defaultOptions,
    Autoplay.globalOptions
  );
  let options: AutoplayType["options"];
  let carousel: EmblaCarouselType;
  let interaction: () => void;
  let timer = 0;
  let jump = false;

  function init(embla: EmblaCarouselType): void {
    carousel = embla;
    options = optionsHandler.atMedia(self.options);
    jump = options.jump;
    interaction = options.stopOnInteraction ? destroy : stop;
    const { eventStore } = carousel.internalEngine();
    const emblaRoot = carousel.rootNode();
    const root = (options.rootNode && options.rootNode(emblaRoot)) || emblaRoot;

    carousel.on("pointerDown", interaction);
    if (!options.stopOnInteraction) carousel.on("pointerUp", reset);

    if (options.stopOnMouseEnter) {
      eventStore.add(root, "mouseenter", interaction);
      if (!options.stopOnInteraction) eventStore.add(root, "mouseleave", reset);
    }

    eventStore.add(document, "visibilitychange", () => {
      if (document.visibilityState === "hidden") return stop();
      reset();
    });
    eventStore.add(window, "pagehide", (event: PageTransitionEvent) => {
      if (event.persisted) stop();
    });

    if (options.playOnInit) play();
  }

  function destroy(): void {
    carousel.off("pointerDown", interaction);
    if (!options.stopOnInteraction) carousel.off("pointerUp", reset);
    stop();
    timer = 0;
  }

  function play(jumpOverride?: boolean): void {
    stop();
    if (typeof jumpOverride !== "undefined") jump = jumpOverride;
    timer = window.setTimeout(next, options.delay);
  }

  function stop(): void {
    if (!timer) return;
    window.clearTimeout(timer);
  }

  function reset(): void {
    if (!timer) return;
    stop();
    play();
  }

  function next(): void {
    const { index } = carousel.internalEngine();
    const kill = options.stopOnLastSnap && index.get() === index.max;

    if (kill) return destroy();

    if (carousel.canScrollNext()) {
      carousel.scrollNext(jump);
    } else {
      carousel.scrollTo(0, jump);
    }
    play();
  }

  const self: AutoplayType = {
    name: "autoplay",
    options: optionsHandler.merge(optionsBase, userOptions),
    init,
    destroy,
    play,
    stop,
    reset,
  };
  return self;
}

Autoplay.globalOptions = <AutoplayOptionsType | undefined>undefined;

export default Autoplay;
