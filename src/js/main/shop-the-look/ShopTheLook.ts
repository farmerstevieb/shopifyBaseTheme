import "./ShopTheLook.scss";

import { getAll } from "../../utils";

class ShopLook extends HTMLElement {
  constructor() {
    super();
    this.element = this;
    this.triggers = getAll(".js-look-button", this.element);
    if (this.triggers) this.bindEvents();
  }

  connectedCallback() {
    this.hidden = false;
  }

  bindEvents() {
    this.toggleModal();
  }

  toggleModal() {
    this.triggers.forEach((ele) => {
      ele.addEventListener("click", () => {
        ele.classList.toggle("is-active");
        ele.previousElementSibling.classList.toggle("is-active");
        this.toggleIcon(ele);
      });
    });
  }

  toggleIcon(ele) {
    const currentIcon = ele.querySelectorAll(".js-look-icon");
    if (currentIcon) {
      currentIcon.forEach((getcurrentIcon) => {
        getcurrentIcon.classList.toggle("hidden");
      });
    }
  }
}

customElements.define("shop-the-look", ShopLook);
