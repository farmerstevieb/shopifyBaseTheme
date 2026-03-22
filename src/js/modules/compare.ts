/**
 * Compare Products
 *
 * Manages a list of product handles the user wants to compare.
 * Persists to localStorage under `ecomplete_compare`.
 *
 * Web Components:
 *  <compare-button data-handle="…">  — checkbox on product cards
 *  <compare-drawer>                  — slide-in drawer with comparison table
 *  <compare-count>                   — live badge showing count
 *  <compare-bar>                     — floating bottom bar
 */

const LS_KEY = "ecomplete_compare";
const MAX_DEFAULT = 4;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductData {
  handle: string;
  title: string;
  url: string;
  featured_image: string | null;
  price: number;
  price_min: number;
  price_max: number;
  compare_at_price: number | null;
  available: boolean;
  variants: Array<{ available: boolean }>;
}

// ─── CompareManager ──────────────────────────────────────────────────────────

export class CompareManager {
  private handles: string[] = [];
  private maxItems: number;
  private listeners: Array<() => void> = [];

  constructor(maxItems = MAX_DEFAULT) {
    this.maxItems = maxItems;
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(LS_KEY);
      this.handles = stored ? JSON.parse(stored) : [];
    } catch {
      this.handles = [];
    }
  }

  private save() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.handles));
    this.notify();
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }

  onChange(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  has(handle: string): boolean {
    return this.handles.includes(handle);
  }

  count(): number {
    return this.handles.length;
  }

  getAll(): string[] {
    return [...this.handles];
  }

  add(handle: string): boolean {
    if (this.has(handle)) return true;
    if (this.handles.length >= this.maxItems) return false;
    this.handles.push(handle);
    this.save();
    return true;
  }

  remove(handle: string) {
    this.handles = this.handles.filter((h) => h !== handle);
    this.save();
  }

  toggle(handle: string): boolean {
    if (this.has(handle)) {
      this.remove(handle);
      return false;
    }
    return this.add(handle);
  }

  clear() {
    this.handles = [];
    this.save();
  }

  setMax(n: number) {
    this.maxItems = n;
    // Trim if already over limit
    if (this.handles.length > n) {
      this.handles = this.handles.slice(0, n);
      this.save();
    }
  }
}

// Singleton shared across all components
export const compareManager = new CompareManager();

// ─── Fetch product data ──────────────────────────────────────────────────────

async function fetchProduct(handle: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`/products/${handle}.js`);
    if (!res.ok) return null;
    return (await res.json()) as ProductData;
  } catch {
    return null;
  }
}

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: window.Shopify?.currency?.active ?? "USD",
    minimumFractionDigits: 2,
  });
}

// ─── <compare-count> ─────────────────────────────────────────────────────────

class CompareCount extends HTMLElement {
  private unsub: (() => void) | null = null;

  connectedCallback() {
    this.render();
    this.unsub = compareManager.onChange(() => this.render());
  }

  disconnectedCallback() {
    this.unsub?.();
  }

  private render() {
    const n = compareManager.count();
    this.textContent = n > 0 ? String(n) : "";
    this.toggleAttribute("hidden", n === 0);
  }
}

customElements.define("compare-count", CompareCount);

// ─── <compare-button> ────────────────────────────────────────────────────────

class CompareButton extends HTMLElement {
  private unsub: (() => void) | null = null;

  get handle(): string {
    return this.dataset.handle ?? "";
  }

  connectedCallback() {
    this.render();
    this.unsub = compareManager.onChange(() => this.render());

    const checkbox = this.querySelector<HTMLInputElement>(
      ".compare-button__checkbox",
    );
    checkbox?.addEventListener("change", () => {
      if (!checkbox.checked) {
        compareManager.remove(this.handle);
      } else {
        const added = compareManager.add(this.handle);
        if (!added) {
          checkbox.checked = false;
          this.dispatchEvent(
            new CustomEvent("compare:max-reached", { bubbles: true }),
          );
        }
      }
    });
  }

  disconnectedCallback() {
    this.unsub?.();
  }

  private render() {
    const checkbox = this.querySelector<HTMLInputElement>(
      ".compare-button__checkbox",
    );
    if (checkbox) {
      checkbox.checked = compareManager.has(this.handle);
    }
  }
}

customElements.define("compare-button", CompareButton);

// ─── <compare-bar> ───────────────────────────────────────────────────────────

class CompareBar extends HTMLElement {
  private unsub: (() => void) | null = null;

  connectedCallback() {
    this.render();
    this.unsub = compareManager.onChange(() => this.render());

    this.querySelector("[data-compare-bar-open]")?.addEventListener(
      "click",
      () => {
        const drawer = document.querySelector<CompareDrawer>("compare-drawer");
        drawer?.open();
      },
    );

    this.querySelector("[data-compare-bar-clear]")?.addEventListener(
      "click",
      () => compareManager.clear(),
    );
  }

  disconnectedCallback() {
    this.unsub?.();
  }

  private render() {
    const n = compareManager.count();
    const isVisible = n > 0;
    this.setAttribute("aria-hidden", String(!isVisible));
    this.classList.toggle("is-active", isVisible);
  }
}

customElements.define("compare-bar", CompareBar);

// ─── <compare-drawer> ────────────────────────────────────────────────────────

class CompareDrawer extends HTMLElement {
  private unsub: (() => void) | null = null;
  private contentEl: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;

  get maxItems(): number {
    return parseInt(this.dataset.maxItems ?? "4", 10);
  }

  get showPrice(): boolean {
    return this.dataset.showPrice !== "false";
  }

