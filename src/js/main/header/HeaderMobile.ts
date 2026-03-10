/* eslint-disable no-loop-func */
import { debounce, get, getAll, lock, release } from "../../utils";

export function setup(elHeader: HTMLElement, elNav: HTMLElement) {
  const elOpenButton = get(".js-nav-open", elHeader);
  const elCloseButton = get(".js-nav-close", elHeader);
  const elSubmenus = getAll(".js-submenu", elNav) as HTMLElement[];
  const elNavList = get(".js-nav-list", elNav) as HTMLElement;
  const elCartTrigger = get(".js-header-cart-open", elHeader) as HTMLElement;
  const elOverlay = get(".js-main-overlay") as HTMLElement;

  const openMenu = () => {
    elOpenButton?.classList.add("opacity-0", "pointer-events-none");
    elOpenButton?.setAttribute("aria-expanded", "true");
    elCloseButton?.classList.remove("opacity-0", "pointer-events-none");
    elOverlay?.classList.add("main-overlay--visible");
  };

  const closeMenu = () => {
    closeSubmenus(elSubmenus);

    elCloseButton?.classList.add("opacity-0", "pointer-events-none");
    elOpenButton?.classList.remove("opacity-0", "pointer-events-none");
    elOpenButton?.setAttribute("aria-expanded", "false");
    elOverlay?.classList.remove("main-overlay--visible");
  };

  elCartTrigger?.addEventListener("click", () => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    if (elNav) toggleMobileNavigation(elNav);
    closeMenu();
  });

  elOverlay?.addEventListener("click", () => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    if (elNav) toggleMobileNavigation(elNav);
    closeMenu();
  });

  elOpenButton?.addEventListener("click", () => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    if (elNavList) toggleMobileNavigation(elNavList);
    openMenu();
  });

  elCloseButton?.addEventListener("click", () => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    if (elNavList) toggleMobileNavigation(elNavList);
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      closeSubmenus(elSubmenus);

      release(elNav);
      document.body.classList.remove("util-mobile-nav-open");
      elCloseButton?.classList.add("opacity-0", "pointer-events-none");
      elOpenButton?.classList.remove("opacity-0", "pointer-events-none");
      elOpenButton?.setAttribute("aria-expanded", "false");
      elOverlay?.classList.remove("main-overlay--visible");
    }
  });

  for (const elSubmenu of elSubmenus) {
    const elSubmenuTrigger = get(".js-submenu-open", elSubmenu);
    elSubmenuTrigger?.addEventListener("click", () => {
      if (window.matchMedia("(pointer: fine)").matches) return;
      const isOpen = toggleSubmenu(elSubmenu);
      elSubmenuTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  if (elNavList) handleNavListScroll(elNavList, elNav);
}

async function toggleMobileNavigation(el: HTMLElement) {
  const isOpen = document.body.classList.toggle("util-mobile-nav-open");
  if (isOpen) await lock(el);
  else await release(el);
}

function closeSubmenus(elSubmenus: HTMLElement[]) {
  elSubmenus.forEach((el) => {
    el.classList.remove("has-nav-open");
    const trigger = el.querySelector(".js-submenu-open");
    trigger?.setAttribute("aria-expanded", "false");
  });
}

function toggleSubmenu(el: HTMLElement) {
  const isOpen = el.classList.toggle("has-nav-open");
  return isOpen;
}

function handleNavListScroll(elNavList: HTMLElement, elNav: HTMLElement) {
  const onScroll = debounce(() => {
    elNav.style.setProperty("--nav-offset", `${elNavList.scrollTop}px`);
  }, 64);
  elNavList.addEventListener("scroll", onScroll);
}
