import { debounce, getAll } from "../../utils";

export class CartItems extends HTMLElement {
  currentLineQuantity?: any;
  itemCount = Array.from(this.querySelectorAll('[name="updates[]"]')).reduce(
    (total, quantityInput) =>
      total + (quantityInput as HTMLInputElement).valueAsNumber,
    0,
  );
  elLineItemStatusElement =
    document.getElementById("Cart-LineItemStatus") ||
    document.getElementById("DrawerCart-LineItemStatus");

  constructor() {
    super();

    const debouncedOnChange = debounce((event: Event) => {
      this.onChange(event);
    }, 0);

    this.addEventListener("change", debouncedOnChange);
  }

  onChange(event: Event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name"),
    );
  }

  updateQuantity(line: string, quantity: string, name: string) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(Shopify.routes.cartChangeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json`,
      },
      body,
    })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = this.querySelector(
          `#Quantity-${line}, #Drawer-quantity-${line}`,
        ) as HTMLInputElement | null;

        if (parsedState.errors) {
          if (quantityElement) {
            // TODO: Verify
            // quantityElement.value = quantityElement.getAttribute("value");
            quantityElement.value = quantityElement.dataset
              .cartQuantity as string;
          }

          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle("is-empty", parsedState.item_count === 0);

        const cartDrawer = document.querySelector("drawer-cart");
        if (cartDrawer)
          cartDrawer.classList.toggle("is-empty", parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const selector = String(
            section.selector ? section.selector : section.id,
          );

          const sectionElements = getAll(selector) as HTMLElement[];
          if (!sectionElements && sectionElements.length) return;

          const newHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            selector,
          );
          if (!newHTML) return;

          for (const sectionElement of sectionElements) {
            sectionElement.outerHTML = newHTML;
          }
        });

        const updatedValue = parsedState.items[Number(line) - 1]?.quantity;
        const message =
          (
            Number(quantity) > 0 &&
            updatedValue !== parseInt(quantityElement.value)
          ) ?
            Shopify.theme.i18n.cart.quantityError.replace(
              "[quantity]",
              updatedValue,
            )
          : "";

        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`Cart-Item-${line}`) ||
          document.getElementById(`DrawerCart-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawer) {
          cartDrawer.querySelector("a")?.focus();
        } else if (document.querySelector(".cart-item") && cartDrawer) {
          document.querySelector(".cart-item__name").focus();
        }

        if (
          parsedState.item_count === 0 &&
          this.nodeName == "DRAWER-CART-ITEMS"
        ) {
          const el = get("#DrawerCart-Recomendations");
          if (el) {
            el.remove();
          }
        }
      })
      .catch((err) => {
        console.error(err);
        const errors =
          document.getElementById("Cart-CartErrors") ||
          document.getElementById("DrawerCart-CartErrors");
        errors.textContent = Shopify.theme.i18n.cart.error;
      })
      .finally(() => {
        this.querySelectorAll(".loading-overlay").forEach((overlay) =>
          overlay.classList.add("hidden"),
        );

        // Calculates the height of the footer and header of the cart dialog,
        // important to call getElements because the footer is removed when fetching
        // new items.
        const cartDrawer = document.querySelector("drawer-cart") as DrawerCart;
        if (cartDrawer) {
          cartDrawer.prepareComponents();
        }

        this.disableLoading();
        window.loyaltylion?.ui?.refresh();
      });
  }

  updateLiveRegions(line: string, message: string) {
    const lineItemError = document.querySelector(
      `#Cart-LineItemError-${line}, #DrawerCart-LineItemError-${line}`,
    );

    if (lineItemError && message.length > 0) {
      lineItemError.classList.remove("hidden");
      lineItemError.classList.add("flex");
      const elErrorText = lineItemError.querySelector("span:first-child");
      if (elErrorText) elErrorText.textContent = message;
    }

    this.elLineItemStatusElement?.setAttribute("aria-hidden", "true");

    const cartStatus = this.querySelector(
      "#Cart-LiveRegionText, #DrawerCart-LiveRegionText",
    );
    if (cartStatus) {
      cartStatus.setAttribute("aria-hidden", "false");

      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", "true");
      }, 1000);
    }
  }

  getSectionInnerHTML(html: string, selector: string) {
    return (
      new DOMParser().parseFromString(html, "text/html").querySelector(selector)
        ?.outerHTML ?? ""
    );
  }

  enableLoading(line: string) {
    const elCartItems = this.querySelector(
      "#Cart-CartItems, #DrawerCart-CartItems",
    );
    elCartItems?.classList.add("pointer-events-none");

    const itemElements = this.querySelectorAll(
      `#Cart-Item-${line} .loading-overlay, #DrawerCart-Item-${line} .loading-overlay`,
    );
    for (const elItem of itemElements) {
      elItem.classList.remove("hidden");
    }

    document.activeElement?.blur();

    // TODO: a11y
    // this.elLineItemStatusElement.setAttribute("aria-hidden", "false");
  }

  disableLoading() {
    const elCartItems = this.querySelector(
      "#Cart-CartItems, #DrawerCart-CartItems",
    );
    elCartItems?.classList.remove("pointer-events-none");
  }

  getSectionsToRender() {
    return [
      {
        section: document.getElementById("Cart-CartItems")!.dataset
          .id as string,
        selector: ".js-cart-header",
      },
      {
        section: document.getElementById("Cart-CartItems")!.dataset
          .id as string,
        selector: ".js-cart-items",
      },
      {
        section: document.getElementById("Cart-CartItems")!.dataset
          .id as string,
        selector: ".js-cart-footer",
      },
    ];
  }
}

customElements.define("cart-items", CartItems);
