import type { EmblaCarouselType } from "embla-carousel";

import { createElement } from "../../utils";

export function setupSliderThumbnails(embla: EmblaCarouselType, { element }) {
  const elThumbnails: HTMLElement[] = [];

  // Create thumbnails
  for (const [index, slide] of embla.slideNodes().entries()) {
    const slideOptions = {
      src: slide.dataset.thumbnailSource,
      width: slide.dataset.thumbnailWidth,
      height: slide.dataset.thumbnailHeight,
    };

    const elThumbnail = createElement({
      type: "button",
      props: {
        className: "slider__thumbnails-button",
        type: "button",
        ariaLabel: `Slide ${index}`,
        onClick: () => embla.scrollTo(index, true),
        children: [
          {
            type: "img",
            props: {
              src: slideOptions.src,
              className: "slider__thumbnails-media o-img o-img--contain",
              width: slideOptions.width,
              height: slideOptions.height,
              loading: "lazy",
              decoding: "async",
              alt: "",
            },
          },
        ],
      },
    });

    elThumbnails.push(elThumbnail);
  }

  // Append
  const elThumbnailContainer = createElement({
    type: "div",
    props: {
      className: "slider__thumbnails",
    },
  });
  const elThumbnailViewport = createElement({
    type: "div",
    props: {
      className: "slider__thumbnails-viewport",
      children: [
        {
          type: "div",
          props: { className: "slider__thumbnails-track" },
        },
      ],
    },
  });
  elThumbnailViewport.firstElementChild?.append(...elThumbnails);
  elThumbnailContainer.append(elThumbnailViewport);
  element.append(elThumbnailContainer);

  elThumbnails[embla.previousScrollSnap()].classList.remove("is-selected");
  elThumbnails[embla.selectedScrollSnap()].classList.add("is-selected");

  // Events
  embla.on("select", () => {
    const previous = embla.previousScrollSnap();
    const selected = embla.selectedScrollSnap();
    elThumbnails[previous].classList.remove("is-selected");
    elThumbnails[selected].classList.add("is-selected");
  });

  if (elThumbnailViewport.scrollHeight > elThumbnailViewport.clientHeight) {
    const elThumbnailArrow = createElement({
      type: "button",
      props: {
        className: "slider__thumbnails-arrow",
        onclick: () => embla.scrollNext(true),
        innerHTML:
          '<svg class="o-icon  o-icon--chevron-down" aria-hidden="true" focusable="false"><use xlink:href="#icon-chevron-down"></use></svg>',
      },
    });
    elThumbnailContainer.append(elThumbnailArrow);
  }

  // Events
  embla.on("destroy", () => {
    elThumbnailContainer.remove();
  });
}
