/**
 * Cookie Consent Banner
 * ──────────────────────
 * Manages the <cookie-consent-banner> web component that renders the GDPR/POPIA
 * compliant cookie consent UI. Persists user choice to localStorage.
 *
 * localStorage key: ecomplete_cookie_consent
 * Values          : 'accepted' | 'declined'
 *
 * Events dispatched on window:
 *   consent:accepted — user clicked Accept
 *   consent:declined — user clicked Decline
 *
 * Public API (available as window.ecompleteConsent):
 *   hasConsented()  → boolean  — true if 'accepted'
 *   hasDeclined()   → boolean  — true if 'declined'
 *   getStatus()     → 'accepted' | 'declined' | null
 */

const LS_KEY = "ecomplete_cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

// ─── Public API ───────────────────────────────────────────────────────────────

export const ecompleteConsent = {
  hasConsented(): boolean {
    return getStoredStatus() === "accepted";
  },
  hasDeclined(): boolean {
    return getStoredStatus() === "declined";
  },
  getStatus(): ConsentStatus {
    return getStoredStatus();
  },
};

function getStoredStatus(): ConsentStatus {
  try {
    const val = localStorage.getItem(LS_KEY);
    if (val === "accepted" || val === "declined") return val;
    return null;
  } catch {
    return null;
  }
}

function setStatus(status: "accepted" | "declined"): void {
  try {
    localStorage.setItem(LS_KEY, status);
  } catch {
    // localStorage unavailable — silent fail, don't block UX
  }
}

// ─── Web Component ────────────────────────────────────────────────────────────

class CookieConsentBanner extends HTMLElement {
  connectedCallback() {
    // If consent already given (either way), remove banner from DOM immediately
    if (getStoredStatus() !== null) {
      this.remove();
      return;
    }

    this.addEventListener("click", this.handleClick);
    this.hidden = false;
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
  }

  private handleClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-action]"
    );
    if (!target) return;

    const action = target.dataset.action;
    if (action === "accept") {
      this.resolve("accepted");
    } else if (action === "decline") {
      this.resolve("declined");
    }
  };

  private resolve(status: "accepted" | "declined"): void {
    setStatus(status);
    this.hide();

    const eventName =
      status === "accepted" ? "consent:accepted" : "consent:declined";

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { status },
        bubbles: false,
      })
    );
  }

  private hide(): void {
    this.setAttribute("aria-hidden", "true");
    this.style.transition = "opacity 300ms ease";
    this.style.opacity = "0";
    setTimeout(() => this.remove(), 310);
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

customElements.define("cookie-consent-banner", CookieConsentBanner);

// Expose public API on window
declare global {
  interface Window {
    ecompleteConsent: typeof ecompleteConsent;
  }
}
window.ecompleteConsent = ecompleteConsent;

export default function initCookieConsent(): void {
  // Web component handles its own lifecycle.
  // We ensure the banner is hidden immediately if consent was already given
  // (before the custom element upgrades, to prevent flash).
  if (getStoredStatus() !== null) {
    const banner = document.querySelector("cookie-consent-banner");
    if (banner) (banner as HTMLElement).hidden = true;
  }
}
