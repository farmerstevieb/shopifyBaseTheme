import type { EmblaCarouselType } from "embla-carousel";

import { attachEvent, observer, type Observer } from "../../utils";

export function setupAutoplay(embla: EmblaCarouselType, { props }: any) {
  let timer = 0;
  let observerInstance: Observer.ObserverInstance | undefined;

  const stop = () => {
    window.clearTimeout(timer);
    timer = 0;
  };

  const play = () => {
    stop();
    requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        if (embla.canScrollNext()) embla.scrollNext();
        else embla.scrollTo(0);
        play();
      }, props.autoPlay);
    });
  };

  embla.on("pointerDown", stop);
  embla.on("destroy", stop);

  // Start autoplaying when page is fully loaded and rootNode is in view.
  if (document.readyState === "complete") {
    observerInstance = observer.observe(embla.rootNode(), (inView) => {
      if (inView) play();
      else stop();
    });
  } else {
    attachEvent(
      "load",
      window,
      () => {
        observerInstance = observer.observe(embla.rootNode(), (inView) => {
          if (inView) play();
          else stop();
        });
      },
      { once: true },
    );
  }

  attachEvent("visibilitychange", document, () => {
    if (document.visibilityState === "visible" && observerInstance?.inView)
      play();
    else stop();
  });
}
