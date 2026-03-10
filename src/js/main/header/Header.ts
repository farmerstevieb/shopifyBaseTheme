import { debounce, get, getAll, lock, release, throttle } from "../../utils";
import { setup as setupMobileMenu } from "./HeaderMobile";

export class Header {
  elNav: HTMLElement;
  elSearch: HTMLElement;
  elSearchClose: HTMLElement;
  elSearchOpen: HTMLElement;
  elSearchInput: HTMLElement;
  elSubmenus: HTMLElement[];
  elGlobalOverlay: HTMLElement;
  dropdown: HTMLElement;

  /* Data */
  headerHeight: number;
  promoBarHeight: number;

  constructor(public elHeader: HTMLElement) {
    this.elNav = get(".js-header-nav", elHeader) as HTMLElement;
    this.elSearchOpen = get(".js-header-search-open", elHeader) as HTMLElement;
    this.elSearchInput = get(
      ".js-header-search-input",
      elHeader,
    ) as HTMLElement;
    this.elSearchClose = get(
      ".js-header-search-close",
      elHeader,
    ) as HTMLElement;
    this.elSearch = get(".js-header-search", elHeader) as HTMLElement;
    this.elSubmenus = getAll(".js-submenu", elHeader);
    this.elGlobalOverlay = get(".js-search-overlay") as HTMLElement;
    this.dropdown = get(".js-nst-predictive-search-status") as HTMLElement;

    /* Data */
    this.headerHeight = 0;
    this.promoBarHeight = 0;

    setupMobileMenu(this.elHeader, this.elNav);
    this.handleHeader();
    this.handleNavigation();
    this.handlePromoBar();
    this.handleSearch();
    this.handleHeaderGroup();
    this.setHeaderOffset();
  }

  handleHeaderGroup = () => {
    document.documentElement.style.setProperty(
      "--header-group-height",
      "calc(var(--header-height) + var(--promo-bar-height))",
    );
  };

  /**
   * Sets global header height variable
   */
  handleHeader = () => {
    this.headerHeight = this.elHeader.clientHeight;
    document.documentElement.style.setProperty(
      "--header-height",
      `${this.headerHeight}px`,
    );

    window.addEventListener(
      "resize",
      debounce(() => {
        // Wait for header to transition.
        setTimeout(() => {
          this.headerHeight = this.elHeader.clientHeight;

          document.documentElement.style.setProperty(
            "--header-height",
            `${this.headerHeight}px`,
          );
        }, 500);
      }),
    );
  };

  /**
   * Applies height variables to the html element for usage globally.
   *
   * @param height
   */
  setPredictiveSearchInputHeight(height: number) {
    document.documentElement.style.setProperty(
      "--predictive-search-input-height",
      `${height}px`,
    );
  }

  /**
   * Opens the global predictive search utility
   */
  openSearch() {
    this.elSearchOpen.classList.add("opacity-0", "pointer-events-none");
    this.elSearchOpen.setAttribute("aria-hidden", "true");

    this.elSearchClose.classList.remove("opacity-0", "pointer-events-none");
    this.elSearchClose.setAttribute("aria-hidden", "false");

    this.elSearch.classList.add("header__search--active");
    this.elSearchInput.style.visibility = "visible";
    this.elSearchInput.focus();

    void lock(this.dropdown);

    this.setPredictiveSearchInputHeight(68);

    this.elGlobalOverlay.classList.add("main-overlay--visible");

    this.elGlobalOverlay.addEventListener(
      "click",
      () => {
        if (this.elSearch.classList.contains("header__search--active"))
          this.closeSearch();
      },
      {
        once: true,
      },
    );
  }

  /**
   * Closes the global predictive search utility
   */
  closeSearch() {
    this.elSearchOpen.classList.remove("opacity-0", "pointer-events-none");
    this.elSearchOpen.setAttribute("aria-hidden", "false");

    this.elSearchClose.classList.add("opacity-0", "pointer-events-none");
    this.elSearchClose.setAttribute("aria-hidden", "true");

    this.elSearch.classList.remove("header__search--active");

    void release(this.dropdown);

    this.setPredictiveSearchInputHeight(0);

    this.elGlobalOverlay.classList.remove("main-overlay--visible");
  }

  /**
   * Displays and hides the search utility
   */
  handleSearch = () => {
    this.elSearchOpen.addEventListener("click", () => {
      this.openSearch();
    });
    this.elSearchClose.addEventListener("click", () => {
      this.closeSearch();
    });
  };

  /**
   * Sets global header height variable
   *
   * @returns
   */
  handlePromoBar = () => {
    const elPromoBar = get(".js-promo-bar");
    if (!elPromoBar) return;

    this.promoBarHeight = elPromoBar.clientHeight;

    document.documentElement.style.setProperty(
      "--promo-bar-height",
      `${this.promoBarHeight}px`,
    );

    window.addEventListener(
      "resize",
      debounce(() => {
        this.promoBarHeight = elPromoBar.clientHeight;

        document.documentElement.style.setProperty(
          "--promo-bar-height",
          `${this.promoBarHeight}px`,
        );
      }),
    );
  };

  /** Offsets the header and progressively hides it when going down the page */
  setHeaderOffset() {
    let state = "visible";
    const offset = this.elHeader.clientHeight * 2;

    document.documentElement.style.setProperty("--header-offset", "0px");

    const onScroll = throttle(() => {
      // Toggle scrolled class for colour-state changes (e.g. dark → white)
      if (scrollY > 10) {
        this.elHeader.classList.add("header--scrolled");
      } else {
        this.elHeader.classList.remove("header--scrolled");
      }

      if (scrollY > offset) {
        if (state == "hidden") return;
        document.documentElement.style.setProperty(
          "--header-offset",
          `-${this.promoBarHeight}px`,
        );
      } else {
        if (state == "visible") return;
        document.documentElement.style.setProperty("--header-offset", "0px");
      }

      state = scrollY > offset ? "hidden" : "visible";
    }, 16);

    window.addEventListener("scroll", onScroll);
  }

  /**
   * Ensures the global mask shows when a navigation megamenu is triggered
   */
  handleNavigation() {
    for (const submenu of this.elSubmenus) {
      const trigger = submenu.querySelector(".js-submenu-open") as HTMLElement | null;

      submenu.addEventListener("mouseover", () => {
        if (window.innerWidth > 1024) {
          this.elGlobalOverlay.classList.add("main-overlay--visible");
          trigger?.setAttribute("aria-expanded", "true");
        }

        if (this.elSearch.classList.contains("header__search--active"))
          this.closeSearch();
      });

      submenu.addEventListener("mouseout", () => {
        if (
          window.innerWidth > 1024 &&
          !this.elSearch.classList.contains("header__search--active")
        ) {
          this.elGlobalOverlay.classList.remove("main-overlay--visible");
          trigger?.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
}
