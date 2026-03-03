import React, { type ChangeEvent } from "react";
import type { SearchFacet, SearchFacetTerm } from "@nosto/nosto-js/client";

import { handleize } from "../../../../utils/handleize";
import { rcn } from "../../tools/react-class-name";

type CheckboxProps = {
  facet: SearchFacet;
  term: SearchFacetTerm;
  disabled: boolean;
  onChange: (e: ChangeEvent) => void;
  className?: string;
};

export default function Checkbox({
  facet,
  term,
  onChange,
  className,
  disabled,
}: CheckboxProps) {
  const input = (className?: string) => (
    <input
      className={`o-input__checkbox${rcn(className)} ${disabled ? "o-input--disabled" : ""}`}
      type="checkbox"
      name={`${facet.id}-${handleize(term.value)}`}
      value={term.value}
      id={`${facet.id}-${handleize(term.value)}`}
      checked={term.selected}
      onChange={onChange}
    />
  );

  const title = () => <span className="text-sm select-none">{term.value}</span>;

  const isColorSwatch =
    handleize(facet.name).includes("color") ||
    handleize(facet.name).includes("colour");

  const labelClasses = {
    isActiveClass: term.selected ? "is-active" : "",
    colorSwatchInputClass: isColorSwatch ? "o-input--swatch" : "",
    statusClass:
      term.count === 0 && !term.selected ?
        "o-input--disabled"
      : "group-hover:border-grey-10",
  };

  const classes = [
    labelClasses.colorSwatchInputClass,
    labelClasses.isActiveClass,
    labelClasses.statusClass,
    className,
  ].join(" ");

  return (
    <label className={`o-input o-input--wrap ${classes}`}>
      {isColorSwatch ?
        <>
          <div
            className="o-input__color"
            data-swatch={term.value
              .toLowerCase()
              .replaceAll(" ", "_")
              .replaceAll("-", "_")
              .replaceAll("/", "_")
              .replaceAll("+", "_")}
          ></div>

          {title()}
          {input("o-input__checkbox--swatch")}
        </>
      : <>
          {input()}
          {title()}
        </>
      }
    </label>
  );
}
