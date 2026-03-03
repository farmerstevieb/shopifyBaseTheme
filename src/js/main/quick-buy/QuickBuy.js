import { bodyScrollLock, get } from "../../utils";

export class QuickBuy {
  constructor(element) {
    this.element = element;
    this.modal = get(".js-quickshop-modal", document);
    this.overlay = get(".js-modal-overlay", document);
    this.closeTrigger = get(".js-modal-close", this.modal);
    this.content = get(".js-quickshop-content", this.modal);

    this.bindListener();
  }

  bindListener() {
    this.triggerListener();
  }

  triggerListener() {
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("js-quickshop-trigger")) return;
      this.displayOverlay();
      this.renderProductHTML(
        e.target.dataset.productHandle,
        e.target.dataset.variantId
      );
    });

    this.handleClose();
  }

  openModal() {
    this.modal.classList.add("is-active");
    this.modal.open = true;
  }

  closeModal() {
    this.modal.classList.remove("is-active");
    this.modal.open = false;
    this.hideOverlay();
  }

  displayOverlay() {
    this.overlay.classList.add("is-active");
    bodyScrollLock.lock(this.modal);
  }

  hideOverlay() {
    this.overlay.classList.remove("is-active");
    bodyScrollLock.release(this.modal);
  }

  handleClose() {
    this.closeTrigger.addEventListener("click", () => {
      this.closeModal();
    });

    this.overlay.addEventListener("click", () => {
      this.closeModal();
    });
  }

  renderProductHTML(productUrl, variantId) {
    const productURLAjax = new URL(productUrl, location.origin);
    productURLAjax.searchParams.set("view", "quickshop");
    productURLAjax.searchParams.set("variant", variantId);
    fetch(productURLAjax.toString())
      .then((response) => response.text())
      .then((data) => {
        this.content.innerHTML = "";

        const parsedHTML = new DOMParser().parseFromString(data, "text/html");
        const parsedQuickshopElement = get(
          ".shopify-section--product-quickshop",
          parsedHTML
        );

        this.content.append(parsedQuickshopElement);

        requestAnimationFrame(() => {
          this.content.dispatchEvent(
            new CustomEvent("resize", { bubbles: true })
          );
          this.openModal();
        });
        document.dispatchEvent(new CustomEvent("quickshopContentRendered"));
      });
  }
}
