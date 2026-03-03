import React, { useEffect, useState } from "react";
import type {
  SearchStatsFacet,
  SearchTermsFacet,
} from "@nosto/nosto-js/client";
import he from "he";

import { throttle } from "../../../utils";
import { useAppState } from "../contexts/app-state";
import { useFacets } from "../contexts/facets";
import Drawer from "./elements/drawer";
import Icon from "./elements/icon";
import Facet from "./facet";
import RangeFacet from "./range-facet";
import SelectedFilters from "./selected-filters";
import Sort from "./sort";

export default function SideBar() {
  const {
    initialized,
    mobileFacetsDrawerState,
    toggleMobileFacetsDrawerState,
  } = useAppState();
  const { facets, resetAll } = useFacets();
  const {
    request,
    response: { products },
  } = useAppState();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const checkIfMobile = throttle(() => {
    setIsMobile(window.innerWidth < 1024);
  }, 50);

  useEffect(() => {
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const hasActiveFilters = request.filters.length > 0;

  return initialized && facets.length > 0 ?
      <>
        {isMobile && (
          <Drawer
            className="lg:!hidden"
            direction="right"
            title={he.decode(window._Nosto.i18n.serp.facets.dialog.title)}
            additionalTitleContent={
              hasActiveFilters ?
                <button
                  type="button"
                  className="font-heading text-xs font-normal normal-case tracking-0 underline"
                  onClick={() => {
                    resetAll();
                  }}
                >
                  {he.decode(window._Nosto.i18n.serp.facets.clear_all)}
                </button>
              : <></>
            }
            accessibilityTitle={he.decode(
              window._Nosto.i18n.serp.facets.dialog.accessibility.title,
            )}
            accessibilityDescription={he.decode(
              window._Nosto.i18n.serp.facets.dialog.accessibility.description,
            )}
            main={
              <ul>
                {facets.map((facet, index) => {
                  const listItemClasses = `max-lg:border-b max-lg:border-solid max-lg:border-border-light max-lg:pb-5 max-lg:first:pt-0 ${index === 0 ? "" : "pt-6"}`;
                  const listItemId = `${facet.id}-mobile`;

                  switch (facet.type) {
                    case "terms": {
                      return (
                        <li className={listItemClasses} key={listItemId}>
                          <Facet
                            facet={facet as SearchTermsFacet}
                            showHeader={false}
                          />
                        </li>
                      );
                    }
                    case "stats": {
                      return (
                        <li className={listItemClasses} key={listItemId}>
                          <RangeFacet
                            facet={facet as SearchStatsFacet}
                            showHeader={false}
                          />
                        </li>
                      );
                    }
                  }
                })}
              </ul>
            }
            footer={
              <button
                className="button button--primary button--full"
                type="button"
                tabIndex={-1}
                data-dialog-element="close"
                data-a11y-dialog-hide
              >
                {he.decode(window._Nosto.i18n.serp.facets.apply_filters)}
              </button>
            }
          />
        )}

        <div
          className="sticky top-[var(--header-height)] z-10 -ml-row w-[calc(100%+(var(--row-space)*2))] border-y border-solid border-grey-95 bg-white py-2 lg:py-[21px]"
          data-scroll-top-target
        >
          <div className="flex items-center justify-between px-row lg:justify-between lg:gap-x-4">
            <button
              className="select-none items-center gap-2 py-4 text-sm font-semibold uppercase tracking-standard lg:hidden"
              type="button"
              onClick={() => {
                toggleMobileFacetsDrawerState(!mobileFacetsDrawerState);
              }}
              data-dialog-element="close"
              data-a11y-dialog-hide
            >
              <Icon name="filter" width="18" height="18" />

              {he.decode(window._Nosto.i18n.serp.facets.dialog.title)}
            </button>

            {!isMobile && (
              <ul className="flex flex-grow flex-wrap items-center justify-start gap-x-[2.6rem] gap-y-4 max-lg:hidden">
                {facets.map((facet) => {
                  const listItemId = `${facet.id}-desktop`;

                  switch (facet.type) {
                    case "terms": {
                      return (
                        <li key={listItemId}>
                          <Facet facet={facet as SearchTermsFacet} />
                        </li>
                      );
                    }
                    case "stats": {
                      return (
                        <li key={listItemId}>
                          <RangeFacet facet={facet as SearchStatsFacet} />
                        </li>
                      );
                    }
                  }
                })}
              </ul>
            )}

            <p className="min-w-fit text-sm font-semibold uppercase tracking-standard max-lg:hidden">
              {he.decode(
                window._Nosto.i18n.pagination.results.replace(
                  "{{ number }}",
                  products.total,
                ),
              )}
            </p>

            <Sort />
          </div>

          <SelectedFilters />
        </div>
      </>
    : "";
}
