import React from "react";
import he from "he";

import { useAppState } from "../contexts/app-state";
import { usePagination } from "../hooks/use-pagination";
import Loader from "./elements/loader";

export default function PaginationDynamic() {
  const {
    loading,
    request,
    updateRequest,
    paginationSettings,
    response: { products },
  } = useAppState();
  const { current, last, next, resultsFrom } = usePagination();

  const allProductsLoaded = current === last;

  const handlePageChange = () => {
    const newSize = Number(paginationSettings.amount) * next;

    updateRequest(request.filters, request.sort, newSize);
  };

  return (
    <div className="group pb-10 pt-8 text-center">
      <div className="relative mx-auto w-fit">
        <p className="mb-4 select-none text-center text-md">
          {he
            .decode(window._Nosto.i18n.pagination.results_current_total)
            .replace(
              "{{ current }}",
              String(resultsFrom + Number(products?.hits.length)),
            )
            .replace("{{ total }}", String(products?.total))}
        </p>

        <div className="relative">
          <button
            className="button button--large button--primary lg:min-w-[300px]"
            type="button"
            {...((allProductsLoaded || loading) && { disabled: true })}
            onClick={handlePageChange}
          >
            {allProductsLoaded ?
              he.decode(window._Nosto.i18n.pagination.dynamic.loaded)
            : he.decode(window._Nosto.i18n.pagination.dynamic.load_more)}
          </button>

          <div
            className="absolute inset-0 h-full w-full animate-fade-in rounded-[30px] bg-black"
            hidden={!loading}
          >
            <Loader stroke="white" size={25} />
          </div>
        </div>
      </div>
    </div>
  );
}
