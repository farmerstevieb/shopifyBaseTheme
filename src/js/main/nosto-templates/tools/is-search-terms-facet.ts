import type { SearchFacet, SearchTermsFacet } from "@nosto/nosto-js/client";

export function isSearchTermsFacet(
  facet: SearchFacet,
): facet is SearchTermsFacet {
  return facet.type === "terms";
}
