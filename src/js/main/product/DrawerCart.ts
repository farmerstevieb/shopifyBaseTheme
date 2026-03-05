import { get, getAll, lock, rIC } from "../../utils";
import { Dialog } from "../dialog/dialog";
import { CartItems } from "./CartItems";

export class DrawerCart extends Dialog {
  drawerCartSection = this.closest("drawer-cart") as HTMLElement;

  connectedCallback() {
    this.prepareComponents();
  }

  prepareComponents() {
    this.getElements();
    this.setupVariables();

    const productRecommendations = get("product-recommendations", this);
    productRecommendations?.addEventListener(
      "ProductRecommendations:Loaded",
      () => {
        this.getElements();
        this.setupVariables();
      },
      {
        once: true,
      },
    );
  }

  renderContents(parsedState: Record<string, any>) {
    this.getSectionsToRender().forEach((section) => {
      const selector = section.selector ? section.selector : section.id;

      const sectionElements = getAll(selector).filter(Boolean) as HTMLElement[];
      if (!sectionElements && sectionElements.length) return;

      const newHTML = this.getSectionInnerHTML(
        parsedState.sections[section.section],
        selector,
      );
      if (!newHTML) return;

      for (const sectionElement of sectionElements) {
        sectionElement.outerHTML = newHTML;
      }
      const newMainDrawerCart = get(
        "[data-dialog-element=main]",
        this,
      ) as HTMLElement;

      if (newMainDrawerCart) {
        lock(newMainDrawerCart);
      }
    });

    this.prepareComponents();

    rIC(() => this.show());
  }

  getSectionInnerHTML(html: string, selector = ".shopify-section") {
    return (
      new DOMParser().parseFromString(html, "text/html").querySelector(selector)
        ?.outerHTML ?? ""
    );
  }

  getSectionsToRender() {
    return [
      {
        selector: "#DrawerCart .js-delivery-progress",
        section: this.drawerCartSection?.dataset.id as string,
      },
      {
        selector: "#DrawerCart [data-dialog-element=main]",
        section: this.drawerCartSection?.dataset.id as string,
      },
      {
        selector: "#DrawerCart [data-dialog-element=footer]",
        section: this.drawerCartSection?.dataset.id as string,
      },
      {
        selector: ".js-cart-item-count",
        section: "cart-item-count",
      },
    ];
  }
}

customElements.define("drawer-cart", DrawerCart);

class DrawerCartItems extends CartItems {
  getSectionsToRender() {
    const drawerCartSection = this.closest("drawer-cart") as HTMLElement;

    return [
      {
        selector: "#DrawerCart .js-delivery-progress",
        section: drawerCartSection?.dataset.id as string,
      },
      {
        selector: "#DrawerCart [data-dialog-element=main]",
        section: drawerCartSection?.dataset.id as string,
      },
      {
        selector: "#DrawerCart [data-dialog-element=footer]",
        section: drawerCartSection?.dataset.id as string,
      },
      {
        selector: ".js-cart-item-count",
        section: "cart-item-count",
      },
    ];
  }
}

customElements.define("drawer-cart-items", DrawerCartItems);
