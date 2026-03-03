export class TabSwitching extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll(".js-tab");
    this.panel = this.querySelectorAll(".js-panel");
    this.collectionTab();
  }

  collectionTab() {
    this.tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dataType = btn.dataset.id;
        const content = this.querySelector(`.js-panel[data-id="${dataType}"]`);

        this.panel.forEach((el) => {
          el.classList.remove("is-open");
        });

        this.tabs.forEach((el) => {
          el.classList.remove("is-active");

          if (btn === el) {
            btn.classList.add("is-active");
            content?.classList.add("is-open");
          }
        });
      });
    });
  }
}

customElements.define("tab-switching", TabSwitching);
