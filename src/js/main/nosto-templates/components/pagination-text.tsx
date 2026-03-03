import React from "react";
import he from "he";

import { useAppState } from "../contexts/app-state";
import { usePagination } from "../hooks/use-pagination";
import { scrollTop } from "../tools/scroll-top";
import Icon from "./elements/icon";

// Function to generate the pages to display based on current page
const generatePaginationPages = (current: number, totalPages: number) => {
  const maxVisiblePages = 5; // Define how many pages you want to display
  const pages = [];

  if (totalPages <= maxVisiblePages) {
    // If total pages are fewer than maxVisiblePages, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const leftLimit = Math.max(1, current - 2); // 2 pages before the current
    const rightLimit = Math.min(totalPages, current + 2); // 2 pages after the current

    // Add the first page and ellipsis if needed
    if (leftLimit > 1) {
      pages.push(1);
      if (leftLimit > 2) pages.push("...");
    }

    // Add pages around the current page
    for (let i = leftLimit; i <= rightLimit; i++) {
      pages.push(i);
    }

    // Add the last page and ellipsis if needed
    if (rightLimit < totalPages) {
      if (rightLimit < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
  }

  return pages;
};

const directionalLIClasses = (canProgress: boolean) =>
  `${canProgress ? "" : "cursor-not-allowed opacity-20"} flex transition-opacity`;

const directionalButtonClasses = (canProgress: boolean) =>
  `inline-flex items-center justify-center px-3 py-[6px] hover:text-white md:px-4 ${canProgress ? "" : "pointer-events-none"}`;

export default function PaginationText() {
  const { request, updateRequest, paginationSettings } = useAppState();
  const { current, first, last, totalPages } = usePagination();

  const handlePageChange = (pageNumber: string) => {
    scrollTop();

    const newFrom = paginationSettings.amount * (Number(pageNumber) - 1);

    updateRequest(
      request.filters,
      request.sort,
      paginationSettings.amount,
      newFrom,
      (res) => {
        if (!res.products) return;

        const { from } = res.products;
        if (!from) return;

        const newCurrentPage = Math.floor(from / paginationSettings.amount) + 1;

        // Set the page parameter on the URL
        const currentUrl = new URL(location.href);
        currentUrl.searchParams.set("page", String(newCurrentPage));
        window.history.pushState({}, "", currentUrl);
      },
    );
  };

  const anotherPageButton = (pageNumber: string) => {
    return pageNumber === "..." ?
        <span className="inline-flex items-center justify-center px-3 py-[6px] xs:px-5">
          …
        </span>
      : <button
          type="button"
          className="inline-flex items-center justify-center px-3 py-[4px] text-smd text-grey-35 hover:bg-grey-10 hover:text-white xs:px-7"
          aria-label={he
            .decode(window._Nosto.i18n.pagination.text.page.go_to)
            .replace("{{ number }}", pageNumber)}
          onClick={() => {
            handlePageChange(pageNumber);
          }}
        >
          {pageNumber}
        </button>;
  };

  const currentPageButton = (pageNumber: string) => (
    <button
      type="button"
      aria-disabled="true"
      disabled
      className="inline-flex items-center justify-center bg-grey-20 px-3 py-[6px] text-smd font-semibold text-white hover:bg-grey-10 hover:text-white xs:px-7"
      aria-current="page"
      aria-label={he
        .decode(window._Nosto.i18n.pagination.text.page.current)
        .replace("{{ number }}", pageNumber)}
    >
      {pageNumber}
    </button>
  );

  // Generate the pages to display
  const visiblePages = generatePaginationPages(current, totalPages);

  return (
    <div className="group pb-10 pt-8 text-center">
      <div className="relative mx-auto w-fit">
        <nav
          className="text-sm"
          role="navigation"
          aria-label={he.decode(window._Nosto.i18n.pagination.text.label)}
        >
          <ul
            className="flex flex-wrap justify-center space-x-[-1px]"
            role="list"
          >
            <li
              className={directionalLIClasses(current !== first)}
              key="pagination-previous"
            >
              <button
                type="button"
                className={directionalButtonClasses(current !== first)}
                aria-label={he.decode(
                  window._Nosto.i18n.pagination.text.previous,
                )}
                onClick={() => {
                  if (current !== first) handlePageChange(String(current - 1));
                }}
              >
                <Icon name="chevron" className="rotate-90" />
              </button>
            </li>

            {visiblePages.map((pageNumber, index) => (
              <li
                className="flex border border-border-light"
                key={`pagination-page-${index}`}
              >
                {pageNumber === current ?
                  <>{currentPageButton(String(pageNumber))}</>
                : <>{anotherPageButton(String(pageNumber))}</>}
              </li>
            ))}

            <li
              className={directionalLIClasses(current !== last)}
              key="pagination-next"
            >
              <button
                type="button"
                className={directionalButtonClasses(current !== last)}
                aria-label={he.decode(window._Nosto.i18n.pagination.text.next)}
                onClick={() => {
                  if (current !== last) handlePageChange(String(current + 1));
                }}
              >
                <Icon name="chevron" className="-rotate-90" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
