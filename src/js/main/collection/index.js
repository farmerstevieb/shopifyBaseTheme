import { get, rIC } from "../../utils";

async function load(element) {
  const { Collection } = await import("./Collection");
  new Collection(element);
}

async function loadReadmore() {
  const { default: Readmore, initTruncate } = await import("./Readmore");

  // Initialize existing readmore functionality
  const readmoreElements = document.querySelectorAll(".js-read-more");
  readmoreElements.forEach((el) => new Readmore(el));

  // Initialize new truncate functionality
  initTruncate();
}

function collectionController() {
  const elCollection = get(".js-collection");
  if (elCollection) load(elCollection);

  // Initialize readmore and truncate functionality
  loadReadmore();
}

export default () => rIC(collectionController);
