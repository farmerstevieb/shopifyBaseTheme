import type { NostojsCallback } from "@nosto/nosto-js/client";

// Fix TS checker error on importing .scss files
declare module "*.scss";

// Shopify globals
type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>);

interface Shopify {
  PaymentButton: {
    init(): unknown;
  };
  autoloadFeatures(param: unknown): unknown;
  /**
   * Only show in Theme previews, it's a class instance, yuck.
   */
  PreviewBarInjector(options: {
    targetNode: HTMLElement;
    iframeRoot: string;
    iframeSrc: string;
    previewToken: string;
    themeStoreId: string;
    permanentDomain: string;
  }): {
    /**
     * This is already invoked at runtime
     */
    init(): void;
    hideIframe(): void;
    postMessageBuffer(argument: unknown): unknown;
    postTrekkieData(param: unknown): unknown;
    sendPostMessage(param1: unknown, param2: unknown): unknown;
    postMessageHandler(
      param1: unknown,
      param2: unknown,
      param3: unknown,
      param4: unknown,
    ): unknown;
    teardown(): void;
  };
  /**
   * Set to `true` when active in theme editor
   */
  designMode?: boolean;
  /**
   * Related to web-pixels management
   */
  analytics: {
    /**
     * Store reference of some sort, see `publish` method.
     */
    replayQueue: Array<[unknown, unknown, unknown]>;
    /**
     * Inserts entries into the `replayQueue`
     */
    publish(param1: unknown, param2: unknown, param3: unknown): void;
  };
  /**
   * Routes reference
   */
  routes: {
    /**
     * The root path, typically `/` unless you are using sub-folder
     * markets then it would be something like `/en-us/` etc
     */
    root: string;
  };
  /**
   * Reference to CDN hostname, typically: `cdn.shopify.com`
   */
  cdnHost: string;
  /**
   * Currency Reference
   */
  currency: {
    /**
     * The current active current code, eg: `USD`, `SEK` etc
     */
    active: string;
    /**
     * The exchange rate
     */
    rate: string;
  };
  /**
   * The current 2 Letter ISO Country code, eg: `US` or `CA` or `NL` etc
   */
  country: string;
  /**
   * Customer Privacy Methods
   */
  customerPrivacy: {
    getRegulation(): unknown;
    getShopPrefs(): unknown;
    getTrackingConsent(): unknown;
    isRegulationEnforced(): unknown;
    setTrackingConsent(param1: unknown, param2: unknown): unknown;
    shouldShowGDPRBanner(): unknown;
    userCanBeTracked(): unknown;
    userDataCanBeSold(): unknown;
  };
  loadFeatures(
    params: Array<{
      name: LiteralUnion<"consent-tracking-api", string>;
      version: LiteralUnion<"0.1", string>;
    }>,
    callback: (error: Error) => void,
  ): unknown;
  /**
   * Two letter language code
   */
  locale: string;
  /**
   * The `myshopify.com` store domain
   */
  shop: string;
  modules: boolean;
  /**
   * Theme Information
   */
  theme: {
    handle: string;
    id: number;
    name: string;
    role: "main" | "development" | "unpublished";
    style: {
      id: number;
      handle: string;
    };
    theme_store_id: null | number;
  };
}

interface BOOMR {
  /**
   * Timestamp, eg: `new Date().getTime()`
   */
  snippetStart: number;
  snippetExecuted: boolean;
  snippetVersion: number;
  /**
   * The application rederer, typically: `storefront-renderer`
   */
  application: string;
  /**
   * The name of the Theme
   */
  themeName: string;
  /**
   * The theme version
   */
  themeVersion: string;
  /**
   * Shop ID
   */
  shopId: number;
  /**
   * Theme ID
   */
  themeId: number;
  /**
   * Theme render region
   */
  renderRegion: string;
  /**
   * External scripting reference, typically:
   * `https://cdn.shopify.com/shopifycloud/boomerang/shopify-boomerang-1.0.0.min.js`
   */
  url: string;
}

interface ShopifyAnalytics {
  /**
   * Holds some references, not just `currency`
   * Seems to change between navigations.
   */
  meta: {
    currency: string;
  };
  /**
   * Related to Google Analytics, unknown usage for now.
   */
  merchantGoogleAnalytics(): void;
  /**
   * Seems to be what is used to publish to dashboard
   */
  lib: {
    /**
     * Likely an action reference, something like `Viewed Product Category`
     * as the first parameter and the 2nd being an object describing the action.
     */
    track(action: string, data: object): unknown;
    /**
     * Similar to `track`
     */
    page(action: string, data: object): unknown;
  };
}

