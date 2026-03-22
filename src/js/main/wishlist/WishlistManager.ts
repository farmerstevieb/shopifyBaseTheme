/**
 * Wishlist module — localStorage for guests, API sync for logged-in customers.
 *
 * Storage: localStorage key 'ecomplete_wishlist' = JSON array of WishlistItem
 * API: configurable endpoint via data-wishlist-api-url on <body>
 *
 * Guest flow: all operations in localStorage. On login, syncs to API.
 * Customer flow: API calls + localStorage cache for instant UI.
 */

export interface WishlistItem {
  productId: string;
  variantId: string;
  productHandle: string;
  title: string;
  price: number;
  imageUrl?: string;
  addedAt: string;
}

const STORAGE_KEY = 'ecomplete_wishlist';

export class WishlistManager {
  private items: WishlistItem[] = [];
  private customerId: string | null = null;
  private apiUrl: string | null = null;

  constructor() {
    this.load();
    this.customerId = document.body.dataset.customerId || null;
    this.apiUrl = document.body.dataset.wishlistApiUrl || null;
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    this.updateUI();
  }

  has(variantId: string): boolean {
    return this.items.some((i) => i.variantId === variantId);
  }

  async toggle(item: WishlistItem): Promise<boolean> {
    if (this.has(item.variantId)) {
      await this.remove(item.variantId);
      return false;
    }
    await this.add(item);
    return true;
  }

  async add(item: WishlistItem): Promise<void> {
    if (this.has(item.variantId)) return;
    this.items.push({ ...item, addedAt: new Date().toISOString() });
    this.save();

    if (this.customerId && this.apiUrl) {
      try {
        await fetch(`${this.apiUrl}/wishlist/${this.customerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shop-Domain': (window as any).Shopify?.shop || '',
          },
          body: JSON.stringify(item),
        });
      } catch (e) {
        console.warn('Wishlist API sync failed:', e);
      }
    }
  }

  async remove(variantId: string): Promise<void> {
    this.items = this.items.filter((i) => i.variantId !== variantId);
    this.save();

    if (this.customerId && this.apiUrl) {
      try {
        await fetch(
          `${this.apiUrl}/wishlist/${this.customerId}?variantId=${variantId}`,
          {
            method: 'DELETE',
            headers: {
              'X-Shop-Domain': (window as any).Shopify?.shop || '',
            },
          },
        );
      } catch (e) {
        console.warn('Wishlist API sync failed:', e);
      }
    }
  }

  /**
   * Sync localStorage wishlist to API after customer logs in.
   * Call this on the account page if customer just authenticated.
   */
  async syncToApi(): Promise<void> {
    if (!this.customerId || !this.apiUrl || this.items.length === 0) return;

    try {
      for (const item of this.items) {
        await fetch(`${this.apiUrl}/wishlist/${this.customerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shop-Domain': (window as any).Shopify?.shop || '',
          },
          body: JSON.stringify(item),
        });
      }
    } catch (e) {
      console.warn('Wishlist API sync failed:', e);
    }
  }

  getAll(): WishlistItem[] {
    return [...this.items];
  }

  get count(): number {
    return this.items.length;
  }

  private updateUI(): void {
    // Update all wishlist-button custom elements
    document.querySelectorAll('wishlist-button').forEach((btn) => {
      const el = btn as HTMLElement;
      const variantId = el.dataset.variantId;
      if (!variantId) return;

      const isWishlisted = this.has(variantId);
      el.classList.toggle('is-wishlisted', isWishlisted);
      el.setAttribute(
        'aria-label',
        isWishlisted ? 'Remove from wishlist' : 'Add to wishlist',
      );
    });

    // Update count badges
    document.querySelectorAll('wishlist-count').forEach((el) => {
      el.textContent = String(this.count);
      el.classList.toggle('has-items', this.count > 0);
    });

    // Dispatch event for wishlist page re-render
    window.dispatchEvent(
      new CustomEvent('wishlist:updated', {
        detail: { items: this.getAll() },
      }),
    );
  }
}
