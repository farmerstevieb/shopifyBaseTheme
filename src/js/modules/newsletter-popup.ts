/**
 * Newsletter Popup
 *
 * Shows a newsletter signup popup after a configurable delay OR on exit intent
 * (mouse leaving the viewport through the top of the page).
 *
 * Storage keys:
 *  - ecomplete_newsletter_dismissed  (localStorage)  — timestamp of last dismiss; skip for 7 days
 *  - ecomplete_newsletter_seen       (sessionStorage) — don't show more than once per session
 */

const LS_KEY = "ecomplete_newsletter_dismissed";
const SS_KEY = "ecomplete_newsletter_seen";
const DISMISS_DAYS = 7;

class NewsletterPopup {
  private el: HTMLElement;
  private backdrop: HTMLElement | null;
  private delay: number;
  private shown = false;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.backdrop = el.querySelector("[data-newsletter-popup-backdrop]");
    this.delay = (parseInt(el.dataset.delay ?? "5", 10) || 5) * 1000;

    if (this.shouldSkip()) return;

    this.setupListeners();
    this.scheduleDelay();
  }

  // ─── Guards ────────────────────────────────────────────────────────────────

  private shouldSkip(): boolean {
    // Don't pester logged-in customers
    if (document.body.classList.contains("customer-logged-in")) return true;

    // Already seen this session
    if (sessionStorage.getItem(SS_KEY)) return true;

    // Dismissed within the last 7 days
    const ts = localStorage.getItem(LS_KEY);
    if (ts) {
      const elapsed = Date.now() - parseInt(ts, 10);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return true;
    }

    // If the form was already submitted successfully this page load (query
    // string contains ?contact_posted=true) treat it as dismissed.
    if (window.location.search.includes("contact_posted=true")) {
      this.dismiss();
      return true;
    }

    return false;
  }

  // ─── Scheduling ────────────────────────────────────────────────────────────

  private scheduleDelay() {
    this.delayTimer = setTimeout(() => this.show(), this.delay);

    // Exit intent: mouse leaves through top edge
    document.documentElement.addEventListener(
      "mouseleave",
      this.onExitIntent,
    );
  }

  private onExitIntent = (e: MouseEvent) => {
    if (e.clientY < 0) {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
      document.documentElement.removeEventListener(
        "mouseleave",
        this.onExitIntent,
      );
      this.show();
    }
  };

  // ─── Show / Hide ────────────────────────────────────────────────────────────

  show() {
    if (this.shown) return;
    this.shown = true;
    sessionStorage.setItem(SS_KEY, "1");

    document.documentElement.removeEventListener(
      "mouseleave",
      this.onExitIntent,
    );

    this.el.setAttribute("aria-hidden", "false");
    this.el.classList.add("is-active");
    document.body.classList.add("overflow-hidden");

    // Auto-focus first focusable element
    const focusTarget = this.el.querySelector<HTMLElement>(
      "input, button:not([data-newsletter-popup-close])",
    );
    focusTarget?.focus();

    // Watch for successful form submission (page reload with success state)
    const success = this.el.querySelector("[data-newsletter-popup-success]");
    if (success) {
      this.dismiss();
    }
  }

  hide() {
    this.el.setAttribute("aria-hidden", "true");
    this.el.classList.remove("is-active");
    this.el.classList.add("is-hiding");
    document.body.classList.remove("overflow-hidden");

    const onEnd = () => {
      this.el.classList.remove("is-hiding");
      this.el.removeEventListener("animationend", onEnd);
      this.el.removeEventListener("transitionend", onEnd);
    };
    this.el.addEventListener("transitionend", onEnd, { once: true });
  }

  dismiss() {
    localStorage.setItem(LS_KEY, String(Date.now()));
    this.hide();
  }

  // ─── Listeners ──────────────────────────────────────────────────────────────

  private setupListeners() {
    // Close button
    const closeBtn = this.el.querySelector("[data-newsletter-popup-close]");
    closeBtn?.addEventListener("click", () => this.dismiss());

    // Backdrop click
    this.backdrop?.addEventListener("click", () => this.dismiss());

    // Escape key
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.shown) this.dismiss();
    });

    // Successful form submit → dismiss after short pause
    const form = this.el.querySelector<HTMLFormElement>(
      ".newsletter-popup__form",
    );
    if (form) {
      form.addEventListener("submit", () => {
        // Mark as dismissed so we don't show again after the page reloads
        localStorage.setItem(LS_KEY, String(Date.now()));
      });
    }
  }
}

export default function initNewsletterPopup() {
  const popups = document.querySelectorAll<HTMLElement>(
    "[data-newsletter-popup]",
  );
  popups.forEach((el) => new NewsletterPopup(el));
}
