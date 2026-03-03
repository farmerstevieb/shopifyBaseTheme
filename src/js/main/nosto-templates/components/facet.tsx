import React, { useEffect, useRef } from "react";
import type { SearchTermsFacet } from "@nosto/nosto-js/client";
import he from "he";

import { useFacet } from "../contexts/facet";
import { scrollTop } from "../tools/scroll-top";
import Checkbox from "./elements/checkbox";
import Icon from "./elements/icon";

type FacetProps = {
  facet: SearchTermsFacet;
  showHeader?: boolean;
};

export default function Facet({ facet, showHeader = true }: FacetProps) {
  const { active, toggleActive, toggleProductFilter, reset } = useFacet(facet);
  const facetEl = useRef<HTMLDetailsElement | null>(null);

  const totalSelectedTerms = facet.data.filter((term) => term.selected).length;
  const selectedText =
    totalSelectedTerms === 1 ?
      he.decode(
        window._Nosto.i18n.serp.facets.filters.selected.one.replace(
          "{{ count }}",
          String(totalSelectedTerms),
        ),
      )
    : he.decode(
        window._Nosto.i18n.serp.facets.filters.selected.other.replace(
          "{{ count }}",
          String(totalSelectedTerms),
        ),
      );

  const closeFacet = (e: MouseEvent) => {
    // Close the facet when the user clicks outside of it on desktop.
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const targetIsFacet = target.closest("[data-facet-id]");
    const targetIsResetButton = Object.hasOwn(target.dataset, "facetReset");
    const isDesktop = window.innerWidth >= 1024;

    if (active && !targetIsFacet && !targetIsResetButton && isDesktop) {
      toggleActive(e);
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", closeFacet);

    return () => {
      document.body.removeEventListener("click", closeFacet);
    };
  }, [active]);

  return (
    <details
      className="relative"
      data-facet-id={facet.id}
      ref={facetEl}
      open={window.innerWidth > 1024 ? active : true}
    >
      <summary
        className={`flex items-center gap-2 max-lg:justify-between lg:cursor-pointer lg:transition-opacity lg:hover:opacity-50 ${active ? "lg:opacity-50" : ""}`}
        onClick={toggleActive}
      >
        <p className="flex select-none gap-x-3 text-xs font-semibold uppercase tracking-standard text-grey-10">
          {facet.name}

          {totalSelectedTerms > 0 ?
            <span className="lg:hidden">({totalSelectedTerms})</span>
          : <></>}
        </p>

        {window.innerWidth <= 1024 && totalSelectedTerms > 0 && (
          <button
            type="button"
            className="text-xs uppercase underline underline-offset-4 hover:no-underline"
            data-facet-reset
            onClick={(e) => {
              e.stopPropagation();
              reset(facet, false, scrollTop);
            }}
          >
            {he.decode(window._Nosto.i18n.serp.facets.filters.selected.reset)}
          </button>
        )}

        {window.innerWidth > 1024 && (
          <Icon
            name="arrow"
            className={active ? "rotate-180" : ""}
            width="16"
            height="16"
          />
        )}
      </summary>

      <div
        className="lg:up-arrow lg:bg-section-bg z-10 lg:absolute lg:left-[calc(100%_-_0.9rem)] lg:top-8 lg:z-10 lg:w-full lg:min-w-[350px] lg:-translate-x-1/2 lg:bg-white lg:shadow-2"
        style={{ "--arrow-color": "var(--bg)" } as React.CSSProperties}
      >
        {showHeader && (
          <header className="flex select-none items-center justify-between border-b border-solid border-border-light py-4 text-sm lg:px-5 lg:text-md">
            <p className="max-w-[30rem]">{selectedText}</p>

            {totalSelectedTerms > 0 ?
              <button
                type="button"
                className="uppercase underline underline-offset-4 hover:no-underline"
                data-facet-reset
                onClick={() => {
                  reset(facet, false, scrollTop);
                }}
              >
                {he.decode(
                  window._Nosto.i18n.serp.facets.filters.selected.reset,
                )}
              </button>
            : <></>}
          </header>
        )}

        <ul className="grid grid-cols-2 gap-3 py-5 lg:max-h-[345px] lg:overflow-auto lg:px-5">
          {facet.data.map((term) => {
            const listItemClasses = {
              cursorClass: term.count === 0 ? "cursor-not-allowed" : "",
            };

            return (
              <li
                className="group cursor-pointer"
                key={`${facet.id}-${term.value}`}
              >
                <div
                  className={`flex w-full flex-col justify-center ${listItemClasses.cursorClass}`}
                >
                  <Checkbox
                    facet={facet}
                    term={term}
                    onChange={() => {
                      toggleProductFilter(facet, term.value, scrollTop);
                    }}
                    disabled={term.count === 0}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
