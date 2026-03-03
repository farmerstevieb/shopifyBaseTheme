import React, { useEffect, useState } from "react";
import type { SearchStatsFacet } from "@nosto/nosto-js/client";

import { useAppState } from "../contexts/app-state";

export function useRangeSlider(facet: SearchStatsFacet) {
  const { query, response } = useAppState();

  const [initialRange, setInitialRange] = useState<number[]>([
    facet.min,
    facet.max,
  ]);
  const [min, setMin] = useState(initialRange[0]);
  const [max, setMax] = useState(initialRange[1]);

  let startingRange = [min, max];

  // Get initial range from any price params in the URL
  const priceParams = new URL(location.href).searchParams.get("nst_price");
  if (priceParams) {
    const decodedPriceParams = decodeURIComponent(priceParams);
    const decodedMin = decodedPriceParams.split("+")[0];
    const decodedMax = decodedPriceParams.split("+")[1];

    if (decodedMin && decodedMax) {
      const paramMin = Number(decodedMin);
      const paramMax = Number(decodedMax);
      startingRange = [paramMin, paramMax];
    }
  }

  const [range, setRange] = useState(startingRange);

  const updateRange = (newRange: number[]) => {
    setRange(newRange);
  };

  const resetRange = (facet: SearchStatsFacet) => {
    setInitialRange(initialRange);
    setMin(initialRange[0]);
    setMax(initialRange[1]);
    updateRange(initialRange);
    facet.min = Number(initialRange[0]);
    facet.max = Number(initialRange[1]);
  };

  useEffect(() => {
    const rangeFacet = response.products?.facets?.find(
      (_facet) => _facet.id === facet.id,
    ) as SearchStatsFacet | null;
    if (!rangeFacet) return;

    if (rangeFacet.min !== min || rangeFacet.max !== max) {
      // Only runs when range values are updated in response
      setMin(rangeFacet.min);
      setMax(rangeFacet.max);
      updateRange([rangeFacet.min, rangeFacet.max]);
    }
  }, [response]);

  useEffect(() => {
    // Triggers a reset to the initial value, both in the slider and in the facet object.
    if (facet.min === -1 || facet.max === -1) {
      resetRange(facet);
    }
  }, [facet.min, facet.max]);

  useEffect(() => {
    if (!query) return;

    const queryParam = decodeURIComponent(
      new URL(location.href).searchParams.get("q") ?? "",
    );
    if (queryParam !== query.query) {
      resetRange(facet);
    }
  }, [query?.query, facet]);

  return { min, max, range, updateRange };
}
