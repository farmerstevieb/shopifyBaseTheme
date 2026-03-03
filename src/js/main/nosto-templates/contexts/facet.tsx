import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type {
  InputSearchTopLevelFilter,
  SearchFacet,
} from "@nosto/nosto-js/client";

import { handleize } from "../../../utils/handleize";
import { getRangeFacetState } from "../tools/get-range-facet-state";
import { isSearchTermsFacet } from "../tools/is-search-terms-facet";
import { useAppState } from "./app-state";

export type FacetContextType = {
  [facetKey: string]: {
    active: boolean;
    selectedFiltersCount: number;
    toggleActive: (e?: MouseEvent) => void;
    toggleProductFilter: (
      facet: SearchFacet,
      selectedTermValue?: string | string[],
      callback?: () => void,
    ) => void;
    reset: (
      facet: SearchFacet,
      closeFacet: boolean,
      callback?: () => void,
    ) => void;
  };
};

export type FilterType = {
  field: string;
  value: string;
  active: boolean;
};

type FacetState = {
  [key: string]: {
    active: boolean;
    selectedFiltersCount: number;
  };
};

type Action =
  | { type: "TOGGLE_FACET_ACTIVE"; facetKey: string }
  | {
      type: "TOGGLE_PRODUCT_FILTER";
      facet: SearchFacet;
      selectedTermValue?: string | string[];
    }
  | { type: "RESET_FACET"; facet: SearchFacet };

const FacetContext = createContext<FacetContextType>({});

export function useFacet(facet: SearchFacet) {
  // Assuming each facet has a unique identifier (e.g., facet.name or facet.id)
  const facetKey = `${facet.id}-${handleize(facet.name)}`; // Use a unique key for each facet
  const context = useContext(FacetContext);

  if (!context[facetKey]) {
    throw new Error(`Facet with key "${facetKey}" not found in context`);
  }

  return context[facetKey];
}

const facetReducer = (state: FacetState, action: Action): FacetState => {
  switch (action.type) {
    case "TOGGLE_FACET_ACTIVE": {
      // Don't return the previous state, as we only want one facet open at a time.
      return {
        [action.facetKey]: {
          ...state[action.facetKey],
          active: !state[action.facetKey]?.active,
        },
      };
    }
    case "TOGGLE_PRODUCT_FILTER": {
      // Set the selectedFiltersCount on the facetState.
      const updatedState = { ...state };
      const facetKey = `${action.facet.id}-${handleize(action.facet.name)}`;
      let selectedFiltersCount;

      if (isSearchTermsFacet(action.facet)) {
        /**
         * If it's a facet of the type SearchTermsFacet, then we
         * return the amount of terms with a true selected value.
         */
        selectedFiltersCount = action.facet.data.filter(
          (term) => term.selected,
        ).length;
      } else {
        const rfs = getRangeFacetState(action.facet);
        /**
         * If it's a facet of the type SearchStatsFacet, then we
         * return a 1 value if the range has been altered, and 0
         * if it hasn't.
         */
        selectedFiltersCount =
          (
            action.facet.min !== rfs.current.min ||
            action.facet.max !== rfs.current.max
          ) ?
            1
          : 0;
      }

      updatedState[facetKey] = {
        active: updatedState[facetKey]?.active ?? false,
        selectedFiltersCount,
      };

      return updatedState;
    }
    case "RESET_FACET": {
      const updatedState = { ...state };
      const facetKey = `${action.facet.id}-${handleize(action.facet.name)}`;
      updatedState[facetKey] = {
        active: false,
        selectedFiltersCount: 0,
      };
      return updatedState;
    }
    default: {
      return state;
    }
  }
};

type FacetProviderProps = {
  facets: SearchFacet[];
  children: ReactNode;
};

