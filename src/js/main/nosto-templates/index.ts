import { get, rIC } from "../../utils";

function nostoSearchTemplateController() {
  const serp = get("#nosto-serp-content");
  const category = get("#nosto-category-content");

  if ((serp || category) && window._Nosto) {
    void import(/* webpackChunkName: "nosto-search-template" */ "./app");
  }
}

const index = () => rIC(nostoSearchTemplateController);
export default index;
