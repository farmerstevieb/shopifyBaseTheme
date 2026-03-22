/**
 * ecomplete-search.ts
 * ────────────────────
 * Web component (<ecomplete-search>) that powers instant search results via the
 * ecomplete/ecomplete-search Shopify app.
 *
 * Behaviour:
 *   - Debounced input handler (300 ms) fires on every keystroke
 *   - Fetches from POST /apps/ecompleteSearch/api/fesearch
 *   - On any fetch error, or if the app is not installed (non-2xx), falls back to
 *     Shopify's native /search/suggest.json predictive search API
 *   - Renders a dropdown with product cards (image, title, vendor, price) and a
 *     popular-searches pill row
 *   - Tracks result clicks via POST /apps/ecompleteSearch/api/track-click
 *   - Full keyboard navigation: ArrowUp / ArrowDown / Enter / Escape
 *   - Mobile: dropdown becomes a full-screen overlay
 *   - Session ID generated once per page load and stored in sessionStorage
 *
 * Data attributes on <ecomplete-search>:
 *   data-shop             string   shop permanent domain
 *   data-search-url       string   fesearch endpoint path
 *   data-track-url        string   track-click endpoint path
 *   data-chat-url         string   chat endpoint path
 *   data-limit            number   max products to fetch (default 8)
 *   data-show-popular     boolean  "true" | "false"
 *   data-show-chat        boolean  "true" | "false"
 *   data-search-page-url  string   /search base URL for "View all" link
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface EcompleteProduct {
  id: string | number;
  title: string;
  handle: string;
  url: string;
  price: number;
  compare_at_price?: number;
  image?: string;
  vendor?: string;
}

interface EcompleteSearchResponse {
  results: EcompleteProduct[];
  popularSearches: string[];
}

interface ShopifyPredictiveResource {
  id: number;
  title: string;
  handle: string;
  url: string;
  price: string;
  compare_at_price_max: string;
  image?: { src: string };
  vendor?: string;
  available: boolean;
}

interface ShopifyPredictiveResponse {
  resources: {
    results: {
      products: ShopifyPredictiveResource[];
    };
  };
}

// ─── Session ID ───────────────────────────────────────────────────────────────

function getSessionId(): string {
  const KEY = "ecomplete_search_session";
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-nostorage`;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(document.documentElement.lang || "en", {
    style: "currency",
    currency:
      (window as Window & { Shopify?: { currency?: { active?: string } } })
        ?.Shopify?.currency?.active ?? "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="c-esearch__highlight">$1</mark>',
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// ─── Web Component ────────────────────────────────────────────────────────────

export class EcompleteSearch extends HTMLElement {
  private input!: HTMLInputElement;
  private dropdown!: HTMLElement;
  private chatPanel: HTMLElement | null = null;
  private chatMessages: HTMLElement | null = null;
  private chatForm: HTMLFormElement | null = null;
  private chatInput: HTMLInputElement | null = null;
  private chatToggle: HTMLElement | null = null;

  private shop = "";
  private searchUrl = "/apps/ecompleteSearch/api/fesearch";
  private trackUrl = "/apps/ecompleteSearch/api/track-click";
  private chatUrl = "/apps/ecompleteSearch/api/chat";
  private searchPageUrl = "/search";
  private limit = 8;
  private showPopular = true;
  private showChat = false;

  private sessionId = getSessionId();
  private abortController: AbortController | null = null;
  private activeIndex = -1;
  private lastQuery = "";
  private isChatOpen = false;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  connectedCallback() {
    this.shop = this.dataset.shop ?? "";
    this.searchUrl =
      this.dataset.searchUrl ?? "/apps/ecompleteSearch/api/fesearch";
    this.trackUrl =
      this.dataset.trackUrl ?? "/apps/ecompleteSearch/api/track-click";
    this.chatUrl = this.dataset.chatUrl ?? "/apps/ecompleteSearch/api/chat";
    this.searchPageUrl = this.dataset.searchPageUrl ?? "/search";
    this.limit = parseInt(this.dataset.limit ?? "8", 10);
    this.showPopular = this.dataset.showPopular !== "false";
    this.showChat = this.dataset.showChat === "true";

    this.input = this.querySelector<HTMLInputElement>(".js-esearch-input")!;
    this.dropdown = this.querySelector<HTMLElement>(".js-esearch-dropdown")!;
    this.chatPanel = this.querySelector<HTMLElement>(".js-esearch-chat");
    this.chatMessages = this.querySelector<HTMLElement>(
      ".js-esearch-chat-messages",
    );
    this.chatForm =
      this.querySelector<HTMLFormElement>(".js-esearch-chat-form");
    this.chatInput = this.querySelector<HTMLInputElement>(
      ".js-esearch-chat-input",
    );
    this.chatToggle = this.querySelector<HTMLElement>(
      ".js-esearch-chat-toggle",
    );

    if (!this.input || !this.dropdown) return;

    this.bindInputEvents();
    this.bindDropdownEvents();
    this.bindDocumentEvents();

    if (this.showChat) {
      this.bindChatEvents();
    }
  }

  disconnectedCallback() {
    this.abortController?.abort();
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleGlobalKeydown);
  }

  // ── Input events ─────────────────────────────────────────────────────────────

  private bindInputEvents() {
    const debouncedSearch = debounce(
      (query: string) => this.handleSearch(query),
      300,
    );

    this.input.addEventListener("input", () => {
      const query = this.input.value.trim();
      debouncedSearch(query);
    });

    this.input.addEventListener("keydown", this.handleInputKeydown);

    this.input.addEventListener("focus", () => {
      if (this.input.value.trim().length >= 2) {
        this.showDropdown();
      }
    });
  }

  // ── Dropdown events ───────────────────────────────────────────────────────────

  private bindDropdownEvents() {
    this.dropdown.addEventListener("click", this.handleDropdownClick);
  }

  // ── Document-level events ─────────────────────────────────────────────────────

  private bindDocumentEvents() {
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleGlobalKeydown);
  }

  // ── Chat events ───────────────────────────────────────────────────────────────

  private bindChatEvents() {
    this.chatToggle?.addEventListener("click", () => this.toggleChat());
    this.chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = this.chatInput?.value.trim();
      if (msg) this.sendChatMessage(msg);
    });
  }

  // ── Search orchestration ──────────────────────────────────────────────────────

  private async handleSearch(query: string) {
    if (query.length < 2) {
      this.hideDropdown();
      return;
    }

    this.lastQuery = query;
    this.setLoading(true);
    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const data = await this.fetchEcomplete(query, this.abortController.signal);
      this.render(data, query);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Graceful degradation — fall back to Shopify predictive search
      try {
        const fallback = await this.fetchShopifyPredictive(
          query,
          this.abortController.signal,
        );
        this.render(fallback, query);
      } catch (fallbackErr) {
        if ((fallbackErr as Error).name !== "AbortError") {
          this.renderError();
        }
      }
    } finally {
      this.setLoading(false);
    }
  }

  // ── API calls ─────────────────────────────────────────────────────────────────

  private async fetchEcomplete(
    query: string,
    signal: AbortSignal,
  ): Promise<EcompleteSearchResponse> {
    const res = await fetch(this.searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        shop: this.shop,
        limit: this.limit,
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`ecompleteSearch responded ${res.status}`);
    }

    return res.json() as Promise<EcompleteSearchResponse>;
  }

  private async fetchShopifyPredictive(
    query: string,
    signal: AbortSignal,
  ): Promise<EcompleteSearchResponse> {
    const url = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${this.limit}`;
    const res = await fetch(url, { signal });

    if (!res.ok) throw new Error(`Shopify suggest responded ${res.status}`);

    const data = (await res.json()) as ShopifyPredictiveResponse;
    const raw = data?.resources?.results?.products ?? [];

    const results: EcompleteProduct[] = raw.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      url: p.url,
      price: parseFloat(p.price) * 100,
      compare_at_price:
        p.compare_at_price_max
          ? parseFloat(p.compare_at_price_max) * 100
          : undefined,
      image: p.image?.src,
      vendor: p.vendor,
    }));

    return { results, popularSearches: [] };
  }

  // ── Track click ───────────────────────────────────────────────────────────────

  private async trackClick(
    productId: string | number,
    position: number,
  ): Promise<void> {
    try {
      await fetch(this.trackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: this.shop,
          query: this.lastQuery,
          productId: String(productId),
          position,
          sessionId: this.sessionId,
        }),
      });
    } catch {
      // Non-critical — silent fail
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────────

  private render(data: EcompleteSearchResponse, query: string) {
    const { results, popularSearches } = data;

    if (!results.length && !popularSearches.length) {
      this.hideDropdown();
      return;
    }

    const parts: string[] = [];

    // Products section
    if (results.length) {
      parts.push('<ul class="c-esearch__results" role="listbox">');
      results.forEach((product, index) => {
        const imgHtml = product.image
          ? `<img
               class="c-esearch__result-img"
               src="${product.image}"
               alt="${product.title.replace(/"/g, "&quot;")}"
               width="60"
               height="60"
               loading="lazy"
             >`
          : '<div class="c-esearch__result-img c-esearch__result-img--placeholder"></div>';

        const priceHtml = product.price
          ? `<span class="c-esearch__result-price">${formatMoney(product.price)}</span>`
          : "";

        const comparePriceHtml =
          product.compare_at_price && product.compare_at_price > product.price
            ? `<s class="c-esearch__result-compare">${formatMoney(product.compare_at_price)}</s>`
            : "";

        const vendorHtml = product.vendor
          ? `<span class="c-esearch__result-vendor">${product.vendor}</span>`
          : "";

        parts.push(`
          <li
            class="c-esearch__result  js-esearch-result"
            role="option"
            data-product-id="${product.id}"
            data-position="${index}"
            data-url="${product.url}"
            aria-selected="false"
            tabindex="-1"
          >
            <a class="c-esearch__result-link" href="${product.url}" tabindex="-1">
              ${imgHtml}
              <span class="c-esearch__result-body">
                ${vendorHtml}
                <span class="c-esearch__result-title">${highlight(product.title, query)}</span>
                <span class="c-esearch__result-pricing">
                  ${priceHtml}${comparePriceHtml}
                </span>
              </span>
            </a>
          </li>
        `);
      });
      parts.push("</ul>");

      // View all results link
      const allUrl = `${this.searchPageUrl}?type=product&q=${encodeURIComponent(query)}`;
      parts.push(`
        <div class="c-esearch__view-all">
          <a href="${allUrl}" class="c-esearch__view-all-link">
            View all results for <strong>${query}</strong>
          </a>
        </div>
      `);
    }

    // Popular searches section
    if (this.showPopular && popularSearches.length) {
      parts.push('<div class="c-esearch__popular">');
      parts.push('<p class="c-esearch__popular-label">Popular searches</p>');
      parts.push('<ul class="c-esearch__popular-list">');
      for (const term of popularSearches) {
        parts.push(`
          <li class="c-esearch__popular-item">
            <button
              type="button"
              class="c-esearch__popular-pill  js-esearch-popular"
              data-term="${term.replace(/"/g, "&quot;")}"
            >${term}</button>
          </li>
        `);
      }
      parts.push("</ul></div>");
    }

    this.dropdown.innerHTML = parts.join("");
    this.activeIndex = -1;
    this.showDropdown();
  }

  private renderError() {
    this.dropdown.innerHTML = `
      <p class="c-esearch__error">
        Search is temporarily unavailable. Please try again.
      </p>`;
    this.showDropdown();
  }

  // ── Dropdown visibility ───────────────────────────────────────────────────────

  private showDropdown() {
    this.dropdown.hidden = false;
    this.dropdown.classList.add("c-esearch__dropdown--visible");
    this.input.setAttribute("aria-expanded", "true");
  }

  private hideDropdown() {
    this.dropdown.hidden = true;
    this.dropdown.classList.remove("c-esearch__dropdown--visible");
    this.input.setAttribute("aria-expanded", "false");
    this.activeIndex = -1;
  }

  // ── Loading state ─────────────────────────────────────────────────────────────

  private setLoading(loading: boolean) {
    this.classList.toggle("c-esearch--loading", loading);
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────────

  private handleInputKeydown = (e: KeyboardEvent) => {
    const items = Array.from(
      this.dropdown.querySelectorAll<HTMLElement>(".js-esearch-result"),
    );

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
        this.updateActiveItem(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        if (this.activeIndex === -1) {
          this.input.focus();
        } else {
          this.updateActiveItem(items);
        }
        break;

      case "Enter": {
        const activeItem = items[this.activeIndex];
        if (this.activeIndex >= 0 && activeItem) {
          e.preventDefault();
          const url = activeItem.dataset.url;
          const productId = activeItem.dataset.productId;
          const position = parseInt(activeItem.dataset.position ?? "0", 10);
          if (productId) this.trackClick(productId, position);
          if (url) window.location.href = url;
        }
        break;
      }

      case "Escape":
        this.hideDropdown();
        this.input.blur();
        break;
    }
  };

  private handleGlobalKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !this.dropdown.hidden) {
      this.hideDropdown();
    }
  };

  private updateActiveItem(items: HTMLElement[]) {
    items.forEach((item, i) => {
      const active = i === this.activeIndex;
      item.setAttribute("aria-selected", String(active));
      item.classList.toggle("c-esearch__result--active", active);
      if (active) item.scrollIntoView({ block: "nearest" });
    });
    this.input.setAttribute(
      "aria-activedescendant",
      items[this.activeIndex]?.id ?? "",
    );
  }

  // ── Click handlers ─────────────────────────────────────────────────────────────

  private handleDropdownClick = (e: MouseEvent) => {
    const result = (e.target as HTMLElement).closest<HTMLElement>(
      ".js-esearch-result",
    );
    if (result) {
      const productId = result.dataset.productId;
      const position = parseInt(result.dataset.position ?? "0", 10);
      const url = result.dataset.url;
      if (productId) void this.trackClick(productId, position);
      if (url) {
        e.preventDefault();
        window.location.href = url;
      }
      return;
    }

    const popular = (e.target as HTMLElement).closest<HTMLElement>(
      ".js-esearch-popular",
    );
    if (popular) {
      const term = popular.dataset.term ?? "";
      this.input.value = term;
      void this.handleSearch(term);
    }
  };

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.hideDropdown();
    }
  };

  // ── Chat ──────────────────────────────────────────────────────────────────────

  private toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.chatPanel) {
      this.chatPanel.hidden = !this.isChatOpen;
    }
    this.chatToggle?.setAttribute("aria-expanded", String(this.isChatOpen));
    if (this.isChatOpen) {
      this.chatInput?.focus();
    }
  }

  private async sendChatMessage(message: string) {
    if (!this.chatMessages || !this.chatInput) return;

    // Append user bubble
    this.appendChatBubble("user", message);
    this.chatInput.value = "";

    // Loading bubble
    const loadingId = `chat-loading-${Date.now()}`;
    this.appendChatBubble("assistant", "…", loadingId);

    try {
      const res = await fetch(this.chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          shop: this.shop,
          sessionId: this.sessionId,
        }),
      });

      if (!res.ok) throw new Error(`Chat responded ${res.status}`);

      const data = (await res.json()) as {
        type: string;
        text: string;
        products?: EcompleteProduct[];
      };

      // Replace loading bubble with real reply
      const loadingBubble = this.chatMessages.querySelector(`#${loadingId}`);
      if (loadingBubble) loadingBubble.remove();

      this.appendChatBubble("assistant", data.text);

      if (data.products?.length) {
        this.appendChatProducts(data.products);
      }
    } catch {
      const loadingBubble = this.chatMessages?.querySelector(`#${loadingId}`);
      if (loadingBubble) {
        loadingBubble.textContent =
          "Sorry, I couldn't process that. Please try again.";
      }
    }

    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  private appendChatBubble(role: "user" | "assistant", text: string, id?: string) {
    if (!this.chatMessages) return;
    const bubble = document.createElement("div");
    bubble.className = `c-esearch__chat-bubble c-esearch__chat-bubble--${role}`;
    if (id) bubble.id = id;
    bubble.textContent = text;
    this.chatMessages.appendChild(bubble);
  }

  private appendChatProducts(products: EcompleteProduct[]) {
    if (!this.chatMessages) return;
    const wrapper = document.createElement("div");
    wrapper.className = "c-esearch__chat-products";
    wrapper.innerHTML = products
      .slice(0, 4)
      .map(
        (p) => `
        <a class="c-esearch__chat-product" href="${p.url}">
          ${p.image ? `<img src="${p.image}" alt="${p.title.replace(/"/g, "&quot;")}" width="48" height="48" loading="lazy">` : ""}
          <span>${p.title}</span>
          ${p.price ? `<span class="c-esearch__result-price">${formatMoney(p.price)}</span>` : ""}
        </a>
      `,
      )
      .join("");
    this.chatMessages.appendChild(wrapper);
  }
}

// ─── Register ──────────────────────────────────────────────────────────────────

customElements.define("ecomplete-search", EcompleteSearch);

export default function initEcompleteSearch(): void {
  // Web component handles its own lifecycle via connectedCallback.
  // This function exists for symmetry with other theme modules and can be used
  // to perform any imperative setup needed before components upgrade.
}
