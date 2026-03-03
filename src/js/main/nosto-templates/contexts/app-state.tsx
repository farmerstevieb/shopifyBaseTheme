import React, { useContext, useEffect, useState, type ReactNode } from "react";
import type {
  InputSearchSort,
  InputSearchTopLevelFilter,
  PageType,
  SearchProducts,
  SearchQuery,
  SearchResult,
  SearchSortOrder,
} from "@nosto/nosto-js/client";

import { defaultConfig } from "../config";
import { callNosto } from "../tools/call-nosto";
import FacetsProvider from "./facets";

type TrackType = "serp" | "category";

type Request = {
  filters: InputSearchTopLevelFilter[];
  sort: InputSearchSort[];
};

export type AppStateContextType = {
  /* Indicates that the search is loading, loader should be shown when `true`. */
  loading: boolean;
  /* Current search query that includes all user input like search text, filters, sort, page, etc. */
  query: SearchQuery | undefined;
  updateQuery: (newQuery: string) => void;
  /* Displays which page type it is - category | search */
  pageType: PageType;
  /* The Nosto track type to use: 'serp' on search pages, 'category' on collection pages */
  trackType: TrackType;
  /* Current search response that includes found products, keywords and other results. */
  response: SearchResult;
  /* Indicates that the react app is initialized.*/
  initialized: boolean;
  /* Custom params from URL */
  customParams: Record<string, unknown>;
  /* Historical searches */
  historyItems?: string[];
  /* Triggers an update by passing new parameters to the original search request */
  updateRequest: (
    filters: InputSearchTopLevelFilter[],
    sort: InputSearchSort[],
    size: number | undefined,
    from?: number,
    callback?: (res: SearchResult) => void,
  ) => void;
  /* Saved current request */
  request: Request;
  /* Current mobile facets drawer state */
  mobileFacetsDrawerState: boolean;
  /* Toggles the mobile facets drawer state */
  toggleMobileFacetsDrawerState: (mobileFacetsDrawerState: boolean) => void;
  /* Returns the pagination settings */
  paginationSettings: {
    type: "text" | "dynamic";
    amount: number;
  };
};

const AppState = React.createContext<AppStateContextType>(
  {} as AppStateContextType,
);

export function useAppState() {
  return useContext(AppState);
}

type AppStateProviderProps = {
  children: ReactNode;
};

const loadFiltersFromURL = (): InputSearchTopLevelFilter[] => {
  const url = new URL(location.href);
  const filtersFromURL: InputSearchTopLevelFilter[] = [];

  // Create an object to store the parameters by their field (key)
  const filterMap: Record<string, string[]> = {};

  // Iterate over all the search parameters in the URL
  for (const [key, value] of url.searchParams.entries()) {
    // Ignore 'q' since it's just the search query
    // Ignore 'sort' as it's not a filter
    // Ignore 'page' as we manage that via the PaginationText component
    const restrictedKeys = ["q", "nst_sort", "nst_page"];
    if (restrictedKeys.includes(key) || !key.includes("nst_")) continue;

    // Decode the key and value to handle any URL-encoded characters
    const decodedKey = decodeURIComponent(key.replace("nst_", ""));
    const decodedValue = decodeURIComponent(value);

    filterMap[decodedKey] = decodedValue.split(",");
  }

  // Now convert the map into the desired filter format
  for (const [key, values] of Object.entries(filterMap)) {
    if (key === "price") {
      filtersFromURL.push({
        field: key,
        range: [
          {
            gt: values[0]?.split("+")[0],
            lt: values[0]?.split("+")[1],
          },
        ],
      } as InputSearchTopLevelFilter);
    } else {
      filtersFromURL.push({
        field: key,
        value: values.length === 1 ? values[0] : values, // Use a single value or an array
      } as InputSearchTopLevelFilter);
    }
  }

  return filtersFromURL;
};

const loadSortFromURL = (): InputSearchSort[] => {
  const url = new URL(location.href);
  const sortFromURL: InputSearchSort[] = [];

  // Create an object that will be populated.
  const sortMap = {
    field: "",
    order: "",
  };

  // Iterate over all the search parameters in the URL
  for (const [key, value] of url.searchParams.entries()) {
    // Only focus on the sort key
    if (key !== "nst_sort") continue;

    // Decode the key and value to handle any URL-encoded characters
    const decodedValue = decodeURIComponent(value).split("+");

    sortMap.field = decodedValue[0] as string;
    sortMap.order = decodedValue[1] as SearchSortOrder;
    sortFromURL.push(
      sortMap as {
        field: string;
        order: SearchSortOrder;
      },
    );
  }

  return sortFromURL;
};

