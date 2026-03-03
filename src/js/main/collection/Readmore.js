import { get, getAll } from "../../utils";
import { debounce } from "../../utils/debounce";

export default class Readmore {
  constructor(element) {
    this.element = element;
    this.trigger = get(".js-read-more-trigger", this.element);
    this.inner = get(".js-read-more-inner", this.element);
    this.dots = get(".js-read-more-dots", this.element);

    this.bindEvents();
  }

  bindEvents() {
    this.trigger.addEventListener("click", () => {
      this.handleReadMore();
    });
  }

  handleReadMore() {
    if (!this.inner.classList.contains("is-active")) {
      this.inner.classList.add("is-active");
      this.dots.classList.add("is-hidden");
      this.trigger.innerText = "Read less";
    } else {
      this.inner.classList.remove("is-active");
      this.dots.classList.remove("is-hidden");
      this.trigger.innerText = "Read more";
    }
  }

  static inlineFix() {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    if (!isIOS) return false;

    const match = userAgent.match(/OS (\d+)_(\d+)/);
    if (!match) return false;

    const majorVersion = parseInt(match[1]);

    // iOS 14.x and 16.x need the fix
    return majorVersion === 14 || majorVersion === 16;
  }

  static needsTruncation(el) {
    if (!el) return false;

    const originalStyle = el.style.cssText;
    const maxLines = parseInt(
      el.closest(".js-truncate")?.style.getPropertyValue("--truncate-lines") ||
        "3",
    );
    el.style.cssText = `${originalStyle} display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${maxLines}; overflow: hidden;`;
    const hasOverflow = el.scrollHeight > el.clientHeight + 1;
    el.style.cssText = originalStyle;

    return hasOverflow;
  }
}

export const initTruncate = () => {
  const isOldiOS = Readmore.inlineFix();

  const updateTruncation = () => {
    getAll(".js-truncate").forEach((container) => {
      const fullContent = get(".full-content", container);
      const toggle = get(".js-truncate-toggle", container);
      if (!fullContent || !toggle) return;

      toggle.style.display =
        Readmore.needsTruncation(fullContent) ? "" : "none";
    });
  };

  updateTruncation();
  window.addEventListener("resize", debounce(updateTruncation, 120));

  if (isOldiOS) {
    getAll(".js-truncate.is-collapsed .full-content > *").forEach((el) => {
      el.style.display = "inline";
    });
  }

  getAll(".js-truncate-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.closest(".js-truncate");
      const isCollapsed = container.classList.toggle("is-collapsed");

      if (isOldiOS) {
        const fullContent = get(".full-content", container);
        if (fullContent) {
          getAll("*", fullContent).forEach((el) => {
            el.style.display = isCollapsed ? "inline" : "";
          });
        }
      }

      btn.textContent =
        isCollapsed ? btn.dataset.moreText : btn.dataset.lessText;
      btn.setAttribute("aria-expanded", String(!isCollapsed));
    });
  });
};
