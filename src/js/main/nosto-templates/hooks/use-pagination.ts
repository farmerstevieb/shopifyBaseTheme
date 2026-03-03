import React, { useEffect, useState } from "react";

import { useAppState } from "../contexts/app-state";

export function usePagination() {
  const {
    response: { products },
    loading,
    paginationSettings,
  } = useAppState();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [resultsFrom, setResultsFrom] = useState<number>(0);
  const [resultsTo, setResultsTo] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [prev, setPrev] = useState<number>(0);
  const [next, setNext] = useState<number>(0);
  const [first, setFirst] = useState<number>(0);
  const [last, setLast] = useState<number>(0);
  const [pages, setPages] = useState<number[]>([]);

  useEffect(() => {
    if (loading) return;

    const size = Number(paginationSettings.amount);
    const from = products?.from ?? 0;
    const totalProducts = Number(products?.total);
    const totalPages = Math.ceil(totalProducts / size);

    let currentPage;
    // eslint-disable-next-line unicorn/prefer-ternary
    if (paginationSettings.type === "dynamic") {
      // Determine the current page based on the 'size' value
      currentPage = Math.floor(Number(products?.size) / size);
    } else {
      // Determine the current page based on the 'from' value
      currentPage = Math.floor(from / size) + 1;
    }

    setTotalPages(totalPages);
    setResultsFrom(from);
    setResultsTo(Math.min(currentPage * size, totalProducts));

    setPages(Array.from({ length: totalPages }, (_, index) => index + 1));

    // Update prev, current, next, first, last pages based on calculated currentPage
    setPrev(Math.max(currentPage - 1, 1)); // Ensure prev page is at least 1
    setCurrent(currentPage);
    setNext(Math.min(currentPage + 1, totalPages)); // Ensure next page does not exceed totalPages

    setFirst(1);
    setLast(totalPages);
  }, [products]);

  return {
    totalPages,
    resultsFrom,
    resultsTo,
    current,
    prev,
    next,
    first,
    last,
    pages,
  };
}
