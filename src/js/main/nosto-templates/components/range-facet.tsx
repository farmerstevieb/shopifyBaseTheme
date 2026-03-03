import React, { useEffect, useRef } from "react";
import type { SearchStatsFacet } from "@nosto/nosto-js/client";
import he from "he";

import { formatMoney } from "../../../utils/shopify";
import { useFacet } from "../contexts/facet";
import { useRangeSlider } from "../hooks/use-range-slider";
import { scrollTop } from "../tools/scroll-top";
import Icon from "./elements/icon";
import RangeSlider from "./elements/range-slider";

type RangeFacetProps = {
  facet: SearchStatsFacet;
  showHeader?: boolean;
};

export default function RangeFacet({
  facet,
  showHeader = true,
}: RangeFacetProps) {
  const { active, toggleActive, toggleProductFilter, reset } = useFacet(facet);
  const { min, max, range, updateRange } = useRangeSlider(facet);
  const facetEl = useRef<HTMLDetailsElement | null>(null);

  const currentMin = Number(range[0]);
  const currentMax = Number(range[1]);
  const currentMinMoney = formatMoney({ cents: currentMin * 100 });
  const currentMaxMoney = formatMoney({ cents: currentMax * 100 });

  const rangeAltered = currentMin !== min || currentMax !== max;

  const selectedText = he.decode(
    window._Nosto.i18n.serp.facets.filters.selected.price
      .replace("{{ min }}", currentMinMoney)
      .replace("{{ max }}", currentMaxMoney),
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
      open={active}
      data-facet-id={facet.id}
      data-facet-range-initial={[min, max]}
      data-facet-range-current={range}
      ref={facetEl}
    >
      <summary
        className={`flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-50 max-lg:justify-between ${active ? "lg:opacity-50" : ""}`}
        onClick={toggleActive}
      >
        <p className="flex select-none gap-x-3 text-xs font-semibold uppercase tracking-standard text-grey-10">
          {facet.name}

          {rangeAltered ?
            <span className="lg:hidden">
              ({currentMinMoney} - {currentMaxMoney})
            </span>
          : <></>}
        </p>

        <Icon
          name="arrow"
          className={active ? "rotate-180" : ""}
          width="16"
          height="16"
        />
      </summary>

      <div
        className="lg:up-arrow lg:bg-section-bg z-10 lg:absolute lg:left-[calc(100%_-_0.9rem)] lg:top-8 lg:z-10 lg:w-full lg:min-w-[350px] lg:-translate-x-1/2 lg:bg-white lg:shadow-2"
        style={{ "--arrow-color": "var(--bg)" } as React.CSSProperties}
      >
        {showHeader && (
          <header className="flex select-none items-center justify-between border-b border-solid border-border-light py-4 text-sm lg:px-5 lg:text-md">
            <p className="max-w-[30rem]">{selectedText}</p>

            {rangeAltered ?
              <button
                type="button"
                className="uppercase underline underline-offset-4 hover:no-underline"
                data-facet-reset
                onClick={() => {
                  const resetRange = [min, max] as number[];
                  reset(facet, false, scrollTop);
                  updateRange(resetRange);
                }}
              >
                {he.decode(
                  window._Nosto.i18n.serp.facets.filters.selected.reset,
                )}
              </button>
            : <></>}
          </header>
        )}

        <div
          className="pb-5 pt-9 lg:max-h-[345px] lg:px-5"
          style={{
            pointerEvents: min === max ? "none" : "auto",
          }}
        >
          <RangeSlider
            onValueChange={updateRange}
            onValueCommit={() => {
              if (rangeAltered) {
                // Only update if the range is altered
                toggleProductFilter(facet, undefined, scrollTop);
              } else {
                // If it isn't altered, remove the range filter info from the request
                reset(facet, false, scrollTop);
              }
            }}
            min={min}
            max={max}
            currentMin={currentMin}
            currentMax={currentMax}
          />
        </div>
      </div>
    </details>
  );
}
