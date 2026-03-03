import React from "react";
import he from "he";

import { useAppState } from "../contexts/app-state";

export default function NoResults() {
  const { pageType } = useAppState();

  const translation =
    pageType === "category" ?
      he.decode(window._Nosto.i18n.category.facets.no_results)
    : he.decode(window._Nosto.i18n.serp.facets.no_results);

  return (
    <div className="mb-9 py-12 text-center font-heading font-bold">
      {translation}
    </div>
  );
}
