import React from "react";

import { useAppState } from "../contexts/app-state";
import { useFacets } from "../contexts/facets";
import Loader from "./elements/loader";
import NoResults from "./no-results";
import PaginationDynamic from "./pagination-dynamic";
import PaginationText from "./pagination-text";
import Products from "./products";
import Sidebar from "./sidebar";

export default function Category() {
  const {
    response: { products },
    loading,
    initialized,
    paginationSettings,
  } = useAppState();
  const { facets } = useFacets();

  const hasProducts = products && products.total > 0;
  const hasFacets = facets.length > 0;

  return (
    <>
      <div
        className="absolute inset-0 z-1 w-full transition-opacity"
        style={{
          minHeight: "calc(100dvh - var(--header-group-height, 11.2rem)",
          opacity: loading ? "1" : "0",
          pointerEvents: loading ? "all" : "none",
        }}
      >
        <Loader stroke="var(--c-highlight)" />
      </div>

      <div
        className="hidden w-full animate-fade-in transition-opacity duration-500 will-change-auto"
        style={{
          display: initialized ? "hidden" : "block",
          opacity: loading ? "0.3" : "1",
          minHeight:
            loading ? "calc(100dvh - var(--header-group-height, 11.2rem)" : "",
        }}
      >
        <Sidebar />

        <div className="animate-fade-in">
          <div className="pt-9 lg:pt-14">
            {hasProducts && (
              <>
                <Products />
                {paginationSettings.type === "dynamic" ?
                  <PaginationDynamic />
                : <PaginationText />}
              </>
            )}

            {!loading && !hasProducts && hasFacets && <NoResults />}
          </div>
        </div>
      </div>
    </>
  );
}
