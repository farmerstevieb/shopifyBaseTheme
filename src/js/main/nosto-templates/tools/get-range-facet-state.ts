import type { SearchFacet } from "@nosto/nosto-js/client";

import { get } from "../../../utils";

export function getRangeFacetState(facet: SearchFacet): {
  initial: { min: number; max: number };
  current: { min: number; max: number };
} {
  const rangeFacet = get(`[data-facet-id="${facet.id}"]`) as HTMLElement | null;
  if (!rangeFacet)
    return {
      initial: {
        min: 0,
        max: 0,
      },
      current: {
        min: 0,
        max: 0,
      },
    };

  const { facetRangeInitial, facetRangeCurrent } = rangeFacet.dataset;

  const initial = facetRangeInitial?.split(",").map(Number) as number[];
  const current = facetRangeCurrent?.split(",").map(Number) as number[];

  return {
    initial: {
      min: initial[0] ?? 0,
      max: initial[1] ?? 0,
    },
    current: {
      min: current[0] ?? 0,
      max: current[1] ?? 0,
    },
  };
}
