import type { InputSearchSort } from "@nosto/nosto-js/client";

import { get } from "../../utils";
import type { BannerBlock } from "./components/banner";

type SortOption = {
  id: string;
  value: {
    name: string;
    sortRequest: InputSearchSort[];
  };
};

type PaginationType = "text" | "dynamic";

type DefaultConfig = {
  sort: SortOption;
  serpPaginationAmount: number;
  serpPaginationType: PaginationType;
  categoryPaginationAmount: number;
  categoryPaginationType: PaginationType;
  customerIsLoggedIn: boolean;
  historySize: number;
  categoryBlocks: BannerBlock[];
};

function createSortOption(
  id: string,
  name: string,
  ...sortRequest: InputSearchSort[]
): SortOption {
  return {
    id: id,
    value: {
      name: name,
      sortRequest: sortRequest,
    },
  };
}

const initialOption = createSortOption("score", "Most relevant", {
  field: "score",
  order: "desc",
});

// Sort options for Nosto search results
export const sortOptions = [
  initialOption,
  createSortOption("-price", "Price, low to high", {
    field: "skus.price",
    order: "asc",
  }),
  createSortOption("price", "Price, high to low", {
    field: "skus.price",
    order: "desc",
  }),
];

const serpContent = get("#nosto-serp-content") as HTMLElement | null;
const categoryContent = get("#nosto-category-content") as HTMLElement | null;

const parseCategoryBlocks = (): BannerBlock[] => {
  try {
    const blocksData = categoryContent?.dataset.nstCategoryBlocks;
    if (!blocksData) return [];
    return JSON.parse(blocksData) as BannerBlock[];
  } catch (error) {
    console.warn("Failed to parse category blocks:", error);
    return [];
  }
};

export const defaultConfig = {
  sort: initialOption,
  serpPaginationAmount: Number(
    serpContent?.dataset.nstSerpPaginationAmount ?? 48,
  ),
  serpPaginationType: serpContent?.dataset.nstSerpPaginationType ?? "dynamic",
  categoryPaginationAmount: Number(
    categoryContent?.dataset.nstCategoryPaginationAmount ?? 48,
  ),
  categoryPaginationType:
    categoryContent?.dataset.nstCategoryPaginationType ?? "dynamic",
  customerIsLoggedIn: Boolean(
    serpContent ?
      serpContent.dataset.nstSerpCustomerIsLoggedIn
    : categoryContent?.dataset.nstCategoryCustomerIsLoggedIn,
  ),
  historySize: 5,
  categoryBlocks: parseCategoryBlocks(),
} as DefaultConfig;