interface ShopifyExtended extends Shopify {
  routes: {
    root: string;
    cartUrl: string;
    cartAddUrl: string;
    cartChangeUrl: string;
    cartUpdateUrl: string;
    predictiveSearchUrl: string;
  };
  theme: {
    dialogs: unknown[];
    showLoginForm: () => boolean;
    showForgotPasswordForm: (event?: Event) => boolean;
    i18n: {
      addToCart: string;
      soldOut: string;
      unavailable: string;
      cart: {
        error: string;
        quantityError: string;
      };
      shareSuccess: string;
      global: {
        dialogs: {
          accessibility: {
            actions: {
              open: string;
              close: string;
            };
          };
        };
      };
    };
  };
}

declare global {
  interface Window {
    // Available when loaded within Tryzens mobile app
    webkit?: {
      messageHandlers?: {
        webViewBridge?: {
          postMessage: (string: string) => void;
        };
      };
    };
    webViewBridge?: {
      postMessage: (string: string) => void;
    };
    // Third parties
    YT: unknown;
    Vimeo: {
      Player: unknown;
    };
    onYouTubeIframeAPIReady: () => void;

    // Yotpo
    yotpoWidgetsContainer?: {
      initWidgets: () => void;
    };

    // Nosto
    nostojs: (callback: NostojsCallback) => Promise<unknown>;
    _Nosto: {
      i18n: {
        serp: {
          breadcrumbs: {
            prompt: string;
            search_for: string;
          };
          facets: {
            clear_all: string;
            apply_filters: string;
            no_results: string;
            filters: {
              selected: {
                one: string;
                other: string;
                price: string;
                reset: string;
              };
              terms: {
                remove: string;
              };
            };
            sort: {
              label: string;
            };
            dialog: {
              title: string;
              accessibility: {
                title: string;
                description: string;
              };
            };
          };
          results: {
            prompt: string;
            found: string;
            none: {
              title: string;
              text: string;
            };
          };
          input: {
            placeholder: string;
            accessibility: {
              input: string;
              submit: string;
            };
          };
        };
        category: {
          facets: {
            no_results: string;
          };
        };
        products: {
          card: {
            quick_shop: string;
            from_price: string;
            stickers: {
              on_sale: string;
              sold_out: string;
            };
            variants: {
              more: string;
            };
            button: {
              login: string;
              shop_now: string;
              add_to_cart: string;
              sold_out: string;
            };
          };
        };
        pagination: {
          results: string;
          results_current_total: string;
          dynamic: {
            load_more: string;
            loaded: string;
          };
          text: {
            label: string;
            previous: string;
            next: string;
            page: {
              go_to: string;
              current: string;
            };
          };
        };
      };
    };
    nosto?: {
      Window: {
        _targetWindow: Window;
        reload: (n: unknown) => void;
        waitFor: (e: unknown, t: unknown) => void;
      };
    };
    nostoTemplatesConfig?: {
      merchant: string;
      defaultCurrency: string;
    };
    nostoTemplatesLoaded?: boolean;
    Nosto?: {
      addBundleToCartWithDiscount: (e: unknown, t: unknown) => Promise<void>;
      addMultipleProductsToCart: (e: unknown, t: unknown) => Promise<void>;
      addProductToCart: (e: unknown, t: unknown, n: unknown) => Promise<void>;
      addSkuToCart: (e: unknown, t: unknown, n: unknown) => Promise<void>;
      fetchPresentmentPrice: (
        e: unknown,
        t: unknown,
        n: unknown,
      ) => Promise<unknown>;
      migrateToShopifyMarket: (e: unknown) => void;
      reloadCart: (e: unknown, t: unknown) => Promise<void>;
      reloadCartWithFlags: (e: unknown, t: unknown) => Promise<void>;
      sendCartToken: (e: unknown) => void;
      setPresentmentPrices: (e: unknown, t: unknown) => void;
      setPresentmentPricesUrl: (
        e: unknown,
        t: unknown,
        n: unknown,
        r: unknown,
      ) => void;
      shopifyScript: boolean;
    };

    // Shopify
    BOOMR: BOOMR;
    ShopifyAnalytics: ShopifyAnalytics;
    Shopify: ShopifyExtended;
  }
}