const convertFiltersAndSortToParams = (
  filters: InputSearchTopLevelFilter[],
  sort: InputSearchSort[] | undefined,
  query: string | undefined,
) => {
  const params: {
    [key: string]:
      | string
      | string[]
      | InputSearchSort[]
      | InputSearchTopLevelFilter[];
  } = {};

  if (query) {
    params["q"] = query; // Add the query parameter as a string
  }

  if (sort && sort.length > 0) {
    params["nst_sort"] = `${sort[0]?.field}+${sort[0]?.order}`;
  }

  // Iterate over the filters to build historyParams
  for (const filter of filters) {
    // Check if this field already has a value in historyParams
    if (filter.field && params[`nst_${filter.field}`]) {
      // If the field already exists and it's not an array, convert it to an array
      if (Array.isArray(params[`nst_${filter.field}`])) {
        (params[`nst_${filter.field}`] as string[]).push(String(filter.value)); // Add new value to the array
      } else {
        // If it's a single value, convert it into an array and add the new value
        params[`nst_${filter.field}`] = [
          String(params[`nst_${filter.field}`]),
          String(filter.value),
        ];
      }
    } else if (filter.field) {
      if (filter.value) {
        // Standard Filters
        // If this field doesn't exist, simply set the value (as a string)
        params[`nst_${filter.field}`] = String(filter.value);
      } else if (filter.range) {
        // Range Filters
        params[`nst_${filter.field}`] =
          `${filter.range[0]?.gt}+${filter.range[0]?.lt}`;
      }
    }
  }

  return params;
};

const updateHistoryParams = (newParams: {
  [key: string]:
    | string
    | string[]
    | InputSearchSort[]
    | InputSearchTopLevelFilter[];
}) => {
  // Get the current URL
  const currentUrl = new URL(location.href);

  // Collect all existing query parameter keys
  const existingKeys = [...currentUrl.searchParams.keys()];

  // Delete all existing query parameters
  for (const key of existingKeys) {
    currentUrl.searchParams.delete(key);
  }

  // Iterate through the newParams object and handle single or multiple values
  for (const [key, value] of Object.entries(newParams)) {
    // URL-encode the key and value to ensure they are safe
    const encodedKey = encodeURIComponent(key);

    // Check if the value is an array (i.e., multiple values for the same key)
    if (Array.isArray(value)) {
      // URL-encode each value if it's an array
      for (const val of value) {
        currentUrl.searchParams.append(
          encodedKey,
          encodeURIComponent(String(val)),
        );
      }
    } else {
      // URL-encode the single value
      currentUrl.searchParams.set(encodedKey, encodeURIComponent(value));
    }
  }

  // Use replaceState to update the URL without reloading the page
  window.history.replaceState(
    undefined, // State object (can be left as undefined or null)
    "", // Title (can be left empty)
    currentUrl.toString(), // Updated URL
  );
};

