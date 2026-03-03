import { getAll } from "../../utils";

export function setup(element: HTMLElement) {
  const elTriggers = getAll("[aria-controls]", element);
  const elTabs = getAll("[aria-expanded]");

  let activeTab = elTabs.find(
    (elTab) => elTab.getAttribute("aria-expanded") === "true",
  );

  for (const elTrigger of elTriggers) {
    elTrigger.addEventListener("click", () => {
      const targetid = elTrigger.getAttribute("aria-controls");
      if (!targetid) return;
      const elTarget = elTabs.find((elTab) => elTab.id === targetid);
      if (!elTarget) return;

      element.style.setProperty(
        "--tab-offset",
        `${elTabs.indexOf(elTarget) - 1}`,
      );

      handleTabClick(targetid, elTarget);
    });
  }

  function handleTabClick(targetid: string, elTab: HTMLElement) {
    // Update triggers
    for (const elTrigger of elTriggers) {
      if (elTrigger.getAttribute("aria-controls") === targetid) {
        elTrigger.setAttribute("aria-selected", "true");
      } else {
        elTrigger.setAttribute("aria-selected", "false");
      }
    }

    // Update tabs
    elTab.setAttribute("aria-expanded", "true");
    elTab.setAttribute("aria-hidden", "true");
    activeTab?.setAttribute("aria-expanded", "false");
    activeTab?.setAttribute("aria-hidden", "false");
    activeTab = elTab;
  }
}
