import { get } from "../../utils";

export class StickyButton extends HTMLElement {
  constructor() {
    super();
    this.originalHeight = this.offsetHeight;
    this.variantOptions = get(".js-variant-options", this);
    this.showVariantsBtn = get(".js-show-variants", this);

    this.placeholder = document.createElement("div");
    this.placeholder.style.display = "none";
    this.parentNode.insertBefore(this.placeholder, this);

    this.initialTopOffset =
      window.pageYOffset + this.getBoundingClientRect().top;
    const additionalDistance = 500;
    this.stickyThreshold = this.initialTopOffset + additionalDistance;

    if (window.matchMedia("(max-width: 1024px)").matches) {
      this.initializeStickyBehavior();
      this.initializeVariantToggle();
    }
  }

  updatePlaceholder(isSticky) {
    this.placeholder.style.display = isSticky ? "block" : "none";
    if (isSticky) {
      this.placeholder.style.height = `${this.originalHeight}px`;
    }
  }

  initializeStickyBehavior() {
    let isSticky = false;

    window.addEventListener("scroll", () => {
      const shouldStick = window.scrollY > this.stickyThreshold;
      if (shouldStick !== isSticky) {
        this.classList.toggle("is-sticky", shouldStick);
        this.updatePlaceholder(shouldStick);
        isSticky = shouldStick;

        this.stickyThreshold =
          isSticky ?
            this.placeholder.offsetTop + this.placeholder.offsetHeight - 50
          : this.initialTopOffset + 500;
      }
    });
  }

  initializeVariantToggle() {
    this.showVariantsBtn.addEventListener("click", () => {
      this.variantOptions.classList.toggle("is-open");
    });
  }
}

customElements.define("sticky-button", StickyButton);