/* Matches a Shopify path to a relevant PageType as defined by Nosto */
const getPageType = (): PageType => {
  if (location.pathname.includes("/search")) {
    return "search";
  } else if (location.pathname.includes("/collections")) {
    return "category";
  } else {
    return "other";
  }
};

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [loading, setLoadState] = useState<boolean>(true);
  const [request, setRequest] = useState({
    filters: [] as InputSearchTopLevelFilter[],
    sort: [] as InputSearchSort[],
  });
  const [query, setQuery] = useState<SearchQuery | undefined>(
    new URL(location.href).searchParams.get("q") ?
      {
        query: decodeURIComponent(
          new URL(location.href).searchParams.get("q") ?? "",
        ),
      }
    : undefined,
  );
  const [pageType] = useState<PageType>(getPageType());
  const trackType: TrackType = pageType === "search" ? "serp" : "category";
  const [response, setResponse] = useState<SearchResult>({});
  const [initialized, setIsInitialized] = useState<boolean>(false);
  const [customParams, setCustomParams] = useState<Record<string, unknown>>({});
  const [historyItems, setHistoryItems] = useState<string[]>([]);
  const [mobileFacetsDrawerState, setMobileFacetsDrawerState] = useState(false);
  const [paginationSettings] = useState({
    type:
      pageType === "search" ?
        defaultConfig.serpPaginationType
      : defaultConfig.categoryPaginationType,
    amount:
      pageType === "search" ?
        defaultConfig.serpPaginationAmount
      : defaultConfig.categoryPaginationAmount,
  });

  const updateQuery = (newQuery: string) => {
    setQuery({
      query: decodeURIComponent(newQuery),
    });
  };

  /* Handles the appearance of the mobile facets drawer */
  const toggleMobileFacetsDrawerState = (mobileFacetsDrawerState: boolean) => {
    setMobileFacetsDrawerState(mobileFacetsDrawerState);
  };

  /* Queries Nosto for a response to a submitted text query */
  useEffect(() => {
    if (!query && pageType === "search") {
      // This will display the 'Enter a term page'
      setIsInitialized(true);
      setLoadState(false);
      return;
    }

    setLoadState(true);

    // Reset the request/response object back to it's default value
    setRequest({
      filters: [] as InputSearchTopLevelFilter[],
      sort: [] as InputSearchSort[],
    });
    setResponse({});

    let initialFilters = [] as InputSearchTopLevelFilter[];
    let initialSort = [] as InputSearchSort[];
    let initialFrom = 0;

    if (!initialized) {
      initialFilters = loadFiltersFromURL();
      initialSort = loadSortFromURL();

      const initialPageNumber =
        new URL(location.href).searchParams.get("page") ?? 1;
      initialFrom = paginationSettings.amount * (Number(initialPageNumber) - 1);

      setRequest({
        filters: initialFilters,
        sort: initialSort,
      });
    }

    callNosto(
      query?.query,
      paginationSettings.amount,
      pageType,
      initialFilters,
      initialSort,
      initialFrom,
    )
      .then((res) => {
        setResponse(res);

        // Only run after page load, clear all other params except for the query param.
        if (initialized && pageType === "search") {
          updateHistoryParams({
            q: query?.query as string,
          });
        }

        setIsInitialized(true);
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        setLoadState(false);
      });
  }, [query?.query]);

  /* Log any search parameter changes into customParameters */
  useEffect(() => {
    const url = new URL(location.href);

    // Create an empty object to hold the parameters
    const paramsRecord: Record<string, unknown> = {};

    // Iterate over all search params and populate the object
    for (const [key, value] of url.searchParams.entries()) {
      // Add each parameter to the Record
      paramsRecord[key] = value;
    }

    setCustomParams(paramsRecord);
  }, [location.href]);

  /* Log each search into historyItems */
  useEffect(() => {
    setHistoryItems((previousQueries) => {
      // Add the new query to the beginning of the array
      const updatedHistory = [String(query?.query), ...previousQueries];

      // Limit the array to the most recent 5 items
      return updatedHistory.slice(0, defaultConfig.historySize);
    });
  }, [query?.query]);

  const updateRequest = (
    filters: InputSearchTopLevelFilter[],
    sort: InputSearchSort[],
    size = paginationSettings.amount,
    from?: number,
    callback?: (res: SearchResult) => void,
  ) => {
    if (!query && pageType === "search") return;
    setLoadState(true);
    setRequest({ filters, sort });

    callNosto(query?.query, size, pageType, filters, sort, from)
      .then((res) => {
        setResponse(res);

        const historyParams = convertFiltersAndSortToParams(
          filters,
          sort,
          query?.query,
        );
        updateHistoryParams(historyParams);

        if (callback) callback(res);
        console.log("updateRequest", res);
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        setLoadState(false);
      });
  };

  return (
    <AppState.Provider
      value={{
        loading,
        query,
        updateQuery,
        pageType,
        trackType,
        response,
        initialized,
        customParams,
        historyItems,
        updateRequest,
        request,
        mobileFacetsDrawerState,
        toggleMobileFacetsDrawerState,
        paginationSettings,
      }}
    >
      <FacetsProvider
        loading={loading}
        facets={response.products?.facets ?? []}
      >
        {children}
      </FacetsProvider>
    </AppState.Provider>
  );
};

export default AppStateProvider;
