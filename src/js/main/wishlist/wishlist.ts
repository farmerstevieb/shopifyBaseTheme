/**
 * Wishlist Web Components
 *
 * Registers:
 *   <wishlist-button> — toggle button for individual product/variant
 *   <wishlist-count>  — live badge showing total wishlist item count
 *   <wishlist-page>   — page component that renders the full wishlist grid
 */

import { WishlistManager, WishlistItem } from './WishlistManager';

// Singleton shared across all components on the page
const wishlist = new WishlistManager();

// ---------------------------------------------------------------------------
// <wishlist-button>
// ---------------------------------------------------------------------------
class WishlistButtonElement extends HTMLElement {
  connectedCallback(): void {
    // Set initial state synchronously from localStorage
    const variantId = this.dataset.variantId;
    if (variantId && wishlist.has(variantId)) {
      this.classList.add('is-wishlisted');
      this.setAttribute('aria-label', 'Remove from wishlist');
    }

    this.addEventListener('click', this.handleClick.bind(this));
    this.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick.bind(this));
    this.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick(e);
    }
  }

  private async handleClick(e: Event): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    const item: WishlistItem = {
      productId: this.dataset.productId || '',
      variantId: this.dataset.variantId || '',
      productHandle: this.dataset.productHandle || '',
      title: this.dataset.productTitle || '',
      price: parseFloat(this.dataset.productPrice || '0'),
      imageUrl: this.dataset.productImage,
      addedAt: '',
    };

    if (!item.variantId) return;

    this.setAttribute('aria-disabled', 'true');
    const added = await wishlist.toggle(item);
    this.removeAttribute('aria-disabled');

    this.classList.toggle('is-wishlisted', added);
    this.setAttribute(
      'aria-label',
      added ? 'Remove from wishlist' : 'Add to wishlist',
    );
  }
}

// ---------------------------------------------------------------------------
// <wishlist-count>
// ---------------------------------------------------------------------------
class WishlistCountElement extends HTMLElement {
  private onUpdated = (): void => {
    this.textContent = String(wishlist.count);
    this.classList.toggle('has-items', wishlist.count > 0);
  };

  connectedCallback(): void {
    this.textContent = String(wishlist.count);
    this.classList.toggle('has-items', wishlist.count > 0);
    window.addEventListener('wishlist:updated', this.onUpdated);
  }

  disconnectedCallback(): void {
    window.removeEventListener('wishlist:updated', this.onUpdated);
  }
}

// ---------------------------------------------------------------------------
// <wishlist-page>
// ---------------------------------------------------------------------------
class WishlistPageElement extends HTMLElement {
  private grid!: HTMLElement;
  private empty!: HTMLElement;
  private loading!: HTMLElement;
  private topActions!: HTMLElement;
  private shareToast!: HTMLElement;
  private template!: HTMLTemplateElement;

  private onUpdated = (e: Event): void => {
    const { items } = (e as CustomEvent).detail;
    this.render(items);
  };

  connectedCallback(): void {
    this.grid = this.querySelector('.js-wishlist-grid') as HTMLElement;
    this.empty = this.querySelector('.js-wishlist-empty') as HTMLElement;
    this.loading = this.querySelector('.js-wishlist-loading') as HTMLElement;
    this.topActions = this.querySelector('.js-wishlist-top-actions') as HTMLElement;
    this.shareToast = this.querySelector('.js-wishlist-share-toast') as HTMLElement;
    this.template = document.getElementById(
      'wishlist-item-template',
    ) as HTMLTemplateElement;

    // Wire up add-all button
    const addAllBtn = this.querySelector('.js-wishlist-add-all');
    if (addAllBtn) addAllBtn.addEventListener('click', this.handleAddAll.bind(this));

    // Wire up share button
    const shareBtn = this.querySelector('.js-wishlist-share');
    if (shareBtn) shareBtn.addEventListener('click', this.handleShare.bind(this));

    window.addEventListener('wishlist:updated', this.onUpdated);

    // Initial render
    this.render(wishlist.getAll());
  }

  disconnectedCallback(): void {
    window.removeEventListener('wishlist:updated', this.onUpdated);
  }

