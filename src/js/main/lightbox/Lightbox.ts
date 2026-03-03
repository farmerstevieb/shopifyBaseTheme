import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import Pinchzoom from "pinch-zoom-js";

import { get } from "../../utils";
import ClassNames from "../slider/plugins/classNames";

import "./Lightbox.scss";

export class Lightbox {
  elDialog = get("#ProductMediaModal") as HTMLElement;
  embla?: EmblaCarouselType;

  constructor() {
    document.addEventListener("click", (event: Event) => {
      if (event.target instanceof Element) {
        const elTrigger = event.target.closest("[data-lightbox]");
        if (!elTrigger) return;

        const index = elTrigger.getAttribute("data-lightbox");
        if (!index) return;

        this.open(+index);
      }
    });
  }

  open(initialIndex: number) {
    const rootNode = this.embla?.rootNode();
    if (rootNode && !rootNode.isConnected) this.embla = undefined;

    this.elDialog.show();

    if (!this.embla) {
      requestAnimationFrame(() => {
        this.initEmbla({ startIndex: initialIndex });
      });
    } else {
      this.embla.scrollTo(initialIndex, true);
    }
  }

  initEmbla({ startIndex }: { startIndex: number }) {
    const elViewport = get(".c-lightbox__viewport", this.elDialog);
    if (!elViewport) return;

    elViewport.classList.add("is-active");

    this.embla = EmblaCarousel(
      elViewport,
      {
        containScroll: "keepSnaps",
        inViewThreshold: 1,
        loop: true,
        skipSnaps: true,
        startIndex,
        draggable: true,
        axis: "x",
        speed: 7.5,
        breakpoints: {
          "(min-width: 768px)": {
            axis: "y",
          },
        },
      },
      [ClassNames()],
    );

    const elThumbnails = get(".c-lightbox__thumbnails", this.elDialog);
    if (elThumbnails) {
      elThumbnails.append(...this.generateThumbnails());
    }

    this.initialiseZoom(
      this.embla.slideNodes()[this.embla!.selectedScrollSnap()],
    );
    this.embla.on("select", () => {
      this.initialiseZoom(
        this.embla!.slideNodes()[this.embla!.selectedScrollSnap()],
      );
    });
  }

  generateThumbnails() {
    if (!this.embla) return [];

    const elThumbnails = [] as HTMLElement[];

    for (const [index, slide] of this.embla.slideNodes().entries()) {
      const elButton = document.createElement("button");
      elButton.onclick = () => this.embla?.scrollTo(index);

      elButton.insertAdjacentHTML(
        "afterbegin",
        `<img src="${slide.dataset.thumbnail}" width="48" height="48" decoding="async">`,
      );

      elThumbnails.push(elButton);
    }

    elThumbnails[this.embla.selectedScrollSnap()].classList.add("is-selected");

    // Events
    this.embla.on("select", () => {
      const previous = this.embla?.previousScrollSnap();
      if (previous != null)
        elThumbnails[previous].classList.remove("is-selected");
      const selected = this.embla?.selectedScrollSnap();
      if (selected != null) elThumbnails[selected].classList.add("is-selected");
    });

    return elThumbnails;
  }

  preloadZoomImage(src: string) {
    return new Promise((res) => {
      const elImg = document.createElement("img");
      elImg.src = src;
      elImg.onload = res;
    });
  }

  async initialiseZoom(currentSlide: HTMLElement) {
    // Already setup
    // @ts-expect-error TODO
    if (currentSlide.hasZoom) return;
    // @ts-expect-error TODO
    currentSlide.hasZoom = true;

    const elPicture = get("picture", currentSlide);
    if (!elPicture) return;

    const elImage = get("img", currentSlide) as HTMLImageElement;
    if (!elImage) return;

    const closestSize =
      [375, 550, 750, 900, 1100, 1250, 1500, 1780, 1950, 2100].filter(
        (x) => x >= window.innerWidth,
      )[1] ?? 2100;

    const zoomImageSrc =
      currentSlide.dataset.zoom
        ?.replace("width=1", `width=${closestSize}`)
        .replace("height=1", `height=${closestSize}`) ?? "";

    if (matchMedia("(pointer: fine)").matches) {
      let isHovering = false;
      let rect: DOMRect;

      await this.preloadZoomImage(zoomImageSrc);

      currentSlide.addEventListener("mouseenter", (e) => {
        isHovering = true;
        elPicture.style.backgroundColor = "#fff";
        elPicture.style.backgroundImage = `url(${zoomImageSrc})`;
        elPicture.style.backgroundPosition = "center center";
        elPicture.style.backgroundRepeat = "no-repeat";
        elImage.style.opacity = "0";
        rect = currentSlide.getBoundingClientRect();
      });

      currentSlide.addEventListener("mousemove", (e) => {
        if (!isHovering) {
          isHovering = true;
          elPicture.style.backgroundColor = "#fff";
          elPicture.style.backgroundImage = `url(${zoomImageSrc})`;
          elImage.style.opacity = "0";
          rect = currentSlide.getBoundingClientRect();
        }

        const positionX = ((e.clientX - rect.left) / rect.width) * 100,
          positionY = ((e.clientY - rect.top) / rect.height) * 100;
        elPicture.style.backgroundPosition = `${positionX}% ${positionY}%`;
      });

      currentSlide.addEventListener("mouseout", (e) => {
        isHovering = false;
        elPicture.style.backgroundColor = "";
        elPicture.style.backgroundImage = "";
        elPicture.style.backgroundPosition = `center`;
        elImage.style.opacity = "1";
      });
    } else {
      new Pinchzoom(elPicture);
    }
  }
}
