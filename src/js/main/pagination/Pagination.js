import { get, getAll } from "../../utils";

class Pagination {
  constructor(element) {
    this.element = element;
    this.sectionElement = get(".js-paginatable");
    this.listElement = get(".js-paginatable-list");
    this.pagination = get(".js-pagination");
    this.text = get(".js-pagination-text");
    this.trigger = get(".js-pagination-trigger");

    if (
      !this.trigger ||
      this.element.classList.contains("js-pagination-custom")
    )
      return;

    this.initialState = {
      itemClassName: ".js-paginatable-item",
      perPage: parseInt(this.element.dataset.perPage),
      textTemplate: this.element.dataset.textTemplate,
      buttonTextTemplate: this.element.dataset.buttonTextTemplate,
      initialButtonTextTemplate: this.element.dataset.initialButtonTextTemplate,
      totalItems: parseInt(this.element.dataset.totalItems),
      url: this.element.dataset.url,
    };

    this.updateCount();
    this.bindEvents();
  }

  bindEvents() {
    this.trigger.addEventListener("click", () => {
      this.paginate();
    });

    if (this.element.hasAttribute("data-infinite-scroll")) {
      this.initInfiniteScroll();
    }
  }

  initInfiniteScroll() {
    const threshold = this.element.dataset.infiniteScrollThreshold || "200px";

    this.infiniteObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.trigger.disabled) {
          this.infiniteObserver.disconnect();
          this.paginate().then(() => this.initInfiniteScroll());
        }
      },
      { rootMargin: `0px 0px ${threshold} 0px` }
    );

    this.infiniteObserver.observe(this.trigger);
  }

  updateCount() {
    const externalResults = getAll(".js-pagination-external-results");

    if (externalResults.length === 0) return;

    const totalItems = get(".js-pagination").dataset.totalItems;

    externalResults.forEach((externalResult) => {
      let resultsText = externalResult.dataset.resultsTextNone;

      if (totalItems == 1) {
        resultsText = externalResult.dataset.resultsTextOne;
      } else if (totalItems > 1) {
        resultsText = externalResult.dataset.resultsTextOther;
      }

      externalResult.textContent = resultsText.replace(
        "{{ count }}",
        totalItems
      );
    });
  }

  paginate() {
    if (this.pagination == null) return Promise.resolve();
    return this.handleTriggerClick();
  }

  async handleTriggerClick() {
    this.pagination = get(".js-pagination"); // Capture latest instance of element.
    const shouldUpdateCurrentAmountViewed = this.text != null;

    this.sectionElement.classList.toggle(`js-pagination-loading`);
    let currentPage = parseInt(this.pagination.dataset.currentPage);

    this.pagination.setAttribute("data-current-page", currentPage + 1);
    currentPage = currentPage + 1;

    const parsedQueryString = new URLSearchParams(window.location.search);
    parsedQueryString.set("page", currentPage);

    await fetch(`${this.initialState.url}?${parsedQueryString}`)
      .then((response) => response.text())
      .then((data) => {
        const fragment = document.createDocumentFragment();
        const parsedHTML = new DOMParser().parseFromString(data, "text/html");
        const parsedListElement = get(".js-paginatable-list", parsedHTML);
        const newElements = getAll(
          this.initialState.itemClassName,
          parsedListElement
        );

        newElements.forEach((item) => {
          fragment.appendChild(item);
        });

        this.listElement.appendChild(fragment);

        if (shouldUpdateCurrentAmountViewed) {
          this.setCurrentAmountViewed();
        }

        this.sectionElement.classList.toggle(`js-pagination-loading`);
      });
  }

  setCurrentAmountViewed() {
    const currentTotal = getAll(".js-paginatable-item", document).length;
    const totalItems = parseInt(
      get(".js-pagination", document).dataset.totalItems
    );

    this.text.innerText = this.initialState.textTemplate
      .replace(`{{ pagination_amount }}`, currentTotal)
      .replace(`{{ total_count }}`, totalItems);

    if (currentTotal === totalItems) {
      this.trigger.disabled = true;
      this.trigger.textContent = this.initialState.buttonTextTemplate;
    } else {
      this.trigger.disabled = false;
      this.trigger.textContent = this.initialState.initialButtonTextTemplate;
    }
  }
}

export { Pagination };
