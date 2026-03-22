/**
 * Upsell Module
 * ─────────────
 * Handles all upsell / cross-sell interactions across the theme:
 *
 *  - Listens for add-to-cart events (native Shopify form submits + custom
 *    `cart:item-added` events dispatched by other modules).
 *  - Fetches recommendations from the eComplete API (with Shopify fallback).
 *  - Opens the <upsell-drawer> slide-in panel.
 *  - Tracks impressions, clicks, and conversions via the API.
 *  - Manages progressive discount counter UI.
 *
 * Web Components registered here:
 *  <upsell-drawer>    — slide-in drawer shown after add-to-cart
 *  <upsell-section>   — PDP "Complete the Look" section (add-all logic)
 *  <cart-upsell>      — in-cart recommendations panel
 *
 * Custom events dispatched:
 *  `upsell:added`     — bubbles from the element when an upsell product is added to cart
 *  `upsell:opened`    — dispatched on document when the drawer opens
 *  `upsell:closed`    — dispatched on document when the drawer closes
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyProductJSON {
  id: number;
  handle: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  featured_image: string | null;
  url: string;
  available: boolean;
  variants: Array<{ id: number; available: boolean; price: number; compare_at_price: number | null }>;
}

interface EcompleteRecommendResponse {
  success: boolean;
  data?: {
    productIds: string[];
    rule?: {
      ruleId: string;
      discountPercent?: number;
      discountThreshold?: number;
    };
  };
}

interface CartAddResponse {
  id: number;
  quantity: number;
  title: string;
}

// ─── Session ID ───────────────────────────────────────────────────────────────

function getSessionId(): string {
  const key = "ecomplete_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

const SESSION_ID = getSessionId();

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: window.Shopify?.currency?.active ?? "USD",
    minimumFractionDigits: 2,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchProductJson(productId: string): Promise<ShopifyProductJSON | null> {
  try {
    // Shopify returns product JSON by numeric ID via a search workaround;
    // use handle-based endpoint via a lightweight search.
    const res = await fetch(
      `/search/suggest.json?q=${productId}&resources[type]=product&resources[limit]=1`,
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      resources?: { results?: { products?: Array<{ handle: string }> } };
    };
    const handle = data.resources?.results?.products?.[0]?.handle;
    if (!handle) return null;
    const pRes = await fetch(`/products/${handle}.js`);
    if (!pRes.ok) return null;
    return (await pRes.json()) as ShopifyProductJSON;
  } catch {
    return null;
  }
}

async function fetchRecommendations(
  apiBase: string,
  productId: string,
  placement: string,
  shopDomain: string,
): Promise<EcompleteRecommendResponse> {
  try {
    const url = new URL(`${apiBase}/upsell/recommend/${productId}`, window.location.origin);
    url.searchParams.set("placement", placement);
    url.searchParams.set("shopDomain", shopDomain);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`${res.status}`);
    return (await res.json()) as EcompleteRecommendResponse;
  } catch {
    return { success: false };
  }
}

async function trackUpsellEvent(
  apiBase: string,
  shopDomain: string,
  ruleId: string,
  eventType: "impression" | "click" | "add_to_cart" | "purchase",
  productId: string,
  variantId?: string,
  revenue?: number,
): Promise<void> {
  try {
    await fetch(`${apiBase}/upsell/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopDomain,
        ruleId,
        eventType,
        productId,
        variantId,
        revenue,
        sessionId: SESSION_ID,
      }),
      keepalive: true, // fire-and-forget even during page unload
    });
  } catch {
    // Tracking is non-fatal
  }
}

async function ajaxAddToCart(variantId: number, quantity = 1): Promise<CartAddResponse | null> {
  try {
    const res = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity }),
    });
    if (!res.ok) return null;
    return (await res.json()) as CartAddResponse;
  } catch {
    return null;
  }
}

// ─── <upsell-drawer> ─────────────────────────────────────────────────────────

class UpsellDrawer extends HTMLElement {
  private listEl: HTMLUListElement | null = null;
  private loadingEl: HTMLElement | null = null;
  private emptyEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private discountBannerEl: HTMLElement | null = null;
  private discountTextEl: HTMLElement | null = null;
  private thresholdEl: HTMLElement | null = null;
  private thresholdProgressEl: HTMLElement | null = null;
  private thresholdLabelEl: HTMLElement | null = null;

  private currentRuleId: string | null = null;
  private currentProductIds: string[] = [];
  private discountPercent: number | null = null;
  private discountThreshold: number | null = null;

  get apiBase(): string {
    return this.dataset.apiBase ?? "/apps/ecompleteSearch/api";
  }

  get shopDomain(): string {
    return window.Shopify?.shop ?? document.location.hostname;
  }

  connectedCallback() {
    this.listEl           = this.querySelector("[data-upsell-list]");
    this.loadingEl        = this.querySelector("[data-upsell-loading]");
    this.emptyEl          = this.querySelector("[data-upsell-empty]");
    this.backdropEl       = this.querySelector("[data-upsell-backdrop]");
    this.discountBannerEl = this.querySelector("[data-upsell-discount-banner]");
    this.discountTextEl   = this.querySelector("[data-upsell-discount-text]");
    this.thresholdEl      = this.querySelector("[data-upsell-threshold]");
    this.thresholdProgressEl = this.querySelector("[data-upsell-threshold-progress]");
    this.thresholdLabelEl = this.querySelector("[data-upsell-threshold-label]");

    this.querySelector("[data-upsell-close]")?.addEventListener("click", () => this.close());
    this.backdropEl?.addEventListener("click", () => this.close());

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });

    // Listen for add-to-cart events dispatched by product forms and other modules
    document.addEventListener("cart:item-added", ((e: CustomEvent<{ productId: string; variantId: string }>) => {
      void this.handleCartItemAdded(e.detail.productId, e.detail.variantId);
    }) as EventListener);

    // Also intercept native product form submissions
    document.addEventListener("submit", (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form.getAttribute("action") === "/cart/add" || form.dataset.productForm !== undefined) {
        const idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
        if (idInput?.value) {
          // Delay to let the cart update complete before we open the drawer
          setTimeout(() => {
            const productId = form.closest("[data-product-id]")?.getAttribute("data-product-id") ?? "";
            void this.handleCartItemAdded(productId, idInput.value);
          }, 500);
        }
      }
    });
  }

  get isOpen(): boolean {
    return this.getAttribute("aria-hidden") === "false";
  }

  async handleCartItemAdded(productId: string, _variantId: string): Promise<void> {
    if (!productId) return;

    this.setLoading(true);
    this.open();

    const response = await fetchRecommendations(
      this.apiBase,
      productId,
      "pdp",
      this.shopDomain,
    );

    const productIds = response.data?.productIds ?? [];
    const rule = response.data?.rule;

    this.currentRuleId       = rule?.ruleId ?? null;
    this.currentProductIds   = productIds;
    this.discountPercent     = rule?.discountPercent ?? null;
    this.discountThreshold   = rule?.discountThreshold ?? null;

    if (!productIds.length) {
      this.setLoading(false);
      this.showEmpty();
      return;
    }

    // Track impressions
    if (this.currentRuleId) {
      for (const pid of productIds) {
        void trackUpsellEvent(this.apiBase, this.shopDomain, this.currentRuleId, "impression", pid);
      }
    }

    await this.renderProducts(productIds);
    this.renderDiscountUI();
    this.setLoading(false);
  }

  private async renderProducts(productIds: string[]): Promise<void> {
    if (!this.listEl) return;

    const products = await Promise.all(productIds.map(id => fetchProductJson(id)));
    const valid = products.filter((p): p is ShopifyProductJSON => p !== null && p.available);

    if (!valid.length) {
      this.showEmpty();
      return;
    }

    this.listEl.innerHTML = valid.map(p => this.buildProductCard(p)).join("");

    // Wire up quick-add buttons
    this.listEl.querySelectorAll<HTMLButtonElement>("[data-upsell-quick-add]").forEach(btn => {
      const variantId = parseInt(btn.dataset.variantId ?? "0", 10);
      const productId = btn.dataset.productId ?? "";
      const price     = parseInt(btn.dataset.price ?? "0", 10);

      btn.addEventListener("click", async () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = "Adding…";

        const result = await ajaxAddToCart(variantId);

        if (result) {
          btn.textContent = "Added!";
          btn.classList.add("is-added");

          // Track add_to_cart conversion
          if (this.currentRuleId) {
            void trackUpsellEvent(
              this.apiBase, this.shopDomain, this.currentRuleId,
              "add_to_cart", productId, String(variantId), price / 100
            );
          }

          // Dispatch upsell:added event
          this.dispatchEvent(new CustomEvent("upsell:added", {
            bubbles: true,
            detail: { productId, variantId },
          }));

          // Refresh cart count badge
          document.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true }));

          // Update threshold counter
          this.updateThresholdProgress();
        } else {
          btn.textContent = "Error";
          btn.disabled = false;
        }
      });

      // Track clicks
      btn.closest("li")?.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("[data-upsell-quick-add]")) return; // avoid double tracking
        if (this.currentRuleId) {
          void trackUpsellEvent(this.apiBase, this.shopDomain, this.currentRuleId, "click", productId);
        }
      }, { once: false });
    });

    this.emptyEl?.toggleAttribute("hidden", true);
  }

  private buildProductCard(product: ShopifyProductJSON): string {
    const variant = product.variants[0];
    const hasDiscount = this.discountPercent !== null;
    const discountedPrice = hasDiscount && variant
      ? Math.round(variant.price * (1 - this.discountPercent! / 100))
      : null;

    return `
      <li class="upsell-drawer__product" data-product-id="${product.id}">
        <a href="${product.url}" class="upsell-drawer__product-image-link" tabindex="-1">
          ${product.featured_image
            ? `<img
                 src="${product.featured_image}"
                 alt="${escapeHtml(product.title)}"
                 class="upsell-drawer__product-image"
                 loading="lazy"
                 width="120"
                 height="150"
               />`
            : '<div class="upsell-drawer__product-image-placeholder"></div>'
          }
          ${hasDiscount ? `<span class="upsell-drawer__badge">${this.discountPercent}% off</span>` : ""}
        </a>
        <div class="upsell-drawer__product-info">
          <a href="${product.url}" class="upsell-drawer__product-title">${escapeHtml(product.title)}</a>
          <div class="upsell-drawer__product-price">
            ${discountedPrice !== null
              ? `<s class="upsell-drawer__price--original">${formatMoney(variant?.price ?? 0)}</s>
                 <span class="upsell-drawer__price--discounted">${formatMoney(discountedPrice)}</span>`
              : `<span class="upsell-drawer__price--current">${formatMoney(variant?.price ?? product.price)}</span>`
            }
          </div>
          ${variant && product.available
            ? `<button
                 class="button button--secondary button--sm upsell-drawer__quick-add"
                 type="button"
                 data-upsell-quick-add
                 data-product-id="${product.id}"
                 data-variant-id="${variant.id}"
                 data-price="${variant.price}"
               >
                 Add to cart
               </button>`
            : `<span class="upsell-drawer__sold-out">Sold out</span>`
          }
        </div>
      </li>
    `;
  }

  private renderDiscountUI(): void {
    if (this.discountPercent !== null && this.discountBannerEl && this.discountTextEl) {
      this.discountTextEl.textContent = `Add for ${this.discountPercent}% off!`;
      this.discountBannerEl.removeAttribute("hidden");
    } else {
      this.discountBannerEl?.toggleAttribute("hidden", true);
    }

    if (this.discountThreshold !== null && this.discountThreshold > 1) {
      this.updateThresholdProgress(0);
    }
  }

  private updateThresholdProgress(added = 0): void {
    if (!this.thresholdEl || !this.thresholdProgressEl || !this.thresholdLabelEl) return;
    const threshold = this.discountThreshold ?? 0;
    if (threshold <= 1) return;

    const remaining = Math.max(0, threshold - added);
    const progress  = Math.min(1, added / threshold);

    this.thresholdEl.removeAttribute("hidden");
    this.thresholdProgressEl.style.width = `${Math.round(progress * 100)}%`;

    if (remaining <= 0) {
      this.thresholdLabelEl.textContent = `Discount unlocked! ${this.discountPercent}% off applied.`;
      this.thresholdEl.classList.add("is-complete");
    } else {
      this.thresholdLabelEl.textContent = `Add ${remaining} more item${remaining === 1 ? "" : "s"} for ${this.discountPercent}% off`;
      this.thresholdEl.classList.remove("is-complete");
    }
  }

  private setLoading(loading: boolean): void {
    this.loadingEl?.toggleAttribute("hidden", !loading);
    if (this.listEl) this.listEl.style.visibility = loading ? "hidden" : "visible";
  }

  private showEmpty(): void {
    this.emptyEl?.removeAttribute("hidden");
    if (this.listEl) this.listEl.innerHTML = "";
  }

  open(): void {
    this.setAttribute("aria-hidden", "false");
    this.classList.add("is-active");
    this.backdropEl?.classList.add("is-active");
    document.body.classList.add("overflow-hidden");
    document.dispatchEvent(new CustomEvent("upsell:opened"));
  }

  close(): void {
    this.setAttribute("aria-hidden", "true");
    this.classList.remove("is-active");
    this.backdropEl?.classList.remove("is-active");
    document.body.classList.remove("overflow-hidden");
    document.dispatchEvent(new CustomEvent("upsell:closed"));
  }
}

customElements.define("upsell-drawer", UpsellDrawer);

// ─── <upsell-section> ────────────────────────────────────────────────────────
// PDP "Complete the Look" / "Frequently Bought Together" section.
// Handles the "Add all to cart" button and tracks per-product events.

class UpsellSection extends HTMLElement {
  private addAllBtn: HTMLButtonElement | null = null;
  private totalEl: HTMLElement | null = null;

  connectedCallback() {
    this.addAllBtn = this.querySelector("[data-upsell-add-all]");
    this.totalEl   = this.querySelector("[data-upsell-add-all-total]");

    this.computeTotalPrice();

    this.addAllBtn?.addEventListener("click", () => void this.addAllToCart());
  }

  private computeTotalPrice(): void {
    if (!this.totalEl) return;

    const cards = this.querySelectorAll<HTMLElement>("[data-variant-id]");
    let total = 0;
    cards.forEach(card => {
      const price = parseInt(card.dataset.price ?? "0", 10);
      total += price;
    });

    if (total > 0) {
      this.totalEl.textContent = ` — ${formatMoney(total)}`;
    }
  }

  private async addAllToCart(): Promise<void> {
    if (!this.addAllBtn) return;
    this.addAllBtn.disabled = true;
    this.addAllBtn.textContent = "Adding…";

    const cards = this.querySelectorAll<HTMLElement>("[data-upsell-quick-add]");
    const variantIds = [...cards]
      .map(el => parseInt(el.getAttribute("data-variant-id") ?? "0", 10))
      .filter(id => id > 0);

    await Promise.all(variantIds.map(id => ajaxAddToCart(id)));

    this.addAllBtn.textContent = "Added!";
    this.addAllBtn.classList.add("is-added");

    document.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true }));
  }
}

customElements.define("upsell-section", UpsellSection);

// ─── <cart-upsell> ───────────────────────────────────────────────────────────
// In-cart upsell panel — fetches ecomplete recommendations for each cart item,
// deduplicates, and re-renders the product list.

class CartUpsell extends HTMLElement {
  private listEl: HTMLElement | null = null;
  private loadingEl: HTMLElement | null = null;
  private fetched = false;

  get apiBase(): string {
    return this.dataset.apiBase ?? "/apps/ecompleteSearch/api";
  }

  get shopDomain(): string {
    return window.Shopify?.shop ?? document.location.hostname;
  }

  get maxProducts(): number {
    return parseInt(this.dataset.maxProducts ?? "4", 10);
  }

  connectedCallback() {
    this.listEl    = this.querySelector("[data-cart-upsell-list]");
    this.loadingEl = this.querySelector("[data-cart-upsell-loading]");

    // Wire up existing quick-add buttons (server-side rendered)
    this.wireQuickAdd();

    // Attempt to upgrade with ecomplete recommendations (once per page load)
    if (!this.fetched) {
      this.fetched = true;
      void this.loadEcompleteRecommendations();
    }

    // Re-fetch when cart changes
    document.addEventListener("cart:updated", () => {
      this.fetched = false;
      void this.loadEcompleteRecommendations();
    });
  }

  private wireQuickAdd(): void {
    this.querySelectorAll<HTMLButtonElement>("[data-upsell-quick-add]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (btn.disabled) return;
        const variantId = parseInt(btn.dataset.variantId ?? "0", 10);
        const productId = btn.dataset.productId ?? "";
        if (!variantId) return;

        btn.disabled = true;
        btn.textContent = "Adding…";

        const result = await ajaxAddToCart(variantId);
        if (result) {
          btn.textContent = "Added!";
          btn.classList.add("is-added");
          this.dispatchEvent(new CustomEvent("upsell:added", {
            bubbles: true,
            detail: { productId, variantId },
          }));
          document.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true }));
        } else {
          btn.disabled = false;
          btn.textContent = "Add";
        }
      });
    });
  }

  private async loadEcompleteRecommendations(): Promise<void> {
    // Get current cart items
    let cartProductIds: string[] = [];
    try {
      const cartRes = await fetch("/cart.js");
      const cart = await cartRes.json() as { items: Array<{ product_id: number }> };
      cartProductIds = cart.items.map(i => String(i.product_id));
    } catch {
      return; // Can't get cart — keep server-side rendered content
    }

    if (!cartProductIds.length) return;

    this.loadingEl?.removeAttribute("hidden");

    // Fetch recommendations for each cart product, deduplicate
    const responses = await Promise.allSettled(
      cartProductIds.map(pid =>
        fetchRecommendations(this.apiBase, pid, "cart", this.shopDomain)
      )
    );

    const seen = new Set<string>(cartProductIds); // exclude items already in cart
    const recommendedIds: string[] = [];

    for (const result of responses) {
      if (result.status !== "fulfilled") continue;
      const ids = result.value.data?.productIds ?? [];
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          recommendedIds.push(id);
          if (recommendedIds.length >= this.maxProducts) break;
        }
      }
      if (recommendedIds.length >= this.maxProducts) break;
    }

    this.loadingEl?.toggleAttribute("hidden", true);

    if (!recommendedIds.length) return; // keep server-side rendered fallback

    // Fetch product data and re-render
    const products = await Promise.all(recommendedIds.map(id => fetchProductJson(id)));
    const valid = products.filter((p): p is ShopifyProductJSON => p !== null && p.available);

    if (!valid.length) return;

    if (this.listEl) {
      this.listEl.innerHTML = valid.map(p => this.buildCartCard(p)).join("");
      this.wireQuickAdd();
    } else {
      // Create list element if it doesn't exist yet
      const ul = document.createElement("ul");
      ul.className = "c-cart-upsell__list";
      ul.setAttribute("data-cart-upsell-list", "");
      ul.setAttribute("role", "list");
      ul.innerHTML = valid.map(p => this.buildCartCard(p)).join("");
      this.appendChild(ul);
      this.listEl = ul;
      this.wireQuickAdd();
    }
  }

  private buildCartCard(product: ShopifyProductJSON): string {
    const variant = product.variants[0];
    return `
      <li class="c-cart-upsell__item">
        <div class="c-cart-upsell__card" data-product-id="${product.id}" data-variant-id="${variant?.id ?? 0}">
          <a href="${product.url}" class="c-cart-upsell__image-link" tabindex="-1">
            ${product.featured_image
              ? `<img src="${product.featured_image}" alt="${escapeHtml(product.title)}" class="c-cart-upsell__image" loading="lazy" width="80" height="100" />`
              : ""
            }
          </a>
          <div class="c-cart-upsell__info">
            <a href="${product.url}" class="c-cart-upsell__title">${escapeHtml(product.title)}</a>
            <span class="c-cart-upsell__price--current">${formatMoney(variant?.price ?? product.price)}</span>
            ${variant
              ? `<button
                   class="button button--secondary button--sm c-cart-upsell__add"
                   type="button"
                   data-upsell-quick-add
                   data-product-id="${product.id}"
                   data-variant-id="${variant.id}"
                   data-price="${variant.price}"
                 >Add</button>`
              : `<span class="c-cart-upsell__sold-out">Sold out</span>`
            }
          </div>
        </div>
      </li>
    `;
  }
}

customElements.define("cart-upsell", CartUpsell);

// ─── Init ─────────────────────────────────────────────────────────────────────

export default function initUpsell(): void {
  // Web components self-register via customElements.define above.
  // This function exists for the consistent module initialisation pattern.
}
