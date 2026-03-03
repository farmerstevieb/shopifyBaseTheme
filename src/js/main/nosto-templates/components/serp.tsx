import React, { useEffect } from "react";
import he from "he";

import { get } from "../../../utils";
import { useAppState } from "../contexts/app-state";
import Loader from "./elements/loader";
import Input from "./input";
import NoResults from "./no-results";
import PaginationDynamic from "./pagination-dynamic";
import PaginationText from "./pagination-text";
import Products from "./products";
import Sidebar from "./sidebar";

export default function Serp() {
  const {
    response: { products },
    loading,
    initialized,
    query,
    paginationSettings,
  } = useAppState();

  // Handle SERP Breadcrumbs
  // Handle SERP Breadcrumbs
  useEffect(() => {
    const breadcrumbs = get(
      '.shopify-section--breadcrumbs nav li:last-child [itemprop="name"]',
    );
    if (!breadcrumbs) return;

    breadcrumbs.textContent =
      query?.query ?
        he
          .decode(window._Nosto.i18n.serp.breadcrumbs.search_for)
          .replace("{{ terms }}", String(query.query))
      : he.decode(window._Nosto.i18n.serp.breadcrumbs.prompt);
  }, [query?.query]);

  const hasProducts = products && products.total > 0;
  const hasFacets = products && products.facets && products.facets.length > 0;

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
        <Input />
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
