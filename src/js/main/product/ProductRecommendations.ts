export class ProductRecommendations extends HTMLElement {
  loaded = false;

  connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;

    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((text) => {
        const html = new DOMParser().parseFromString(text, "text/html");
        const recommendations = html.querySelector("product-recommendations");

        if (recommendations && recommendations.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;

          // @ts-expect-error TODO
          this.closest("ecomplete-slider")?.reload();
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define("product-recommendations", ProductRecommendations);
