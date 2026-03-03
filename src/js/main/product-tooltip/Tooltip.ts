import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";

import "./Tooltip.scss";

import { get } from "../../utils";

// https://github.com/floating-ui/floating-ui/issues/1788

class Tooltip extends HTMLElement {
  elButton: HTMLButtonElement;
  elTooltip: HTMLDivElement;
  elArrow: HTMLDivElement;
  elCard: HTMLDivElement | null;

  constructor() {
    super();

    this.elButton = get("button", this);
    this.elTooltip = get("div", this);
    this.elArrow = get(`#${this.elTooltip.id}-arrow`, this);
    this.elCard = get(`#${this.elTooltip.id}-card`);
  }

  connectedCallback() {
    [
      ["mouseenter", this.show],
      ["mouseleave", this.hide],
      ["focus", this.show],
      ["blur", this.hide],
    ].forEach(([event, listener]) => {
      this.addEventListener(event, listener);
    });

    if (this.elCard) {
      [
        ["mouseenter", this.show],
        ["mouseleave", this.hide],
        ["focus", this.show],
        ["blur", this.hide],
      ].forEach(([event, listener]) => {
        this.elCard.addEventListener(event, listener);
      });
    }
  }

  show = () => {
    this.elTooltip.hidden = false;

    requestAnimationFrame(() => {
      this.update();
      this.elButton.classList.add("is-shown");
      if (this.elCard) {
        this.elCard.parentElement?.classList.add("is-hovered");
        this.elCard.classList.add("is-hovered");
      }
    });
  };

  hide = () => {
    // Waiting for next frame in case user clicked on a link on mobile
    requestAnimationFrame(() => {
      this.elTooltip.hidden = true;
      this.elButton.classList.remove("is-shown");
      this.elCard?.parentElement?.classList.remove("is-hovered");
      this.elCard?.classList.remove("is-hovered");
    });
  };

  update() {
    computePosition(this.elButton, this.elTooltip, {
      placement: "top",
      middleware: [
        offset(8),
        flip({ padding: { top: 150 } }),
        shift({ padding: 5, boundary: this.parentElement ?? undefined }),
        arrow({ element: this.elArrow }),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};

      Object.assign(this.elTooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      if (this.elArrow) {
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0]];

        Object.assign(this.elArrow.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          right: "",
          bottom: "",
          [staticSide]: "-4px",
        });
      }
    });
  }
}

customElements.define("product-tooltip", Tooltip);

export class BasicTooltip {
  elTooltip: HTMLDivElement;
  elArrow: HTMLDivElement;

  constructor(public elTrigger: HTMLElement) {
    this.elTooltip = get(`#${this.elTrigger.dataset.tooltip}`);
    this.elArrow = get(`#${this.elTooltip.id}-arrow`, this.elTooltip);

    this.connectedCallback();
  }

  connectedCallback() {
    [
      ["mouseenter", this.show],
      ["mouseleave", this.hide],
      ["focus", this.show],
      ["blur", this.hide],
    ].forEach(([event, listener]) => {
      this.elTrigger.addEventListener(event, listener);
    });
  }

  show = () => {
    this.elTooltip.hidden = false;

    requestAnimationFrame(() => {
      this.update();
    });
  };

  hide = () => {
    // Waiting for next frame in case user clicked on a link on mobile
    requestAnimationFrame(() => {
      this.elTooltip.hidden = true;
    });
  };

  update() {
    computePosition(this.elTrigger, this.elTooltip, {
      placement: "bottom",
      middleware: [
        offset(8),
        flip({ padding: { top: 150 } }),
        shift({ padding: 5 }),
        arrow({ element: this.elArrow }),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};

      Object.assign(this.elTooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      if (this.elArrow) {
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0]];

        Object.assign(this.elArrow.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          right: "",
          bottom: "",
          [staticSide]: "-4px",
        });
      }
    });
  }
}
