export {};

customElements.define(
  "share-button",
  class ShareButton extends HTMLButtonElement {
    urlToShare: string;

    constructor() {
      super();
      this.urlToShare = this.dataset.url ?? document.location.href;
    }

    onclick = () => {
      if (navigator.share) {
        navigator.share({ url: this.urlToShare, title: document.title });
      } else {
        navigator.clipboard.writeText(this.urlToShare).then(() => {
          // TODO: Show confirmation UI
        });
      }
    };
  },
  { extends: "button" }
);
