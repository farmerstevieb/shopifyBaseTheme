import { get } from "../../../utils";

export function scrollTop() {
  const target =
    get("#nosto-serp-content #data-scroll-top-target") ||
    get("#nosto-category-content #data-scroll-top-target");
  if (!target) return;

  target.scrollIntoView({
    block: "start",
    behavior: "smooth",
  });
}
