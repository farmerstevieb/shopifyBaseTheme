import { debounce, get, rIC } from "../../utils";

const parser = new DOMParser();

export class HelpCenter {
  private elContent = get(".js-help-center-items") as HTMLUListElement;
  private elPagination = get(".js-help-center-pagination") as HTMLDivElement;
  private elReset = get(".js-help-center-reset") as HTMLDivElement;
  private searchQuery = new URLSearchParams();
  private abortController = new AbortController();
  private htmlParse = (html: string) =>
    parser.parseFromString(html, "text/html");

  constructor(private elForm: HTMLFormElement) {
    this.elForm.addEventListener("submit", this.handleFormSubmit);
    this.elForm.addEventListener("reset", this.handleFormReset);
    this.elForm.addEventListener("input", debounce(this.handleFormInput, 250));
    this.elPagination?.addEventListener("click", this.handlePagination);

    this.updateSearchQuery();
  }

  handleFormSubmit = async (event: Event) => {
    event.preventDefault();
    this.updateSearchQuery();
    this.toggleResetButton();
    await this.getSearchResults();
    this.elForm.scrollIntoViewIfNeeded();
  };

  handleFormReset = () => {
    rIC(async () => {
      this.updateSearchQuery();
      this.toggleResetButton();
      await this.getSearchResults();
      this.elForm.scrollIntoViewIfNeeded();
    });
  };

  handleFormInput = async (event: Event) => {
    event.preventDefault();
    this.updateSearchQuery();
    this.toggleResetButton();
    await this.getSearchResults();
    this.elForm.scrollIntoViewIfNeeded();
  };

  handlePagination = async (event: Event) => {
    if (event.target instanceof Element) {
      const anchor = event.target.closest("a");
      if (anchor) {
        event.preventDefault();
        const page = new URLSearchParams(anchor.search).get("page");
        if (page) {
          this.searchQuery.set("page", page);
          await this.getSearchResults();
          this.elContent?.scrollIntoViewIfNeeded();
        }
      }
    }
  };

  updateSearchQuery = () => {
    this.abortController.abort();
    this.abortController = new AbortController();

    const params = new URLSearchParams(new FormData(this.elForm));
    const tag = params.get("tag") ? `+AND+tag:${params.get("tag")}` : "";
    const author =
      params.get("author") ? `+AND+author:${params.get("author")}` : "";
    params.set("q", `${params.get("q")}${tag}${author}`);

    params.delete("tag");
    params.delete("author");

    this.searchQuery = params;
  };

  getSearchResults = async () => {
    const searchParams = this.searchQuery
      .toString()
      .replace(/%3A/g, ":")
      .replace(/%2B/g, "+");

    document.documentElement.classList.add("cursor-progress");
    this.elContent.classList.add("opacity-0");
    this.elPagination.classList.add("opacity-0");

    try {
      const response = await fetch(`${this.elForm.action}?${searchParams}`, {
        signal: this.abortController.signal,
      });
      const parsedHTML = this.htmlParse(await response.text());

      // Update items
      const elNewContent = parsedHTML.querySelector(".js-help-center-items");
      this.elContent.innerHTML = elNewContent?.innerHTML;

      // Update pagination
      const elPagination = parsedHTML.querySelector(
        ".js-help-center-pagination",
      );
      this.elPagination.innerHTML = elPagination?.innerHTML;
    } catch (error) {
      // TODO: Handle error
    } finally {
      document.documentElement.classList.remove("cursor-progress");
      this.elContent.classList.remove("opacity-0");
      this.elPagination.classList.remove("opacity-0");
    }
  };

  toggleResetButton = () => {
    const formData = new FormData(this.elForm);
    this.elReset.hidden = !(formData.get("q") || formData.get("tag"));
  };
}
