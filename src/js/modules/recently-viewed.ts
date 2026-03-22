/**
 * Recently Viewed Products
 * ─────────────────────────
 * Saves product handles to localStorage when visiting a product page and
 * exposes a <recently-viewed-products> web component that fetches and renders
 * product cards via the Shopify Section Rendering API.
 *
 * localStorage key : ecomplete_recently_viewed
 * Entry shape      : { handle: string; timestamp: number }[]
 * Max stored items : 12 (deduped, most recent first)
 */

const LS_KEY = "ecomplete_recently_viewed";
const MAX_STORED = 12;

export interface RecentlyViewedEntry {
  handle: string;
  timestamp: number;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentlyViewedEntry[];
  } catch {
    return [];
  }
}

function saveHandle(handle: string): void {
  try {
    const existing = getRecentlyViewed().filter((e) => e.handle !== handle);
    const updated: RecentlyViewedEntry[] = [
      { handle, timestamp: Date.now() },
      ...existing,
    ].slice(0, MAX_STORED);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

// ─── Track product page views ─────────────────────────────────────────────────

function trackCurrentProduct(): void {
  const metaEl = document.querySelector<HTMLElement>(
    '[data-product-handle], meta[property="og:url"]'
  );

  // Try data attribute first (set by product section liquid)
  const handleAttr = metaEl?.dataset?.productHandle;
  if (handleAttr) {
    saveHandle(handleAttr);
    return;
  }

  // Fallback: derive handle from URL path on product pages
  const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
  if (match?.[1]) {
    saveHandle(match[1]);
  }
}

// ─── Web Component ────────────────────────────────────────────────────────────

class RecentlyViewedProducts extends HTMLElement {
  private loaded = false;
  private listEl: HTMLUListElement | null = null;
  private innerEl: HTMLElement | null = null;

  connectedCallback() {
    if (this.loaded) return;
    this.loaded = true;

    this.innerEl = this.querySelector<HTMLElement>(".c-recently-viewed__inner");
    this.listEl = this.querySelector<HTMLUListElement>(
      ".c-recently-viewed__grid"
    );

    const entries = getRecentlyViewed();
    if (!entries.length) return;

    const maxProducts = parseInt(this.dataset.maxProducts ?? "8", 10);
    const sectionId = this.dataset.sectionId ?? "";

    // Exclude current product (already being viewed)
    const currentMatch = window.location.pathname.match(
      /\/products\/([^/?#]+)/
    );
    const currentHandle = currentMatch?.[1] ?? "";

    const handles = entries
      .map((e) => e.handle)
      .filter((h) => h !== currentHandle)
      .slice(0, maxProducts);

    if (!handles.length) return;

    this.fetchViaSection(handles, sectionId);
  }

  /**
   * Fetch product cards using the Section Rendering API.
   * Shopify renders the liquid template server-side with the handles
   * passed via a query parameter that the liquid reads from section settings.
   * Falls back to client-side /products/{handle}.js fetch if this fails.
   */
  private fetchViaSection(handles: string[], sectionId: string): void {
    const handlesParam = handles.join(",");
    const url = `${window.location.pathname}?sections=${sectionId}&section_handles=${encodeURIComponent(handlesParam)}`;

    fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Section fetch failed: ${res.status}`);
        return res.json() as Promise<Record<string, string>>;
      })
      .then((json) => {
        const html = json[sectionId];
        if (!html) throw new Error("Section HTML not in response");

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const templates = doc.querySelectorAll<HTMLTemplateElement>(
          "template[data-handle]"
        );

        if (!templates.length) {
          throw new Error("No product templates in section response");
        }

        this.renderCards(templates, handles);
      })
      .catch(() => {
        // Fallback: render via /products/{handle}.js (client-side only, no image)
        this.fetchViaCDN(handles);
      });
  }

  /**
   * Fallback: fetch minimal product data from the storefront JSON endpoint.
   * Renders a simple product card without the full snippet HTML.
   */
  private fetchViaCDN(handles: string[]): void {
    const columns = parseInt(this.dataset.columns ?? "4", 10);

    Promise.allSettled(
      handles.map((handle) =>
        fetch(`/products/${handle}.js`).then((r) => r.json())
      )
    ).then((results) => {
      const cards = results
        .filter(
          (r): r is PromiseFulfilledResult<ShopifyProductJSON> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value)
        .filter(Boolean);

      if (!cards.length) return;

      if (!this.listEl || !this.innerEl) return;

      this.listEl.innerHTML = cards
        .map(
          (p) => `
          <li class="c-recently-viewed__item">
            <a href="/products/${p.handle}" class="c-recently-viewed__link">
              ${
                p.featured_image
                  ? `<img
                       src="${p.featured_image}"
                       alt="${escapeHtml(p.title)}"
                       class="c-recently-viewed__img"
                       loading="lazy"
                       width="300"
                       height="384"
                     />`
                  : ""
              }
              <div class="c-recently-viewed__card-info">
                <p class="c-recently-viewed__card-title">${escapeHtml(p.title)}</p>
                <p class="c-recently-viewed__card-price">${formatMoney(p.price)}</p>
              </div>
            </a>
          </li>
        `
        )
        .join("");

      this.listEl.dataset.columns = String(columns);
      this.innerEl.removeAttribute("hidden");
    });
  }

  private renderCards(
    templates: NodeListOf<HTMLTemplateElement>,
    handles: string[]
  ): void {
    if (!this.listEl || !this.innerEl) return;

    // Render in the same order as the handles array
    const templateMap = new Map<string, HTMLTemplateElement>();
    templates.forEach((t) => {
      if (t.dataset.handle) templateMap.set(t.dataset.handle, t);
    });

    const items = handles
      .map((handle) => {
        const tmpl = templateMap.get(handle);
        if (!tmpl) return null;
        const li = document.createElement("li");
        li.className = "c-recently-viewed__item";
        li.appendChild(document.importNode(tmpl.content, true));
        return li;
      })
      .filter((li): li is HTMLLIElement => li !== null);

    if (!items.length) return;

    this.listEl.innerHTML = "";
    items.forEach((li) => this.listEl!.appendChild(li));
    this.innerEl.removeAttribute("hidden");
  }
}

// ─── Minimal Shopify product JSON type ───────────────────────────────────────

interface ShopifyProductJSON {
  handle: string;
  title: string;
  price: number;
  featured_image: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(cents: number): string {
  const formatted = (cents / 100).toFixed(2);
  return `${window.Shopify?.currency?.active ?? ""}${formatted}`;
}

// ─── Register & initialise ────────────────────────────────────────────────────

customElements.define("recently-viewed-products", RecentlyViewedProducts);

export default function initRecentlyViewed(): void {
  // Save handle if we're on a product page
  if (window.location.pathname.includes("/products/")) {
    trackCurrentProduct();
  }
}
