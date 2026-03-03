import type { SearchProduct, SearchResult } from "@nosto/nosto-js/client";
import he from "he";

import { debounce, get, lock, release } from "../../utils";
import { formatMoney } from "../../utils/shopify";

type ShopifyPredictiveSearchAPIResponse = {
  resources: {
    results: {
      pages: {
        author: string;
        body: string;
        handle: string;
        id: number;
        published_at: string;
        title: string;
        url: string;
      }[];
      articles: {
        author: string;
        body: string;
        handle: string;
        id: number;
        image: string;
        published_at: string;
        summary_html: string;
        tags: string[];
        title: string;
        url: string;
        featured_image: {
          alt: string | null;
          aspect_ratio: number | null;
          height: number | null;
          url: string | null;
          width: number | null;
        };
      }[];
      collections: {
        id: number;
        body: string;
        handle: string;
        published_at: string;
        title: string;
        url: string;
        featured_image: {
          alt: string | null;
          aspect_ratio: number | null;
          height: number | null;
          url: string | null;
          width: number | null;
        };
      }[];
    };
  };
};

class SearchForm extends HTMLFormElement {
  input: HTMLInputElement;
  resetButton: HTMLButtonElement;
  searchTerm: string;

  constructor() {
    super();

    this.input = get('input[type="search"]') as HTMLInputElement;
    this.resetButton = get('button[type="reset"]') as HTMLButtonElement;

    this.input.addEventListener(
      "input",
      debounce((event: Event) => {
        this.onChange(event);
      }, 300).bind(this),
    );

    this.searchTerm = this.input.value.trim();
  }

  onChange(event: Event) {
    event.preventDefault();
  }
}

customElements.define("search-form", SearchForm, {
  extends: "form",
});

class NostoPredictiveSearch extends SearchForm {
  dropdown: HTMLElement;
  loadingIndicator: HTMLElement;
  statusEl: HTMLElement;
  noResultsEl: HTMLElement;
  searchResults: HTMLElement;
  overlay: HTMLElement;

  suggestionsList: HTMLUListElement;
  collectionsList: HTMLUListElement;
  productsList: HTMLUListElement;
  pagesAndArticlesList: HTMLUListElement;

  queryNotifier: HTMLElement;

  resultsCount = 0;

  isBusy = false;

