import React, { useRef, useState, type ChangeEvent } from "react";
import he from "he";

import { useAppState } from "../contexts/app-state";
import Icon from "./elements/icon";

export default function Input() {
  const {
    initialized,
    loading,
    query,
    updateQuery,
    response: { products },
  } = useAppState();
  const [searchQuery, setSearchQuery] = useState(query?.query ?? "");

  const input = useRef<HTMLInputElement | null>(null);
  const hasProducts = products && products.total > 0;
  const hasFacets = products && products.facets && products.facets.length > 0;

  const handleChange = (e: ChangeEvent) => {
    setSearchQuery((e.target as HTMLInputElement).value);
  };

  const titleClasses = "mb-6 text-6xl tracking-0 text-textPrimary";

  if (initialized) {
    return (
      <div className="text-textPrimary pb-15 pt-12 text-center md:pb-[10.4rem] md:pt-14">
        <div className="text-center">
          {/* No term entered, prompt user to enter one. */}
          {!loading && !query?.query && (
            <h2 className={titleClasses}>
              {query?.query ?
                he
                  .decode(window._Nosto.i18n.serp.results.found)
                  .replace("{{ terms }}", String(query.query))
              : he.decode(window._Nosto.i18n.serp.results.prompt)}
            </h2>
          )}

          {/* Term entered, has products, display input with term used */}
          {(loading || hasProducts || hasFacets) && query?.query && (
            <h2 className={titleClasses}>
              {he
                .decode(window._Nosto.i18n.serp.results.found)
                .replace("{{ terms }}", String(query.query))}
            </h2>
          )}

          {/* Term entered, has no products, display input with prompt to enter new term */}
          {!loading && !hasProducts && !hasFacets && query?.query && (
            <>
              <h2 className={titleClasses}>
                {he
                  .decode(window._Nosto.i18n.serp.results.none.title)
                  .replace("{{ terms }}", String(query.query))}
              </h2>
              <p className="mb-5 text-center">
                {he.decode(window._Nosto.i18n.serp.results.none.text)}
              </p>
            </>
          )}
        </div>

        <div className="overflow-hidden">
          <form
            action="/search"
            className="relative mx-auto my-0 grid w-full max-w-[50.4rem]"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.current) updateQuery(input.current.value);
            }}
          >
            <label className="o-input text-sm" data-field="input">
              <input
                ref={input}
                className="o-input__field o-input__field--search"
                name="q"
                id="nosto-serp-input"
                type="search"
                placeholder={he.decode(
                  window._Nosto.i18n.serp.input.placeholder,
                )}
                onChange={handleChange}
                value={searchQuery}
              />
              <span className="sr-only">
                {he.decode(window._Nosto.i18n.serp.input.accessibility.input)}
              </span>
            </label>
            <input type="hidden" name="type" value="product" />

            <button
              type="submit"
              className="absolute right-0 isolate px-[1.3rem] py-[1.1rem]"
            >
              <Icon name="search" width="14" className="pointer-events-none" />
              <span className="sr-only">
                {he.decode(window._Nosto.i18n.serp.input.accessibility.submit)}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }
}
