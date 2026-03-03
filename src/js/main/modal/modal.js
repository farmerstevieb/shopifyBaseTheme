import { get, getAll } from "../../utils";

export class Modal {
  constructor(elements) {
    this.modals = elements;
    this.overlay = get(".js-modal-overlay");
    this.modalContent = get(".js-facets-modal-content");
    this.bindEvents();
  }

  reloadModals() {
    document.body.addEventListener("Modals:Reload", () => {
      this.modals = getAll(".js-modal");

      this.modals.forEach((modal) => {
        if (modal.classList.contains("is-active")) {
          const close = getAll(".js-modal-close", modal);
          this.handleClose(close, modal);
        }
      });
    });
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("js-modal-trigger")) {
        e.preventDefault();
        const { type, tab } = e.target.dataset;
        this.findModal(type, tab);
      }
    });

    this.reloadModals();
  }

  findModal(type, tab) {
    [...this.modals].forEach((modal) => {
      const modalType = modal.dataset.type;
      if (modalType === type) {
        this.openModal(modal, tab);
      }
    });
  }

  openModal(modal, tab = null) {
    const close = getAll(".js-modal-close", modal);
    const tabs = getAll(".js-modal-tab-trigger", modal);
    modal.classList.add("is-active");
    modal.open = true;
    this.overlay.classList.add("is-active");
    document.body.classList.add("body-scroll-lock");
    this.handleClose(close, modal);

    if (tabs) this.handleTabs(tabs, modal, tab);
  }

  handleClose(close, modal) {
    close.forEach((el) => {
      el.addEventListener("click", () => {
        this.closeModal(modal);
      });
    });

    this.overlay.addEventListener("click", () => {
      this.closeModal(modal);
    });
  }

  closeModal(modal) {
    this.overlay.classList.remove("is-active");
    modal.classList.remove("is-active");
    modal.open = false;
    document.body.classList.remove("body-scroll-lock");
  }

  handleTabs(tabs, modal, tabClicked) {
    const headerTabs = getAll(".js-modal-header", modal);
    const forms = getAll(".js-modal-tab-target", modal);

    [...tabs].forEach((tab) => {
      const { type } = tab.dataset;

      if (type === tabClicked) {
        this.updateElems(headerTabs, type);
        this.updateElems(forms, type);
      }

      tab.addEventListener("click", (e) => {
        e.preventDefault();
        this.updateElems(headerTabs, type);
        this.updateElems(forms, type);
      });
    });
  }

  updateElems(elems, type) {
    [...elems].forEach((elem) => {
      elem.classList.remove("is-active");
      if (elem.dataset.type === type) elem.classList.add("is-active");
    });
  }
}
