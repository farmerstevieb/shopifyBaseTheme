import { get, rIC } from "../../utils";

async function load(element) {
  const { Pagination } = await import("./Pagination");
  new Pagination(element);
}

function paginationController() {
  const elPagination = get(".js-pagination");
  if (elPagination) load(elPagination);
}

export default () => rIC(paginationController);
