import React, { useContext, type ReactNode } from "react";
import type { SearchFacet } from "@nosto/nosto-js/client";

import { isSearchTermsFacet } from "../tools/is-search-terms-facet";
import { useAppState } from "./app-state";
import FacetProvider from "./facet";

export type FacetsContextType = {
  loading: boolean;
  facets: SearchFacet[];
  resetAll: (callback?: () => void) => void;
};

const Facets = React.createContext<FacetsContextType>({} as FacetsContextType);

export function useFacets() {
  return useContext(Facets);
}

type FacetsProviderProps = {
  loading: boolean;
  facets: SearchFacet[];
  children: ReactNode;
};

const FacetsProvider: React.FC<FacetsProviderProps> = ({
  loading,
  facets,
  children,
}) => {
  const { updateRequest, paginationSettings, request } = useAppState();

  const resetAll = (callback?: () => void) => {
    for (const facet of facets) {
      if (isSearchTermsFacet(facet)) {
        for (const term of facet.data) {
          term.selected = false;
        }
      } else {
        // useRangeSlider looks for when min is set to -1 to trigger a reset to initial values.
        facet.min = -1;
      }
    }

    updateRequest(
      [],
      request.sort,
      paginationSettings.amount,
      undefined,
      callback,
    );
  };

  return (
    <Facets.Provider
      value={{
        loading,
        facets,
        resetAll,
      }}
    >
      <FacetProvider facets={facets}>{children}</FacetProvider>
    </Facets.Provider>
  );
};

export default FacetsProvider;
