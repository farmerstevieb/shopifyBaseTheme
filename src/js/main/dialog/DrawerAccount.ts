import { get, getAll } from "../../utils";

import { Dialog } from "./dialog";

export class DrawerAccount extends Dialog {
  element: this;

  elTriggers: HTMLElement[];
  elTabs: HTMLElement[];
  elTabsContainer: HTMLElement | null;
  activeTab: HTMLElement | undefined;

  constructor() {
    super();

    this.element = this;
    this.elTriggers = getAll("[aria-controls]", this.element);
    this.elTabs = getAll("[aria-expanded]", this.element);
    this.elTabsContainer = get(".js-account-tabs", this.element);
    this.activeTab = this.getActiveTab();
    this.preventKeyTabAction();
  }

  /**
   * Returns the currently active tab.
   *
   * @returns
   */
  getActiveTab() {
    return this.elTabs.find(
      (elTab) => elTab.getAttribute("aria-expanded") === "true"
    );
  }

  /**
   * Place this inside of a onclick attribute on a tab trigger to
   * fire a changeTab event that will display the relevant tab.
   *
   * @param e
   * @returns
   */
  changeTab(e: Event) {
    const elTrigger = e.target as HTMLElement;
    const elTabs = getAll(".js-account-tab", this.element);
    const targetid = elTrigger.getAttribute("aria-controls");
    if (!targetid) return;

    const elTarget = elTabs.find((elTab) => elTab.id === targetid);
    if (!elTarget) return;

    // If the tab the user is clicking is the currently selected tab, return.
    if (targetid === this.activeTab?.id) return;

    this.elTabsContainer?.style.setProperty(
      "--tab-offset",
      `${elTabs.findIndex((elTab) => elTab === elTarget)}`
    );

    this.handleTabClick(targetid, elTarget);
  }

  /**
   * Prevents the action of pressing the tab key from
   * elements in the next account tab from being focused.
   */
  preventKeyTabAction() {
    this.element.addEventListener("keydown", (e) => {
      const focusableElements = getAll(
        "a, button, input, select, textarea, [tabindex]"
      );

      if (!focusableElements.length) return;

      const focusedElement = document.activeElement as HTMLElement;
      if (!focusedElement) return;

      const currentIndex = focusableElements.indexOf(focusedElement);
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      const nextFocusableElement = focusableElements[nextIndex];

      const relevantTab = nextFocusableElement?.closest(".js-account-tab");
      if (relevantTab !== this.activeTab) e.preventDefault();
    });
  }

  /**
   * Handles the finer details of the click event by
   * applying the new status-related data to the tab
   * triggers and their relevant tabs.
   *
   * @param targetid
   * @param elTab
   */
  handleTabClick(targetid: string, elTab: HTMLElement) {
    // Update triggers
    for (const elTrigger of this.elTriggers) {
      if (elTrigger.getAttribute("aria-controls") === targetid) {
        elTrigger.setAttribute("aria-selected", "true");
      } else {
        elTrigger.setAttribute("aria-selected", "false");
      }
    }

    // Update tabs
    elTab.setAttribute("aria-expanded", "true");
    elTab.setAttribute("aria-hidden", "true");
    this.activeTab?.setAttribute("aria-expanded", "false");
    this.activeTab?.setAttribute("aria-hidden", "false");
    this.activeTab = elTab;
  }
}

customElements.define("drawer-account", DrawerAccount);
