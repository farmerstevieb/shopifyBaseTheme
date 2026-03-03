import React from "react";
import type { InputSearchTopLevelFilter } from "@nosto/nosto-js/client";
import he from "he";

import { useFacet } from "../contexts/facet";
import { useFacets } from "../contexts/facets";
import { isSearchTermsFacet } from "../tools/is-search-terms-facet";
import { scrollTop } from "../tools/scroll-top";
import Icon from "./elements/icon";

type SelectedFilterProps = {
  id: string;
  filter: InputSearchTopLevelFilter;
  value: string | string[] | undefined;
};

export default function SelectedFilter({
  id,
  filter,
  value,
}: SelectedFilterProps) {
  const { facets } = useFacets();
  const facet = facets.find((facet) => facet.field === filter.field);
  if (!facet) return;

  const { toggleProductFilter, reset } = useFacet(facet);

  return (
    <li
      key={id} // Add index to differentiate if there are multiple values for the same filter
      className="inline-flex min-w-max cursor-pointer select-none items-center gap-x-1 rounded-[50px] border px-[14px] py-[6px] text-xs font-semibold uppercase transition-colors hover:border-grey-10 hover:bg-grey-100"
      onClick={() => {
        if (isSearchTermsFacet(facet)) {
          toggleProductFilter(facet, value, scrollTop);
        } else {
          reset(facet, false, scrollTop);
        }
      }}
    >
      <span>{value}</span>

      <Icon name="close" width="14" height="14" />
      <span className="sr-only">
        {he.decode(window._Nosto.i18n.serp.facets.filters.terms.remove)}
      </span>
    </li>
  );
}
