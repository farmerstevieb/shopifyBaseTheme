import React from "react";

import { formatMoney } from "../../../utils/shopify";
import { useAppState } from "../contexts/app-state";
import SelectedFilter from "./selected-filter";

export default function SelectedFilters() {
  const { request } = useAppState();

  return (
    request.filters.length > 0 && (
      <div className="border-t border-solid border-border-light px-row pt-2 lg:mt-5 lg:pt-[2.1rem]">
        <ul className="flex flex-wrap gap-3">
          {request.filters.map((filter) => {
            // For each filter, we need to display its value
            const isArray = Array.isArray(filter.value);

            // If the filter is an array, we'll map over the values and create separate items for each.
            const filterValues = isArray ? filter.value : [filter.value];

            return filterValues?.map((value, index) => {
              let key = `active-filter--${filter.field}-${String(value)}`;

              if (filter.range) {
                const min = formatMoney({
                  cents: Number(filter.range[0]?.gt) * 100,
                });
                const max = formatMoney({
                  cents: Number(filter.range[0]?.lt) * 100,
                });

                value = `${min} - ${max}`;
                key = `active-filter--${filter.field}`;
              }

              return (
                <SelectedFilter
                  key={key}
                  id={`${key}-${index}`}
                  filter={filter}
                  value={value}
                />
              );
            });
          })}
        </ul>
      </div>
    )
  );
}
