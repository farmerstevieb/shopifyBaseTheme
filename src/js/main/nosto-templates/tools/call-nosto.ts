import type {
  InputSearchSort,
  InputSearchTopLevelFilter,
  PageType,
  SearchQuery,
  SearchResult,
} from "@nosto/nosto-js/client";

import { get } from "../../../utils";
import { defaultConfig } from "../config";

async function ensureNostoIsDefined() {
  return new Promise<void>((resolve, reject) => {
    let i = 0;
    const checkForNosto = () => {
      if (typeof window.nostojs == "function") {
        resolve();
        return;
      }
      i++;
      console.log("Nosto was not been loaded");
      setTimeout(checkForNosto, 25 * i ** 2);
    };
    checkForNosto();
  });
}

export async function callNosto(
  query: string | undefined, // If undefined, function assumes this is a category page and not a serp page
  size = location.pathname === "/search" ?
    defaultConfig.serpPaginationAmount
  : defaultConfig.categoryPaginationAmount,
  pageType: PageType,
  filters?: InputSearchTopLevelFilter[],
  sort?: InputSearchSort[],
  from?: number,
): Promise<SearchResult> {
  let apiResponse: SearchResult | undefined;

  await ensureNostoIsDefined();
  await new Promise<void>((resolve, reject) => {
    void window.nostojs((api) => {
      const searchParams: SearchQuery = {
        products: {
          fields: [
            "available",
            "name",
            "pid",
            "alternateImageUrls",
            "thumbUrl",
            "url",
            "brand",
            "productId",
            "categories",
            "price",
            "listPrice",
            "imageUrl",
            "inventoryLevel",
            "customFields.key",
            "customFields.value",
            "skus.inventoryLevel",
            "skus.name",
            "skus.id",
            "skus.availability",
            "skus.imageUrl",
            "skus.price",
            "skus.listPrice",
            "skus.customFields.key",
            "skus.customFields.value",
            "skus.price",
            "skus.listPrice",
            "priceCurrencyCode",
            "tags1",
            "tags2",
            "tags3",
          ],
          facets: ["*"],
          filter: filters,
          sort: sort,
          size: size,
          from: from,
        },
      };

      // Add SERP specific attributes.
      if (query !== undefined && pageType === "search") {
        searchParams.query = query;
      }

      // Add Category specific attributes.
      if (pageType === "category") {
        const categoryRoot = get(
          "#nosto-category-content",
        ) as HTMLElement | null;
        if (categoryRoot && searchParams.products) {
          searchParams.products.categoryId = categoryRoot.dataset.nstCategoryId;
          searchParams.products.categoryPath = categoryRoot.dataset.nstCategoryPath;
        }
      }

      api
        .search(searchParams, {
          track: pageType === "search" ? "serp" : "category",
        })
        .then((response) => {
          apiResponse = response;
          resolve();
        })
        .catch((error: unknown) => {
          reject(new Error(error as string));
        });
    });
  });

  return (
    apiResponse || {
      products: { hits: [], total: 0 },
      keywords: { hits: [], total: 0 },
    }
  );
}
