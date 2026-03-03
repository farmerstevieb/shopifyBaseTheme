import { get, throttle } from "../../utils";

export default class BeforeAfter {
  element: HTMLElement;
  elSliderInput: HTMLInputElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.elSliderInput = get(".js-before-after-slider") as HTMLInputElement;

    this.bindEvents();
  }

  bindEvents() {
    let timeout: number;
    const onInput = throttle(() => {
      clearTimeout(timeout);
      this.element.style.setProperty(
        "--position",
        `${this.elSliderInput.value}%`,
      );
      timeout = window.setTimeout(() => {
        this.element.style.setProperty(
          "--position",
          `${this.elSliderInput.value}%`,
        );
      }, 96);
    }, 16);
    this.elSliderInput.addEventListener("input", onInput);
  }
}
