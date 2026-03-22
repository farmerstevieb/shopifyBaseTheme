/**
 * Countdown Timer Web Component
 * ───────────────────────────────
 * Reads `data-target-date` (format: "YYYY-MM-DD HH:MM:SS") and counts down
 * to that moment, updating day/hour/minute/second display once per second.
 *
 * Dispatches:
 *   countdown:expired  — fires on the element when the target date is reached
 *
 * When expired:
 *   - Shows the .c-countdown-timer__expired-message element
 *   - Hides the clock
 *   - If data-show-after-expired="false", hides the entire section wrapper
 */

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeParts(targetDate: Date): CountdownParts | null {
  const now = Date.now();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export class CountdownTimer extends HTMLElement {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private targetDate: Date | null = null;
  private clockEl: HTMLElement | null = null;
  private expiredEl: HTMLElement | null = null;
  private valueEls: Map<string, HTMLElement> = new Map();

  connectedCallback() {
    const rawDate = this.dataset.targetDate;
    if (!rawDate) return;

    // Parse the date string (treat as local time by appending timezone offset)
    this.targetDate = new Date(rawDate);
    if (isNaN(this.targetDate.getTime())) {
      console.warn(
        "[countdown-timer] Invalid data-target-date:",
        rawDate,
        "— expected format: YYYY-MM-DD HH:MM:SS"
      );
      return;
    }

    this.clockEl = this.querySelector<HTMLElement>(".c-countdown-timer__clock");
    this.expiredEl = this.querySelector<HTMLElement>(
      ".c-countdown-timer__expired-message"
    );

    // Cache value element references
    (["days", "hours", "minutes", "seconds"] as const).forEach((unit) => {
      const el = this.querySelector<HTMLElement>(`[data-value="${unit}"]`);
      if (el) this.valueEls.set(unit, el);
    });

    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  disconnectedCallback() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (!this.targetDate) return;

    const parts = getTimeParts(this.targetDate);

    if (!parts) {
      this.expire();
      return;
    }

    this.valueEls.get("days")!.textContent = pad(parts.days);
    this.valueEls.get("hours")!.textContent = pad(parts.hours);
    this.valueEls.get("minutes")!.textContent = pad(parts.minutes);
    this.valueEls.get("seconds")!.textContent = pad(parts.seconds);
  }

  private expire(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Zero out all display values
    this.valueEls.forEach((el) => (el.textContent = "00"));

    // Show/hide per setting
    const showAfterExpired = this.dataset.showAfterExpired !== "false";

    if (!showAfterExpired) {
      // Hide the entire Shopify section wrapper
      const sectionWrapper = this.closest<HTMLElement>("[id^='shopify-section-']");
      if (sectionWrapper) {
        sectionWrapper.style.display = "none";
      }
      return;
    }

    // Hide clock, show expired message
    if (this.clockEl) this.clockEl.hidden = true;
    if (this.expiredEl) this.expiredEl.hidden = false;

    // Dispatch event for external listeners
    this.dispatchEvent(
      new CustomEvent("countdown:expired", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("countdown-timer", CountdownTimer);

export default function initCountdownTimer(): void {
  // Web component self-registers; no imperative setup needed.
  // This export exists so it can be imported from index.ts for consistency.
}
