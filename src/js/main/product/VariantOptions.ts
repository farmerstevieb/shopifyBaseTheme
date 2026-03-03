import { get } from "../../utils";
import { formatMoney } from "../../utils/shopify";

export type Variant = {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image: null | TODO;
  available: boolean;
  name: string;
  public_title: string;
  options: string[];
  price: number;
  weight: number;
  compare_at_price: number;
  inventory_management: string;
  barcode: string;
};

export class VariantOptions extends HTMLElement {
  currentVariant?: Variant;
  abortController = new AbortController();
  elSection = this.closest(".shopify-section");
  elSelectedOption = this.querySelector(".js-selected-option");
  elVariantsOption = this.querySelector(".js-variants-option");
  bis_btn = get("#BIS_trigger");
  elAddToCartForm = get(".js-product-form-section");
  options: string[];
  altVariant?: Variant;
  variantData: Variant[];

  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
    this.getSelectedOption();

    const update_url = document.querySelector(
      ".js-return-to",
    ) as HTMLInputElement;

    if (update_url) {
      update_url.value = window.location.href;
    }
  }

  getSelectedOption() {
    this.elSelectedOption?.addEventListener("click", () => {
      this.elSelectedOption?.classList.toggle("is-open");
      this.elSelectedOption?.nextElementSibling?.classList.toggle("is-open");
    });
  }

  onVariantChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const isRedirectOption = target.getAttribute("data-redirect-url");

    this.updateOptions();
    this.updateMasterId();
    this.updateSelectedValue(target);
    this.toggleAddButton(true, "");
    this.toggleButtonLoading();
    this.removeErrorMessage();

    // Check if this is a pre-order product
    const isPreorder =
      this.elAddToCartForm?.getAttribute("data-preorder") === "true" ||
      this.elAddToCartForm?.querySelector('[data-preorder="true"]') !== null;

    if (this.currentVariant?.available == true || isPreorder) {
      this.elAddToCartForm?.classList.remove("hidden");
      this.bis_btn?.classList.add("hidden");
    } else {
      this.elAddToCartForm?.classList.add("hidden");
      this.bis_btn?.classList.remove("hidden");
    }

    if (!isRedirectOption) {
      this.updateVariantStatuses();

      if (!this.currentVariant) {
        this.toggleAddButton(true, "");
        this.setUnavailable();
      } else {
        this.updateURL();
        this.updateVariantInput();
      }
    }

    if (!isRedirectOption) {
      this.renderProductInfo(isRedirectOption || this.dataset.url);
    } else if (isRedirectOption) {
      window.location.href = isRedirectOption;
    }
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));

    this.options = fieldsets.map((fieldset) => {
      const input = Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked,
      );
      return input ? input.value : "";
    });
  }

  updateMasterId() {
    this.altVariant = undefined;

    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });

    if (!this.currentVariant) {
      const opts = [this.options[0]];
      this.altVariant = this.getVariantData().find((variant) => {
        return !variant.options
          .map((option, index) => {
            return opts[index] ? opts[index] === option : true;
          })
          .includes(false);
      });
    }
  }

  updateSelectedValue(elTarget: HTMLInputElement) {
    const elSelectedValue = get(
      `[data-selected-option=${elTarget.name}]`,
      this,
    );
    const elStickyVariantOption = document.querySelectorAll(
      ".js-sticky-variant-options",
    );

    elStickyVariantOption.forEach((option) => {
      if (elTarget.name == option.dataset.type) {
        option.textContent = `${elTarget.value}`;
      }
    });

    const elSelectedSwatch = elSelectedValue?.previousElementSibling;

    if (elSelectedValue) elSelectedValue.textContent = `${elTarget.value}`;

    if (elSelectedSwatch && elTarget.dataset.color) {
      elSelectedSwatch.setAttribute("data-swatch", elTarget.dataset.color);
    }

    this.elSelectedOption?.classList.remove("is-open");
    this.elVariantsOption?.classList.remove("is-open");
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`,
    );

    const update_url = document.querySelector(
      ".js-return-to",
    ) as HTMLInputElement;

    if (update_url) {
      update_url.value = `${this.dataset.url}?variant=${this.currentVariant.id}`;
    }
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}`,
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1,
    );
    const inputWrappers = [
      ...this.querySelectorAll("fieldset:not([data-ignore-option])"),
    ];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected,
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);

      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.classList.remove("disabled");
      } else {
        input.classList.add("disabled");
      }
    });
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("[is=product-form]");
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo(productUrl: string) {
    this.abortController.abort();
    this.abortController = new AbortController();

    let variantId = this.currentVariant?.id ?? this.altVariant?.id;
    let replaceVariantPicker = false;

    const url = new URL(productUrl, window.location.origin);
    if (url.searchParams.has("variant")) {
      variantId = url.searchParams.get("variant");
      replaceVariantPicker = true;
    }

    url.searchParams.set("variant", variantId);
    url.searchParams.set("view", "ajax");
    url.searchParams.set(
      "section_id",
      this.dataset.originalSection ?
        this.dataset.originalSection
      : this.dataset.section || "",
    );

    fetch(url.toString(), { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");

        // Update media gallery
        const elNewMediaGallery = html.querySelector(
          ".product__media, .c-product-quickshop__column--media",
        );
        const elLiveMediaGallery = this.elSection?.querySelector(
          ".product__media, .c-product-quickshop__column--media",
        );
        if (elNewMediaGallery && elLiveMediaGallery) {
          elLiveMediaGallery.innerHTML = elNewMediaGallery.innerHTML;
        }

        if (replaceVariantPicker) {
          const selector = ".c-product-quickshop__column .details";
          const details = this.elSection?.querySelector(selector);
          details?.replaceWith(html.querySelector(selector)!);
          return;
        }

        // Update media modal
        {
          const elNewMediaModal = html.querySelector("#ProductMediaModal");
          const elLiveMediaModal =
            this.elSection?.querySelector("#ProductMediaModal");

          if (elNewMediaModal && elLiveMediaModal) {
            elLiveMediaModal.innerHTML = elNewMediaModal.innerHTML;
          }
        }

        // Update price
        {
          const priceDestination = document.getElementById(
            `price-${this.dataset.section}`,
          );

          const buttonPriceDestination = document.getElementById(
            `button-price-${this.dataset.section}`,
          );
          const priceSource = html.getElementById(
            `price-${
              this.dataset.originalSection ?
                this.dataset.originalSection
              : this.dataset.section
            }`,
          );

          const buttonPriceSource = html.getElementById(
            `button-price-${
              this.dataset.originalSection ?
                this.dataset.originalSection
              : this.dataset.section
            }`,
          );

          if (priceSource && priceDestination) {
            priceDestination.innerHTML = priceSource.innerHTML;
            // Copy className to preserve mb-9 logic from server
            priceDestination.className = priceSource.className;
          }

          if (buttonPriceSource && buttonPriceDestination)
            buttonPriceDestination.innerHTML = buttonPriceSource.innerHTML;

          const price = document.getElementById(
            `price-${this.dataset.section}`,
          );
          if (price) price.classList.remove("visibility-hidden");
          // Update RRP
          const rrpDestination = document.getElementById(
            `rrp-${this.dataset.section}`,
          );
          const rrpSource = html.getElementById(
            `rrp-${
              this.dataset.originalSection ?
                this.dataset.originalSection
              : this.dataset.section
            }`,
          );
          if (rrpDestination && rrpSource) {
            // Copy all attributes including class (which has mb-9 logic)
            rrpDestination.className = rrpSource.className;
            rrpDestination.innerHTML = rrpSource.innerHTML;
            // Handle display based on content
            if (rrpSource.innerHTML.trim().length > 0) {
              rrpDestination.style.display = "";
            } else {
              rrpDestination.style.display = "none";
            }
          }
        }

        // Update sibling variant url
        {
          const elNewCustomColorVariants = html.querySelectorAll(
            ".js-sibling-variant",
          );
          const elLiveCustomColorVariants = this.elSection?.querySelectorAll(
            ".js-sibling-variant",
          );
          if (
            elLiveCustomColorVariants?.length &&
            elNewCustomColorVariants.length &&
            elLiveCustomColorVariants.length === elNewCustomColorVariants.length
          ) {
            elLiveCustomColorVariants?.forEach((el, index) => {
              el.innerHTML = elNewCustomColorVariants[index].innerHTML;
            });
          }
        }

        // Update selected colour image
        {
          const elNewColourImage = html.querySelector(
            ".js-selected-option [data-swatch]",
          );
          const elCurrentColourImage = this.elSelectedOption?.querySelector(
            ".js-selected-option [data-swatch]",
          );
          if (elCurrentColourImage && elNewColourImage) {
            elCurrentColourImage.outerHTML = elNewColourImage.outerHTML;
          }
        }

        if (this.currentVariant) {
          this.toggleAddButton(
            !this.currentVariant.available,
            this.currentVariant.available ?
              Shopify.theme.i18n.addToCart
            : Shopify.theme.i18n.soldOut,
          );
        } else {
          this.setUnavailable();
        }
      })
      .catch(() => {
        // TODO: handle error
      })
      .finally(() => {
        this.toggleButtonLoading();
      });
  }

  toggleAddButton(disable = true, text: string) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`,
    );
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
    } else {
      addButton.removeAttribute("disabled");
    }

    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (text && addButtonText) addButtonText.textContent = text;
  }

  setUnavailable() {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`,
    );
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    if (!addButton) return;

    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (addButtonText)
      addButtonText.textContent = Shopify.theme.i18n.unavailable;

    const price = get(`#price-${this.dataset.section}`);
    if (price) price.firstElementChild.classList.add("invisible");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  toggleButtonLoading = () => {
    const elSubmitButton = document.querySelector(
      `#product-form-${this.dataset.section} [name="add"]`,
    );
    if (!elSubmitButton) return;

    for (const elChild of elSubmitButton.children) {
      elChild.classList.toggle("invisible");
    }
  };
}

customElements.define("variant-options", VariantOptions);
