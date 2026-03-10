const sectionSettings = require("./parts/sectionSettings");
const aspectRatios = require("./parts/aspectRatios");
const gridSpacing = require("./parts/gridSpacing");
const gridItems = require("./parts/gridItems");
const pagination = require("./parts/pagination");

module.exports = {
  name: "Search Results",
  class: "shopify-section--main-search o-row",
  tag: "section",
  enabled_on: {
    templates: ["search"],
  },
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "0",
      show_restriction: false,
    }),
    ...aspectRatios(),
    ...gridSpacing(),
    ...gridItems({
      item_title: "Products",
      desktop_default: "4",
    }),
    ...pagination(),
  ],
};
