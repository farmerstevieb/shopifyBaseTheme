import React, { useRef, type ChangeEvent } from "react";
import he from "he";

import { sortOptions } from "../config";
import { useSort } from "../hooks/use-sort";
import Icon from "./elements/icon";

export default function Sort() {
  const { activeSort, setSort } = useSort();
  const selectElRef = useRef<HTMLSelectElement | null>(null);

  const options = sortOptions.map((o) => ({
    value: o.id,
    label: o.value.name,
  }));

  const handleSortChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    setSort(target.value);
  };

  return (
    <label
      className="relative grid w-fit min-w-fit cursor-pointer select-none grid-cols-[auto_auto_auto] gap-x-3"
      onClick={() => selectElRef.current?.showPicker()}
    >
      <span className="flex items-center row-start-1 text-sm font-semibold text-left uppercase tracking-standard text-grey-10 max-sm:whitespace-nowrap">
        {he.decode(window._Nosto.i18n.serp.facets.sort.label)}
      </span>
      <select
        className="o-input__field o-input__field--filter row-start-1 flex w-[calc(100%_+_1rem)] min-w-[14rem] cursor-pointer select-none items-center text-sm uppercase text-grey-10"
        value={activeSort}
        onChange={handleSortChange}
        aria-describedby="a11y-refresh-page-message"
        ref={selectElRef}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none">
        <Icon name="chevron" width="16" height="16" />
      </span>
    </label>
  );
}