  private render(items: WishlistItem[]): void {
    if (!this.grid || !this.template) return;

    // Hide loading skeleton
    if (this.loading) this.loading.hidden = true;

    if (items.length === 0) {
      this.empty.hidden = false;
      this.grid.hidden = true;
      this.topActions.hidden = true;
      return;
    }

    this.empty.hidden = true;
    this.grid.hidden = false;
    this.topActions.hidden = false;

    // Diff: remove items no longer in wishlist
    const currentVariantIds = new Set(items.map((i) => i.variantId));
    this.grid.querySelectorAll('.js-wishlist-item').forEach((el) => {
      const itemEl = el as HTMLElement;
      if (!currentVariantIds.has(itemEl.dataset.variantId || '')) {
        itemEl.remove();
      }
    });

    // Add new items
    const existingVariantIds = new Set(
      Array.from(this.grid.querySelectorAll('.js-wishlist-item')).map(
        (el) => (el as HTMLElement).dataset.variantId || '',
      ),
    );

    for (const item of items) {
      if (existingVariantIds.has(item.variantId)) continue;

      const clone = this.template.content.cloneNode(true) as DocumentFragment;
      const itemEl = clone.querySelector('.js-wishlist-item') as HTMLElement;
      itemEl.dataset.variantId = item.variantId;

      // Image
      const img = clone.querySelector('.js-wishlist-item-img') as HTMLImageElement;
      if (img && item.imageUrl) {
        img.src = item.imageUrl;
        img.alt = item.title;
      }

      // Links
      const productUrl = `/products/${item.productHandle}?variant=${item.variantId}`;
      clone.querySelectorAll('a').forEach((a) => {
        if (a.classList.contains('js-wishlist-item-link') ||
            a.classList.contains('js-wishlist-item-title-link') ||
            a.classList.contains('js-wishlist-item-atc')) {
          if (!a.classList.contains('js-wishlist-item-atc')) {
            (a as HTMLAnchorElement).href = productUrl;
          }
        }
      });

      const imgLink = clone.querySelector('.js-wishlist-item-link') as HTMLAnchorElement;
      if (imgLink) imgLink.href = productUrl;

      const titleLink = clone.querySelector('.js-wishlist-item-title-link') as HTMLAnchorElement;
      if (titleLink) {
        titleLink.href = productUrl;
        titleLink.textContent = item.title;
      }

      // Price (formatted as Shopify money — price stored in cents)
      const priceEl = clone.querySelector('.js-wishlist-item-price') as HTMLElement;
      if (priceEl) {
        const formatted = this.formatMoney(item.price);
        priceEl.textContent = formatted;
      }

      // Add to cart — links to PDP for multi-variant or adds directly
      const atcLink = clone.querySelector('.js-wishlist-item-atc') as HTMLAnchorElement;
      if (atcLink) {
        atcLink.href = productUrl;
      }

      // Remove button
      const removeBtn = clone.querySelector('.js-wishlist-item-remove') as HTMLButtonElement;
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          wishlist.remove(item.variantId);
        });
      }

      this.grid.appendChild(clone);
    }
  }

  private async handleAddAll(): Promise<void> {
    const items = wishlist.getAll();
    if (!items.length) return;

    const btn = this.querySelector('.js-wishlist-add-all') as HTMLButtonElement;
    if (btn) btn.setAttribute('aria-disabled', 'true');

    try {
      const body = {
        items: items.map((item) => ({
          id: parseInt(item.variantId, 10),
          quantity: 1,
        })),
      };

      const response = await fetch((window as any).Shopify.routes.cartAddUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Trigger cart drawer if it exists
        const cartDrawer = document.querySelector('.js-drawer-cart');
        if (cartDrawer) {
          document.body.dispatchEvent(
            new CustomEvent('Dialog:Open:DrawerCart', { bubbles: true }),
          );
        } else {
          window.location.href = (window as any).Shopify.routes.cartUrl;
        }
      }
    } catch (e) {
      console.error('Add all to cart failed:', e);
    } finally {
      if (btn) btn.removeAttribute('aria-disabled');
    }
  }

  private handleShare(): void {
    const url = `${window.location.origin}/pages/wishlist`;

    if (navigator.share) {
      navigator.share({ url, title: document.title }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.showShareToast();
      });
    }
  }

  private showShareToast(): void {
    if (!this.shareToast) return;
    this.shareToast.hidden = false;
    setTimeout(() => {
      this.shareToast.hidden = true;
    }, 3000);
  }

  private formatMoney(cents: number): string {
    const shopCurrency = (window as any).Shopify?.currency?.active || 'GBP';
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: shopCurrency,
      }).format(cents / 100);
    } catch {
      return `${(cents / 100).toFixed(2)}`;
    }
  }
}

// ---------------------------------------------------------------------------
// Register custom elements
// ---------------------------------------------------------------------------
customElements.define('wishlist-button', WishlistButtonElement);
customElements.define('wishlist-count', WishlistCountElement);
customElements.define('wishlist-page', WishlistPageElement);

export { wishlist, WishlistManager };
