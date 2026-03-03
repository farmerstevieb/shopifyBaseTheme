import "./dialog.scss";
import "./dialog-modal.scss";

import A11yDialog from "a11y-dialog";

import { attachEvent, get, getAll, lock, release } from "../../utils";

export type DialogType = Dialog;

// Monkeypatch `hide` method
const originalHide = A11yDialog.prototype.hide;
A11yDialog.prototype.hide = function (): A11yDialog {
  const $el = (this as any).$el as HTMLElement;
  $el.classList.remove("no-animation");

  const removeEvent = attachEvent(
    "animationend",
    $el,
    () => {
      originalHide.call(this);
      $el.classList.remove("is-hiding");
      document.body.dispatchEvent(new CustomEvent("Dialog:Hiding"));
      clearTimeout(timeout);
    },
    { once: true },
  );

  const timeout = window.setTimeout(() => {
    removeEvent();
    originalHide.call(this);
    $el.classList.remove("is-hiding");
  }, 200);

  $el.classList.add("is-hiding");
  return this;
};

export interface DialogEventData extends CustomEvent {
  bubbles: boolean;
  detail: {
    dialogInstance: any; // Adjust the type as needed
    dialogSelector: string;
  };
}

export class Dialog extends HTMLElement {
  dialog?: A11yDialog;
  header?: HTMLElement;
  footer?: HTMLElement;
  loader?: HTMLElement;
  eventContent: DialogEventData;

  get testing() {
    return Object.hasOwn(this.dataset, "testing");
  }

  get role() {
    return this.getAttribute("role");
  }

  get modalMode() {
    return this.getAttribute("modal-style");
  }

  get elDocument() {
    return get("[role=document]", this) as HTMLElement;
  }

  get elMain() {
    return get("[data-dialog-element=main]", this) as HTMLElement;
  }

  constructor() {
    super();

    this.dialog = new A11yDialog(this);
    this.header = get("[data-dialog-element=header]", this) as HTMLElement;
    this.footer = get("[data-dialog-element=footer]", this) as HTMLElement;
    this.loader = get("[data-dialog-element=loader]", this) as HTMLElement;

    if (typeof Shopify.theme.dialogs !== "object") Shopify.theme.dialogs = [];
    Shopify.theme.dialogs.push(this);

    this.eventContent = {
      bubbles: true,
      detail: {
        dialogInstance: this,
        dialogSelector: this.id,
      },
    };

    this.dialog
      .on("show", () => {
        this.setAttribute("aria-hidden", "false");
        lock(this.elMain);

        document.body.dispatchEvent(
          new CustomEvent("Dialog:Show", this.eventContent),
        );

        this.setupVariables();
      })
      .on("hide", () => {
        this.setAttribute("aria-hidden", "true");
        release(this.elMain, true);

        document.body.dispatchEvent(
          new CustomEvent("Dialog:Hide", this.eventContent),
        );
      });

    this.setAttribute("aria-hidden", "true");
    this.removeAttribute("hidden");

    this.setupListeners();
  }

  loading() {
    if (!this.loader) return;

    this.loader.classList.toggle("opacity-0");
  }

  show(animate = true) {
    if (!animate) this.classList.add("no-animation");
    this.classList.remove("has-error");
    this.dialog?.show();

    (get("[autofocus], button, input", this) ?? get("button", this))?.focus();

    return false;
  }

  showError(err: Error) {
    this.loading();

    this.classList.add("has-error");
    this.elDocument.innerHTML = String(err);
  }

  hide() {
    this.dialog?.hide();
  }

  toggle() {
    if (this.dialog?.shown) {
      this.hide();
    } else {
      this.show();
    }

    return false;
  }

  getElements() {
    this.header = get("[data-dialog-element=header]", this) as HTMLElement;
    this.footer = get("[data-dialog-element=footer]", this) as HTMLElement;
    this.loader = get("[data-dialog-element=loader]", this) as HTMLElement;
  }

  setupVariables() {
    this.style.setProperty(
      "--dialog-drawer-header-height",
      `${this.header?.clientHeight ?? 0}px`,
    );
    this.style.setProperty(
      "--dialog-drawer-footer-height",
      `${this.footer?.clientHeight ?? 0}px`,
    );
  }

  setupListeners() {
    const elOpeners = getAll(`[data-dialog-show="${this.id}"`);
    for (const elOpener of elOpeners) {
      attachEvent("click", elOpener, () => this.show());
    }

    // Testing State
    if (this.testing) {
      this.show();
      console.warn(
        `${this.id} is in a test state and is displaying on load. This can be changed in the section settings!`,
      );
    }

    // Dialog Loaded Event
    document.body.dispatchEvent(
      new CustomEvent("Dialog:Loaded", this.eventContent),
    );

    // Close All Dialogs
    document.body.addEventListener(`Dialog:Close:${this.id}`, () => {
      this.hide();
    });
  }
}

customElements.define("dialog-element", Dialog);

customElements.define(
  "dialog-trigger",
  class DialogTrigger extends HTMLButtonElement {
    constructor() {
      super();
      this.type = "button";

      this.addEventListener("click", () => {
        let dialog: Dialog | null = null;
        const selector = this.getAttribute("dialog-selector");

        dialog =
          selector ? (get(selector) as Dialog | null) : this.closest(".dialog");

        if (!dialog) {
          console.error(
            "No dialog found. You may need to ensure that the dialog section is loaded in the customiser.",
          );
          return;
        }

        dialog.toggle();
      });
    }
  },
  { extends: "button" },
);

customElements.define("modal-dialog", class ModalDialog extends Dialog {});

customElements.define(
  "modal-opener",
  class ModalOpener extends HTMLButtonElement {
    constructor() {
      super();
      this.type = "button";

      this.addEventListener("click", () => {
        let modal: Dialog | null = null;
        const selector = this.getAttribute("modal");

        modal =
          selector ?
            (get(selector) as Dialog | null)
          : this.closest("modal-dialog");

        if (modal) {
          modal.toggle();
        }
      });
    }
  },
  { extends: "button" },
);
