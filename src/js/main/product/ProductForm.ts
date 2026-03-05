import { get } from "../../utils";
import { formatMoney } from "../../utils/shopify";

export class ProductForm extends HTMLFormElement {
  cartDrawer!: HTMLElement;
  submitButton: HTMLButtonElement | null;
  abortController = new AbortController();
  quantityInput!: HTMLElement;
  quantityValue!: number;
  variantOptions!: HTMLElement;
  element: HTMLFormElement | this;
  section: HTMLElement;

  constructor() {
    super();
    this.element = this as HTMLFormElement;
    this.section = this.element.closest(".shopify-section") as HTMLElement;
    this.quantityValue = 1;

    const idInput = get("[name=id]", this.element) as HTMLInputElement | null;
    if (idInput) idInput.disabled = false;

    this.submitButton = get(
      '[type="submit"]',
      this.element,
    ) as HTMLButtonElement | null;

    /**
     *  Ignore elements with aside parents to avoid this being applied to
     * 'Complementary products on the PDP'
     */
    if (this.section && !this.element.closest("aside")) {
      this.variantOptions = get(
        ".js-variant-options",
        this.section,
      ) as HTMLElement;
      this.quantityInput = get(
        ".js-quantity-input",
        this.section,
      ) as HTMLElement;
    }

    this.cartDrawer = get(".js-drawer-cart") as HTMLElement;

    if (this.cartDrawer && this.submitButton) {
      this.submitButton.setAttribute("aria-haspopup", "dialog");
    }

    this.bindEvents();
  }

  bindEvents() {
    this.addEventListener("submit", this.onSubmitHandler.bind(this));

    if (this.variantOptions)
      this.variantOptions.addEventListener(
        "Variant:Changed",
        this.submitPriceHandler.bind(this),
      );

    if (this.quantityInput)
      this.quantityInput.addEventListener(
        "Quantity:Changed",
        this.submitPriceHandler.bind(this),
      );

    this.setLocalStorageData();
  }

  submitPriceHandler(evt: Event) {
    const { detail } = evt as any;
    if (detail) this.quantityValue = Number(detail.newValue);
    const { variantPrice } = this.element.dataset;
    const buttonPriceValue = get(
      ".js-add-to-cart-price",
      this.element,
    ) as HTMLElement;

    const variantPriceByQuantity = Number(variantPrice) * this.quantityValue;

    if (!buttonPriceValue) return;
    buttonPriceValue.textContent = formatMoney({
      cents: variantPriceByQuantity,
    });
  }

  onSubmitHandler(evt: Event) {
    evt.preventDefault();

    // Set again for react components.
    this.submitButton = get(
      '[type="submit"]',
      this.element,
    ) as HTMLButtonElement | null;

    if (this.submitButton.getAttribute("aria-disabled") === "true") return;

    this.handleErrorMessage();

    this.submitButton.setAttribute("aria-disabled", "true");
    this.toggleButtonLoading();

    const formData = new FormData(this.element);

    if (this.cartDrawer) {
      formData.append(
        "sections",
        [
          ...new Set(
            DrawerCart.getSectionsToRender().map(
              (section: any) => section.section,
            ),
          ),
        ].join(","),
      );
      formData.append("sections_url", window.location.pathname);
    }

    // Default quantity to 1
    if (!formData.get("quantity")) {
      formData.set("formData", "1");
    }

    this.abortController.abort();
    this.abortController = new AbortController();

    fetch(Shopify.routes.cartAddUrl, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/javascript",
      },
      body: formData,
      signal: this.abortController.signal,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);

          const soldOutMessage =
            this.submitButton.querySelector(".sold-out-message");
          if (!soldOutMessage) return;
          this.submitButton.setAttribute("aria-disabled", true);
          this.submitButton.querySelector("span").classList.add("hidden");
          soldOutMessage.classList.remove("hidden");
          this.error = true;

          return;
        } else if (!this.cartDrawer) {
          window.location.href = Shopify.routes.cartUrl;
          return;
        }

        this.error = false;
        DrawerCart.renderContents(response);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        document.body.dispatchEvent(
          new CustomEvent("Dialog:Close:ModalQuickshop", {
            bubbles: true,
          }),
        );

        if (this.cart && this.cart.classList.contains("is-empty"))
          this.cart.classList.remove("is-empty");
        if (!this.error) this.submitButton.removeAttribute("aria-disabled");
        this.toggleButtonLoading();
      });
  }

  handleErrorMessage(errorMessage = false) {
    const product_index = this.submitButton.dataset.index;
    this.errorMessageWrapper =
      this.errorMessageWrapper ||
      document.querySelector(`.js-product-form-error-${product_index}`);
    if (!this.errorMessageWrapper) return;
    this.errorMessage =
      this.errorMessage ||
      this.errorMessageWrapper.querySelector(
        `.js-product-form-error-message-${product_index}`,
      );

    this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }

  toggleButtonLoading = () => {
    for (const elChild of this.submitButton.children) {
      elChild.classList.toggle("invisible");
    }
  };

  /**
   * Sets local storage data relevant to the product.
   */
  setLocalStorageData() {
    this.storeProductHistory();
  }

  /**
   * Tracks the users viewing history of products, and applies it to a
   * local storage item that can be utilised by other sections or scripts.
   */
  storeProductHistory() {
    const product = this.element.dataset.productHandle as string;

    // If this JS class is present, or if the handle is undefined
    // do not add this product to the users storage,
    if (this.element.classList.contains("js-product-ls-exclude-ph") || !product)
      return;

    const productHistoryName = "CUSTOMER_PRODUCT_HISTORY";
    const productHistoryStorage = localStorage.getItem(productHistoryName);

    let productHistory = [];

    // If the local storage item *already* exists, parse it into an array; otherwise,
    // initialize productHistory with a new array containing the currently viewed product.
    productHistory =
      productHistoryStorage ? JSON.parse(productHistoryStorage) : [product];

    // Add the product that the user is currently viewing to their stored
    // product history, and if it already contains it, remove it and then
    // add it to the end of the array.
    if (productHistory.includes(product)) {
      const oldProductIndex = productHistory.indexOf(product);
      productHistory.splice(oldProductIndex, 1);
      productHistory.push(product);
    } else {
      productHistory.push(product);

      // Ensure that the productHistory array does not exceed 14 items.
      if (productHistory.length > 15) {
        productHistory.shift(); // Remove the oldest item from the beginning.
      }
    }

    localStorage.setItem(productHistoryName, JSON.stringify(productHistory));
  }
}

customElements.define("product-form", ProductForm, { extends: "form" });
