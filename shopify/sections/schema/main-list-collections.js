const sectionSettings = require("./parts/sectionSettings");
const aspectRatios = require("./parts/aspectRatios");
const gridSpacing = require("./parts/gridSpacing");
const gridItems = require("./parts/gridItems");
const pagination = require("./parts/pagination");

module.exports = {
  name: "List Collections",
  tag: "section",
  class: "o-row shopify-section--list-collections",
  enabled_on: {
    templates: ["list-collections"],
  },
  settings: [
    ...sectionSettings(),
    ...aspectRatios(),
    ...gridSpacing(),
    ...gridItems({
      item_title: "Collections",
    }),
    ...pagination(),
  ],
};
