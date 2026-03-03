import EmblaCarousel, {
  type EmblaCarouselType,
  type EmblaOptionsType,
} from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import { get } from "../../utils";
import { Arrows } from "./plugins/arrows";
import AutoHeight from "./plugins/autoHeight";
import Autoplay from "./plugins/autoPlay";
import ClassNames from "./plugins/classNames";
import { Pagination } from "./plugins/dots";
import { setupSliderThumbnails } from "./SliderThumbnails";

export type SliderProps = {
  enabled: boolean | string;
  align: "start" | "center" | "end" | number;
  autoPlay: number;
  showDots: boolean;
  loop: boolean;
  showArrows: boolean | string;
  adjustArrows: boolean;
  applyStyle: boolean;
  autoHeight?: boolean;
  wheelGestures: boolean;
};

const optionsHandler = EmblaCarousel.optionsHandler();

class Slider extends HTMLElement {
  embla?: EmblaCarouselType;

  get enabled() {
    return this.getAttribute("enabled")?.trim();
  }

  get autoPlay() {
    let delay = this.getAttribute("autoplay");
    if (delay == null || delay === "0") {
      return {
        active: false,
      };
    }
    delay = Number(delay);
    return { active: true, delay: delay || 5000 };
  }

  get align() {
    return (this.getAttribute("align") ?? "start") as EmblaOptionsType["align"];
  }

  get loop() {
    return this.hasAttribute("loop");
  }

  get wheelGestures() {
    return this.hasAttribute("wheelGestures");
  }

  get thumbnails() {
    return this.hasAttribute("thumbnails");
  }

  get showArrows() {
    return this.hasAttribute("showArrows");
  }

  get showDots() {
    return this.hasAttribute("showDots");
  }

  get autoHeight() {
    return this.hasAttribute("autoHeight");
  }

  get applyStyle() {
    return this.hasAttribute("applyStyle");
  }

  constructor() {
    super();

    this.listen();
  }

  disconnectedCallback() {
    this.embla?.destroy();
  }

  listen = () => {
    // Make sure we have track element
    if (!get(".slider__track", this)) return;

    if (this.enabled === "" || this.enabled === "true") {
      this.setup();

      return;
    }
    if (this.enabled === "false" || !this.enabled) return;
    if (this.applyStyle) this.cleanUp();

    const mediaQueryList = matchMedia(this.enabled);
    if (mediaQueryList.matches) this.setup();

    mediaQueryList.addEventListener("change", ({ matches }) => {
      if (matches) this.setup();
      else this.cleanUp();
    });
  };

  setup = () => {
    const elViewport = this.getViewport();
    this.getImageHeight(elViewport);
    // Do not create slider if not necessary
    if (elViewport.scrollWidth < this.clientWidth) return;

    const baseOptions: { active: boolean; breakpoints: Record<string, any> } = {
      active: false,
      breakpoints: {},
    };

    if (this.enabled === "" || this.enabled === "true") {
      baseOptions.active = true;
    } else if (this.enabled && this.enabled !== "false") {
      baseOptions.breakpoints[this.enabled] = {
        active: true,
      };
    }

    const options: EmblaOptionsType = optionsHandler.merge(
      {
        align: this.align,
        containScroll: "keepSnaps",
        inViewThreshold: 1,
        loop: this.loop,
        skipSnaps: true,
      },
      baseOptions,
    );

    elViewport.classList.add("is-active");

    requestAnimationFrame(() => {
      this.embla = EmblaCarousel(elViewport, options, [
        ClassNames(),
        Arrows({ active: this.showArrows }),
        Pagination({ active: this.showDots }),
        AutoHeight({ active: this.autoHeight }),
        WheelGesturesPlugin({ active: this.wheelGestures }),
        Autoplay({
          active: this.autoPlay.active,
        }),
      ]);

      if (this.thumbnails) setupSliderThumbnails(this.embla, { element: this });
    });
  };

  getImageHeight(el) {
    const slideImage = el.querySelector(".js-hero-media");
    if (!slideImage) return;
    el.style.setProperty(`--image-height`, `${slideImage.clientHeight}px`);
  }

  getViewport = () => {
    const existingElement = get("[data-slider=viewport]", this);
    if (existingElement) return existingElement;

    const elViewport = document.createElement("div");
    elViewport.className = "slider__viewport";
    elViewport.setAttribute("data-slider", "viewport");
    while (this.lastChild) elViewport.append(this.lastChild);
    this.append(elViewport);
    return elViewport;
  };

  cleanUp = () => {
    const elViewport = this.getViewport();
    elViewport.classList.remove("is-active", "is-draggable");

    this.embla?.destroy();
  };

  reload = () => {
    if (this.embla) {
      this.embla.reInit();
    } else {
      this.setup();
    }
  };
}

// Define element

customElements.define("juno-slider", Slider);