  constructor() {
    super();

    this.dropdown = get(
      ".js-nst-predictive-search-dropdown",
      this,
    ) as HTMLElement;
    this.loadingIndicator = get(
      ".js-nst-predictive-search-loading-indicator",
      this,
    ) as HTMLElement;
    this.statusEl = get(
      ".js-nst-predictive-search-status",
      this,
    ) as HTMLElement;
    this.searchResults = get(
      ".js-nst-predictive-search-results",
      this,
    ) as HTMLElement;
    this.noResultsEl = get(
      ".js-nst-predictive-search-no-results-notice",
      this,
    ) as HTMLElement;
    this.overlay = get(".js-search-overlay") as HTMLElement;

    this.suggestionsList = get(
      ".js-nst-predictive-search-list-suggestions",
      this,
    ) as HTMLUListElement;
    this.collectionsList = get(
      ".js-nst-predictive-search-list-collections",
      this,
    ) as HTMLUListElement;
    this.productsList = get(
      ".js-nst-predictive-search-list-products",
      this,
    ) as HTMLUListElement;
    this.pagesAndArticlesList = get(
      ".js-nst-predictive-search-list-pages-and-articles",
      this,
    ) as HTMLUListElement;

    this.queryNotifier = get(
      ".js-nst-predictive-search-query-notifier",
      this,
    ) as HTMLElement;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.form?.addEventListener("submit", this.onFormSubmit.bind(this));

    this.input.addEventListener("focus", this.onFocus.bind(this));
    this.addEventListener("blur", this.onFocusOut.bind(this));
    this.addEventListener("keyup", this.onKeyup.bind(this));
    this.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  override onChange() {
    this.resultsCount = 0;
    this.searchTerm = this.getQuery();
    this.updateSearchForTerm(this.searchTerm);

    if (this.searchTerm.length === 0) {
      this.close(true);
      return;
    }

    this.getSearchResults(this.searchTerm);
  }

  updateTextContent() {
    this.noResultsEl.textContent = String(
      this.noResultsEl.dataset.nostoSearchResultsEmptyText?.replace(
        "{{ terms }}",
        this.searchTerm,
      ),
    );

    const loading = Boolean(this.hasAttribute("loading"));

    if (loading) {
      this.statusEl.textContent = String(this.dataset.loadingText);
    } else {
      this.statusEl.textContent =
        this.resultsCount > 0 ?
          String(this.statusEl.dataset.nostoSearchResultsFoundText)
            .replace("{{ amount }}", String(this.resultsCount))
            .replace("{{ terms }}", this.searchTerm)
        : String(this.statusEl.dataset.nostoSearchResultsEmptyText).replace(
            "{{ terms }}",
            this.searchTerm,
          );
    }
  }

  onFormSubmit(event: Event) {
    if (
      this.getQuery().length === 0 ||
      this.querySelector('[aria-selected="true"] a')
    ) {
      event.preventDefault();
    } else {
      // Organic Impression
      void window.nostojs((api) => {
        api.recordSearchSubmit(this.getQuery());
      });
      this.callNosto(this.getQuery()).then((nostoResponse) => {
        if (
          nostoResponse &&
          typeof nostoResponse.redirect === "string" &&
          nostoResponse.redirect.length > 0
        ) {
          event.preventDefault();
          window.location.href = nostoResponse.redirect;
        }
      });
    }
  }

  onFocus() {
    const currentSearchTerm = this.getQuery();

    if (currentSearchTerm.length === 0) return;

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute("results") === "true") {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
  }

  onFocusOut() {
    if (this.isBusy) return;

    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onKeyup(event: KeyboardEvent) {
    if (this.getQuery().length === 0) this.close(true);

    event.preventDefault();

    switch (event.code) {
      case "ArrowUp": {
        this.switchOption("up");
        break;
      }
      case "ArrowDown": {
        this.switchOption("down");
        break;
      }
      case "Enter": {
        this.selectOption();
        break;
      }
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      event.preventDefault();
    }
  }

  updateSearchForTerm(searchTerm: string) {
    const { nostoSearchCurrentQueryText } = this.queryNotifier.dataset;
    if (!nostoSearchCurrentQueryText) return;

    this.queryNotifier.textContent = nostoSearchCurrentQueryText.replace(
      "{{ terms }}",
      searchTerm,
    );
  }

  switchOption(direction: "up" | "down") {
    if (!this.getAttribute("open")) return;

    const moveUp = direction === "up";
    const selectedElement = this.querySelector('[aria-selected="true"]');

    // Filter out hidden elements (duplicated page and article resources) thanks
    // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    const allVisibleElements = [
      ...this.querySelectorAll("li, button.nst-predictive-search__item"),
    ].filter((element) => (element as HTMLElement).offsetParent !== null);
    let activeElementIndex = 0;

    if (moveUp && !selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }

    this.statusEl.textContent = "";

    if (!moveUp && selectedElement) {
      activeElementIndex =
        selectedElementIndex === allVisibleElements.length - 1 ?
          0
        : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex =
        selectedElementIndex === 0 ?
          allVisibleElements.length - 1
        : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    if (selectedElement) selectedElement.setAttribute("aria-selected", "false");

    const activeElement = allVisibleElements[activeElementIndex];
    if (activeElement) {
      activeElement.setAttribute("aria-selected", "true");
      this.input.setAttribute("aria-activedescendant", activeElement.id);
    }
  }

  selectOption() {
    const selectedOption = get(
      '[aria-selected="true"] a, button[aria-selected="true"]',
      this,
    );

    if (selectedOption) (selectedOption as HTMLElement).click();
  }

  getSearchResults(searchTerm: string) {
    this.isBusy = true;
    this.toggleLoadState();

    Promise.all([
      this.callShopifyPredictiveSearchAPI(searchTerm),
      this.callNosto(searchTerm),
    ])
      .then((responses) => {
        for (const response of responses) {
          // Predictive Search API Response
          if ("resources" in response) {
            const { collections, pages, articles } = response.resources.results;

            if (Array.isArray(collections))
              this.resultsCount = this.resultsCount + collections.length;
            if (Array.isArray(pages))
              this.resultsCount = this.resultsCount + pages.length;
            if (Array.isArray(articles))
              this.resultsCount = this.resultsCount + articles.length;

            this.generateCollections(response);
            this.generatePagesAndArticles(response);
          } else if (
            "products" in response &&
            Array.isArray(response.products?.hits)
          ) {
            const hits = response.products.hits;
            this.resultsCount += hits.length;

            this.generateSuggestions(response);
            this.generateProducts(response);
          } else {
            // Nosto API Response
            const { keywords, products } = response;

            if (keywords && Array.isArray(keywords))
              this.resultsCount = this.resultsCount + keywords.length;
            if (products && Array.isArray(products))
              this.resultsCount = this.resultsCount + products.length;

            this.generateSuggestions(response);
            this.generateProducts(response);
          }
        }

        if (this.resultsCount > 0) {
          this.setAttribute("results", "true");
        } else {
          this.setAttribute("results", "false");
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        this.isBusy = false;
        this.toggleLoadState();
        this.open();
        this.updateTextContent();
      });
  }

  async callShopifyPredictiveSearchAPI(
    searchTerm: string,
  ): Promise<ShopifyPredictiveSearchAPIResponse> {
    let apiResponse: ShopifyPredictiveSearchAPIResponse | undefined;

    await fetch(
      window.Shopify.routes.root +
        `search/suggest.json?q=${searchTerm}&resources[type]=page,article,collection&resources[options][unavailable_products]=hide&resources[limit_scope]=each&resources[limit]=3&resources[options][fields]=title,product_type,variants.title`,
    )
      .then((res) => res.json())
      .then((response) => {
        apiResponse = response as ShopifyPredictiveSearchAPIResponse;
      })
      .catch((error: unknown) => {
        throw error;
      });

    return (
      apiResponse || {
        resources: { results: { pages: [], articles: [], collections: [] } },
      }
    );
  }

  async callNosto(searchTerm: string): Promise<SearchResult> {
    let apiResponse: SearchResult | undefined;

    await new Promise<void>((resolve, reject) => {
      void window.nostojs((api) => {
        api
          .search(
            {
              query: searchTerm,
              products: {
                fields: [
                  "name",
                  "pid",
                  "alternateImageUrls",
                  "thumbUrl",
                  "url",
                  "brand",
                  "productId",
                  "categories",
                  "price",
                  "listPrice",
                  "imageUrl",
                  "inventoryLevel",
                  "customFields.key",
                  "customFields.value",
                  "skus.inventoryLevel",
                  "skus.name",
                  "skus.id",
                  "skus.imageUrl",
                  "skus.price",
                  "skus.listPrice",
                  "priceCurrencyCode",
                ],
                size: 6,
              },
              keywords: {
                fields: ["keyword"],
                facets: [],
                size: 2,
              },
            },
            {
              track: "autocomplete",
            },
          )
          .then((response) => {
            apiResponse = response;
            resolve();
          })
          .catch((error: unknown) => {
            reject(new Error(error as string));
          });
      });
    });

    return (
      apiResponse || {
        products: { hits: [], total: 0 },
        keywords: { hits: [], total: 0 },
      }
    );
  }

  generateSuggestions(response: SearchResult) {
    const hasSuggestions = Number(response.keywords?.total) > 0;
    this.suggestionsList.innerHTML = "";

    if (hasSuggestions) {
      const hits = response.keywords?.hits;
      if (!hits) return;

      this.classList.add("nst-predictive-search--has-suggestions");

      const itemTemplate = this.suggestionsList.dataset.nostoSuggestionTemplate;
      if (!itemTemplate) return;

      for (const [i, suggestion] of hits.entries()) {
        // Highlights the part of the suggestion that matches the query.
        let suggestionKeywordHTML = "";
        const splitSuggestionBySpaces = suggestion.keyword.split(" ");
        for (const word of splitSuggestionBySpaces) {
          suggestionKeywordHTML =
            suggestionKeywordHTML + `<span>${word}</span>`;
        }
        suggestionKeywordHTML = suggestionKeywordHTML.replace(
          this.searchTerm.toLowerCase(),
          `<mark>${this.searchTerm.toLowerCase()}</mark>`,
        );

        const suggestionItem = itemTemplate
          .replaceAll("[[item_index]]", String(i))
          .replaceAll(
            "[[item_suggestion_accessibility_text]]",
            suggestion.keyword,
          )
          .replaceAll("[[item_suggestion_text]]", suggestionKeywordHTML)
          .replaceAll(
            "[[item_suggestion_text_handleized]]",
            suggestion.keyword.toLowerCase().replaceAll(" ", "+"),
          )
          .replaceAll("[[item_query]]", this.searchTerm.toLowerCase());

        this.suggestionsList.insertAdjacentHTML("beforeend", suggestionItem);
      }
    } else {
      this.classList.remove("nst-predictive-search--has-suggestions");
    }

    // Suggestions click tracking
    for (const suggestionEl of this.suggestionsList.querySelectorAll(
      ".nst-predictive-search__list-item--suggestion",
    )) {
      const suggestionElKeyWord = suggestionEl.querySelector("a")
        ?.title as string;
      suggestionEl.addEventListener("click", () => {
        void window.nostojs((api) => {
          api.recordSearch(
            "autocomplete",
            {
              query: suggestionElKeyWord,
              products: { size: 2, from: 0 },
              keywords: { size: 2, from: 0, fields: ["keyword"], facets: [] },
            },
            {
              products: { hits: [], total: 0, size: 2, from: 0, fuzzy: false },
              keywords: { hits: [], total: 0 },
            },
            {
              isKeyword: true,
            },
          );
          api.recordSearchSubmit(suggestionElKeyWord);
        });
      });
    }
  }

  generatePagesAndArticles(response: ShopifyPredictiveSearchAPIResponse) {
    const { pages, articles } = response.resources.results;
    const hasPagesOrArticles = pages.length > 0 || articles.length > 0;
    const pageContainer = document.querySelector(
      ".nst-predictive-search__pages-and-articles-wrapper",
    );
    this.pagesAndArticlesList.innerHTML = "";

    if (hasPagesOrArticles) {
      this.classList.add("nst-predictive-search--has-pages-or-articles");

      const itemPageTemplate =
        this.pagesAndArticlesList.dataset.nostoPageTemplate;
      const itemArticleTemplate =
        this.pagesAndArticlesList.dataset.nostoArticleTemplate;
      if (!itemPageTemplate || !itemArticleTemplate) return;

      const pageLimit = 2;
      for (let i = 0; i < pageLimit; i++) {
        const page = pages[i];
        if (!page) continue;

        const pageItem = itemPageTemplate
          .replaceAll("[[item_index]]", String(i))
          .replaceAll("[[item_page_url]]", page.url)
          .replaceAll("[[item_page_title]]", page.title);

        this.pagesAndArticlesList.insertAdjacentHTML("beforeend", pageItem);
      }

      const articleLimit = 2;
      for (let i = 0; i < articleLimit; i++) {
        const article = articles[i];
        if (!article) continue;

        let articleItem = itemArticleTemplate
          .replaceAll("[[item_index]]", String(i))
          .replaceAll("[[item_article_url]]", article.url)
          .replaceAll("[[item_article_title]]", article.title);

        if (article.featured_image.url) {
          articleItem = articleItem.replaceAll(
            "[[item_article_image_src]]",
            article.featured_image.url,
          );
        }

        if (article.featured_image.alt) {
          articleItem = articleItem.replaceAll(
            "[[item_article_image_alt]]",
            article.featured_image.alt,
          );
        }

        this.pagesAndArticlesList.insertAdjacentHTML("beforeend", articleItem);
        if (pageContainer) {
          pageContainer.classList.remove("hidden");
        }
      }
    } else {
      this.classList.remove("nst-predictive-search--has-pages-or-articles");
      if (pageContainer) {
        pageContainer.classList.add("hidden");
      }
    }
  }

  generateCollections(response: ShopifyPredictiveSearchAPIResponse) {
    const { collections } = response.resources.results;
    const hasCollections = collections.length > 0;
    this.collectionsList.innerHTML = "";

    if (hasCollections) {
      this.classList.add("nst-predictive-search--has-collections");

      const itemTemplate = this.collectionsList.dataset.nostoCollectionTemplate;
      if (!itemTemplate) return;

      // eslint-disable-next-line unicorn/no-for-loop
      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        if (!collection) continue;

        const collectionItem = itemTemplate
          .replaceAll("[[item_index]]", String(i))
          .replaceAll("[[item_collection_url]]", collection.url)
          .replaceAll("[[item_collection_title]]", collection.title);

        this.collectionsList.insertAdjacentHTML("beforeend", collectionItem);
      }
    } else {
      this.classList.remove("nst-predictive-search--has-collections");
    }
  }

  determinePrice = (product: SearchProduct): string => {
    // Hide prices for guest customers
    const customerIsLoggedIn = this.getAttribute("data-customer-is-logged-in") === "true";
    if (!customerIsLoggedIn) return "";

    const priceInCents = Number(product.listPrice) * 100;

    /**
     * TODO: Start price is wrong, leaving this here to be adjusted later once response returns actual start price,
     * as of 15/3/2025 the product doesn't return the variant pricing.
     */
    const startPriceInCents = Number(product.listPrice) * 100;
    const salePriceInCents = Number(product.price) * 100;

    const price = formatMoney({ cents: priceInCents });
    const startPrice = formatMoney({ cents: startPriceInCents });
    const salePrice = formatMoney({ cents: salePriceInCents });

    const priceComponent = () => {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (salePriceInCents === priceInCents) {
        /* Sale price being the same as the price means the product isn't on sale */
        return `
          <p>
            ${price}
          </p>
        `;
      } else {
        /* Sale price not being the same as the price means the product is on sale */
        return `
          <p class="text-compare line-through">
            ${price}
          </p>
          <p class="text-sale">
            ${salePrice}
          </p>
        `;
      }
    };

    const varyingPriceComponent = () => {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (salePriceInCents === priceInCents) {
        /* Sale price being the same as the price means the product isn't on sale */
        return `
          <p>
            ${he.decode(window._Nosto.i18n.products.card.from_price.replace("{{ price }}", startPrice))}
          </p>
        `;
      } else {
        /* Sale price not being the same as the price means the product is on sale */
        return `
          <p class="text-compare line-through">
            ${he.decode(window._Nosto.i18n.products.card.from_price.replace("{{ price }}", startPrice))}
          </p>
          <p class="text-sale">
            ${salePrice}
          </p>
        `;
      }
    };

    return `
      <h6 class="flex gap-x-2 font-body text-sm font-semibold text-primary flex-row-reverse tracking-0 w-fit">
        ${
          startPriceInCents && startPriceInCents !== priceInCents ?
            /* Start price being present means there are varying prices for this product */
            varyingPriceComponent()
          : /* Start price not being present means there are no varying prices for this product */
            priceComponent()
        }
      </h6>
    `;
  };

  generateProducts(response: SearchResult) {
    const hasProducts = Number(response.products?.total) > 0;
    this.productsList.innerHTML = "";

    if (hasProducts) {
      const hits = response.products?.hits;
      if (!hits) return;

      this.classList.add("nst-predictive-search--has-products");

      const itemTemplate = this.productsList.dataset.nostoProductTemplate;
      if (!itemTemplate) return;

      for (const [i, product] of hits.entries()) {
        const initialVariant =
          product.skus && product.skus.length > 0 ? product.skus[0] : undefined;

        const productItem = itemTemplate
          .replaceAll("[[item_index]]", String(i))
          .replaceAll(
            "[[item_product_handle]]",
            String(product.url?.split("/products/")[1]),
          )
          .replaceAll(
            "[[item_product_image_src]]",
            String(
              initialVariant && initialVariant.imageUrl ?
                initialVariant.imageUrl
              : product.imageUrl,
            ),
          )
          .replaceAll("[[item_product_title]]", String(product.name))
          .replaceAll(
            "[[item_product_image_price]]",
            this.determinePrice(product),
          );

        this.productsList.insertAdjacentHTML("beforeend", productItem);
      }
      // Product Click Tracking
      const productEls = this.productsList.querySelectorAll(
        ".nst-predictive-search__list-item--product",
      );

      for (const [index, productEl] of productEls.entries()) {
        productEl.addEventListener("click", () => {
          const product = hits[index];
          if (product) {
            void window.nostojs((api) => {
              void api.recordSearchClick("autocomplete", {
                productId: product.productId as string,
                url: product.url ?? "",
              });
            });
          }
        });
      }
    } else {
      this.classList.remove("nst-predictive-search--has-products");
    }
  }

  toggleLoadState() {
    const loading = Boolean(this.hasAttribute("loading"));

    if (loading) {
      this.removeAttribute("loading");
      this.loadingIndicator.setAttribute("aria-hidden", "true");
    } else {
      this.setAttribute("loading", "");
      this.loadingIndicator.setAttribute("aria-hidden", "false");
    }
  }

  open() {
    this.setAttribute("open", "true");
    this.input.setAttribute("aria-expanded", "true");
    this.overlay.classList.add("opacity-40");
    this.updateSearchForTerm(this.searchTerm);
    void lock(this.dropdown);
  }

  close(clearSearchTerm = false) {
    if (this.isBusy) return;

    this.closeResults(clearSearchTerm);
    if (window.innerWidth >= 768) {
      this.overlay.classList.remove("opacity-40");
    }

    void release(this.dropdown);
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = "";
      this.removeAttribute("results");
    }
    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute("aria-selected", "false");

    this.input.setAttribute("aria-activedescendant", "");
    this.removeAttribute("loading");
    this.removeAttribute("open");
    this.input.setAttribute("aria-expanded", "false");
  }
}

customElements.define("nst-predictive-search", NostoPredictiveSearch, {
  extends: "form",
});