  get showAvailability(): boolean {
    return this.dataset.showAvailability !== "false";
  }

  connectedCallback() {
    compareManager.setMax(this.maxItems);

    this.contentEl = this.querySelector("[data-compare-drawer-content]");

    // Create overlay element
    this.overlay = document.createElement("div");
    this.overlay.className = "modal__overlay";
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener("click", () => this.close());

    this.querySelector("[data-compare-drawer-close]")?.addEventListener(
      "click",
      () => this.close(),
    );
    this.querySelector("[data-compare-drawer-clear]")?.addEventListener(
      "click",
      () => {
        compareManager.clear();
        this.close();
      },
    );

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") this.close();
    });

    this.unsub = compareManager.onChange(() => {
      if (this.classList.contains("is-active")) {
        void this.renderProducts();
      }
    });
  }

  disconnectedCallback() {
    this.unsub?.();
    this.overlay?.remove();
  }

  async open() {
    this.setAttribute("aria-hidden", "false");
    this.classList.add("is-active");
    this.overlay?.classList.add("is-active");
    document.body.classList.add("overflow-hidden");
    await this.renderProducts();
  }

  close() {
    this.setAttribute("aria-hidden", "true");
    this.classList.remove("is-active");
    this.overlay?.classList.remove("is-active");
    document.body.classList.remove("overflow-hidden");
  }

  private async renderProducts() {
    if (!this.contentEl) return;

    const handles = compareManager.getAll();

    if (handles.length === 0) {
      this.contentEl.innerHTML = `<p class="compare-drawer__empty">${
        window.__themeStrings?.compare_empty ??
        "No products selected for comparison."
      }</p>`;
      return;
    }

    this.contentEl.innerHTML =
      `<p class="compare-drawer__loading">Loading&hellip;</p>`;

    const products = await Promise.all(handles.map(fetchProduct));
    const valid = products.filter(Boolean) as ProductData[];

    if (valid.length === 0) {
      this.contentEl.innerHTML = `<p class="compare-drawer__empty">Could not load products.</p>`;
      return;
    }

    this.contentEl.innerHTML = this.buildTable(valid);

    // Wire up remove buttons
    this.contentEl.querySelectorAll("[data-compare-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const handle = (btn as HTMLElement).dataset.compareRemove ?? "";
        compareManager.remove(handle);
      });
    });
  }

  private buildTable(products: ProductData[]): string {
    const rows: string[] = [];

    // Images row
    rows.push(`
      <tr class="compare-table__row compare-table__row--images">
        <th class="compare-table__label" scope="row"></th>
        ${products
          .map(
            (p) => `
          <td class="compare-table__cell">
            <div class="compare-table__product-header">
              ${
                p.featured_image
                  ? `<a href="${p.url}" class="compare-table__image-link">
                       <img
                         src="${p.featured_image}"
                         alt="${p.title}"
                         class="compare-table__image"
                         width="200"
                         loading="lazy"
                       >
                     </a>`
                  : ""
              }
              <button
                class="compare-table__remove"
                type="button"
                data-compare-remove="${p.handle}"
                aria-label="Remove ${p.title}"
              >&times;</button>
            </div>
          </td>
        `,
          )
          .join("")}
      </tr>
    `);

    // Title row
    rows.push(`
      <tr class="compare-table__row">
        <th class="compare-table__label" scope="row">Product</th>
        ${products
          .map(
            (p) => `
          <td class="compare-table__cell">
            <a href="${p.url}" class="compare-table__product-title">${p.title}</a>
          </td>
        `,
          )
          .join("")}
      </tr>
    `);

    // Price row
    if (this.showPrice) {
      rows.push(`
        <tr class="compare-table__row">
          <th class="compare-table__label" scope="row">Price</th>
          ${products
            .map((p) => {
              const price =
                p.price_min !== p.price_max
                  ? `${formatMoney(p.price_min)} – ${formatMoney(p.price_max)}`
                  : formatMoney(p.price);
              const compare =
                p.compare_at_price && p.compare_at_price > p.price
                  ? `<s class="compare-table__compare-price">${formatMoney(p.compare_at_price)}</s>`
                  : "";
              return `<td class="compare-table__cell"><span class="compare-table__price">${price}</span>${compare}</td>`;
            })
            .join("")}
        </tr>
      `);
    }

    // Availability row
    if (this.showAvailability) {
      rows.push(`
        <tr class="compare-table__row">
          <th class="compare-table__label" scope="row">Availability</th>
          ${products
            .map(
              (p) => `
            <td class="compare-table__cell">
              <span class="compare-table__availability compare-table__availability--${p.available ? "in" : "out"}">
                ${p.available ? "In stock" : "Out of stock"}
              </span>
            </td>
          `,
            )
            .join("")}
        </tr>
      `);
    }

    // View product row
    rows.push(`
      <tr class="compare-table__row compare-table__row--actions">
        <th class="compare-table__label" scope="row"></th>
        ${products
          .map(
            (p) => `
          <td class="compare-table__cell">
            <a href="${p.url}" class="button button--primary button--sm button--full">
              View product
            </a>
          </td>
        `,
          )
          .join("")}
      </tr>
    `);

    return `
      <div class="compare-table-wrap">
        <table class="compare-table">
          <colgroup>
            <col class="compare-table__col-label">
            ${products.map(() => `<col class="compare-table__col-product">`).join("")}
          </colgroup>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>
    `;
  }
}

customElements.define("compare-drawer", CompareDrawer);

// ─── Init ─────────────────────────────────────────────────────────────────────

export default function initCompare() {
  // Components self-register via customElements.define above.
  // This function exists for consistent module initialisation pattern.
}
