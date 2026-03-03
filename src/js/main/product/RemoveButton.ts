export class RemoveCartItemButton extends HTMLButtonElement {
  constructor() {
    super();

    this.type = "button";

    this.attachClickHandler();
  }

  private attachClickHandler() {
    this.addEventListener("click", this.handleClick);
  }

  private handleClick = () => {
    const elCartItems =
      this.closest("cart-items") || this.closest("drawer-cart-items");

    if (elCartItems && "updateQuantity" in elCartItems) {
      if (typeof elCartItems.updateQuantity === "function") {
        elCartItems.updateQuantity(this.dataset.index, 0);
      } else {
        console.error("updateQuantity is not a function on elCartItems");
      }
    } else {
      console.error(
        "Parent element 'cart-items' or 'drawer-cart-items' not found",
      );
    }
  };
}

customElements.define("remove-cart-item", RemoveCartItemButton, {
  extends: "button",
});
