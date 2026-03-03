import React, { useEffect, useRef, useState } from "react";
import type { SearchSortOrder } from "@nosto/nosto-js/client";

import { defaultConfig, sortOptions } from "../config";
import { useAppState } from "../contexts/app-state";

const getSortFromURL = () => {
  const url = new URL(location.href);
  let field;

  if (url.searchParams.get("nst_sort")) {
    const decodedParam = decodeURIComponent(
      String(url.searchParams.get("nst_sort")),
    );

    const key = decodedParam.split("+")[0] as string;
    const value = decodedParam.split("+")[1] as SearchSortOrder;

    field = `${value === "desc" ? "-" : ""}${key}`;
  }

  return field;
};

export function useSort() {
  const { request } = useAppState();

  const urlSortParams = getSortFromURL();
  const [activeSort, setSort] = useState(
    urlSortParams ?? defaultConfig.sort.id,
  );
  const { updateRequest, paginationSettings } = useAppState();

  const prevSortRef = useRef(defaultConfig.sort.id);

  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("nst_sort")) {
      const decodedParam = decodeURIComponent(
        String(url.searchParams.get("nst_sort")),
      );

      const key = decodedParam.split("+")[0] as string;
      const value = decodedParam.split("+")[1] as SearchSortOrder;

      const field = `${value === "desc" ? "-" : ""}${key}`;
      prevSortRef.current = field;
      setSort(field);
    }
  }, []);

  useEffect(() => {
    // Compare the current activeSort to the previous one
    if (prevSortRef.current !== activeSort) {
      const newSortOption = sortOptions.find(
        (sortOption) => sortOption.id === activeSort,
      );
      if (!newSortOption) return;
      updateRequest(
        request.filters,
        newSortOption.value.sortRequest,
        paginationSettings.amount,
      );

      // Update the ref with the current activeSort
      prevSortRef.current = activeSort;
    }
  }, [activeSort, request.filters, updateRequest]);

  return { activeSort, setSort };
}