const FacetProvider: React.FC<FacetProviderProps> = ({ facets, children }) => {
  const { request, updateRequest, paginationSettings } = useAppState();
  const [state, dispatch] = useReducer(facetReducer, {});

  const toggleActive = useCallback(
    (facetKey: string, e?: MouseEvent) => {
      if (e) e.preventDefault();
      dispatch({ type: "TOGGLE_FACET_ACTIVE", facetKey });
    },
    [facets],
  );

  const toggleProductFilter = useCallback(
    (
      facet: SearchFacet,
      selectedTermValue?: string | string[],
      callback?: () => void,
    ) => {
      if (isSearchTermsFacet(facet)) {
        const term = facet.data.find(
          (term) => term.value === selectedTermValue,
        );
        if (term) term.selected = !term.selected;
      } else {
        const rfs = getRangeFacetState(facet);

        facet.min = rfs.current.min;
        facet.max = rfs.current.max;
      }

      dispatch({
        type: "TOGGLE_PRODUCT_FILTER",
        facet,
        selectedTermValue,
      });
      /**
       * Create a changeFilterRequest by iterating over the updated filters,
       * and creating a array of string objects that can be passed to callNosto
       * on the app state in the following format: [{ "field": "brand", "value": "Nike" }]
       */
      const changeFilterRequest: {
        field: string;
        value?: string[];
        range?: { gt: string; lt: string }[];
      }[] = [];

      for (const facet of facets) {
        if (isSearchTermsFacet(facet)) {
          // Handle the SearchTermsFacet
          const selectedTerms = facet.data
            .filter((term) => term.selected) // Only select terms where 'selected' is true
            .map((term) => ({
              field: facet.field,
              value: term.value,
            }));

          // Merge with existing filters in changeFilterRequest
          for (const term of selectedTerms) {
            const existingFilter = changeFilterRequest.find(
              (f) => f.field === term.field,
            );

            if (existingFilter) {
              // If the field exists, push the value to the array
              if (existingFilter.value) {
                existingFilter.value.push(term.value);
              } else {
                existingFilter.value = [term.value];
              }
            } else {
              // If the field doesn't exist, add a new entry
              changeFilterRequest.push({
                field: term.field,
                value: [term.value],
              });
            }
          }
        } else {
          const rfs = getRangeFacetState(facet);

          if (
            rfs.current.min !== rfs.initial.min ||
            rfs.current.max !== rfs.initial.max
          ) {
            // Handle the SearchStatsFacet
            const rangeFacet = {
              field: facet.field,
              range: [
                {
                  gt: String(rfs.current.min.toFixed(2)),
                  lt: String(rfs.current.max.toFixed(2)),
                },
              ],
            };

            // Merge with existing filters in changeFilterRequest
            const existingFilter = changeFilterRequest.find(
              (f) => f.field === rangeFacet.field,
            );

            if (existingFilter) {
              // If the field exists, merge the ranges
              if (existingFilter.range) {
                existingFilter.range.push(...rangeFacet.range);
              } else {
                existingFilter.range = rangeFacet.range;
              }
            } else {
              // If the field doesn't exist, add a new entry
              changeFilterRequest.push(rangeFacet);
            }
          }
        }
      }

      // Update the request based on the filters
      updateRequest(
        changeFilterRequest as InputSearchTopLevelFilter[],
        request.sort,
        paginationSettings.amount,
        undefined,
        callback,
      );
    },
    [facets, request, updateRequest],
  );

  const reset = useCallback(
    (facet: SearchFacet, closeFacet: boolean, callback?: () => void) => {
      const resetRequest = request.filters.filter(
        (filter) => filter.field !== facet.field,
      );

      // Deselect each active filter
      if (isSearchTermsFacet(facet)) {
        for (const term of facet.data) {
          term.selected = false;
        }
      } else {
        // useRangeSlider looks for when min is set to -1 to trigger a reset to initial values.
        facet.min = -1;
      }

      // This closes the facet when it's reset.
      if (closeFacet) dispatch({ type: "RESET_FACET", facet });

      updateRequest(
        resetRequest,
        request.sort,
        paginationSettings.amount,
        undefined,
        callback,
      );
    },
    [request, facets],
  );

  const contextValue = facets.reduce<FacetContextType>((acc, facet) => {
    const facetKey = `${facet.id}-${handleize(facet.name)}`;
    acc[facetKey] = {
      active: state[facetKey]?.active ?? false,
      selectedFiltersCount: state[facetKey]?.selectedFiltersCount ?? 0,
      toggleActive: (e?: MouseEvent) => {
        toggleActive(facetKey, e);
      },
      toggleProductFilter: toggleProductFilter,
      reset: reset,
    };

    return acc;
  }, {});

  return (
    <FacetContext.Provider value={contextValue}>
      {children}
    </FacetContext.Provider>
  );
};

export default FacetProvider;
