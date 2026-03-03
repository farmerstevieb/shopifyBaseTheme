const sectionSettings = require("./parts/sectionSettings");
const aspectRatios = require("./parts/aspectRatios");
const gridSpacing = require("./parts/gridSpacing");
const gridItems = require("./parts/gridItems");
const pagination = require("./parts/pagination");

module.exports = {
  name: "Nosto Search Template",
  class: "shopify-section--nosto-search-template o-row",
  tag: "section",
  presets: [{ name: "Nosto Search Template" }],
  templates: ["search"],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "0",
      show_restriction: false
    }),
    ...aspectRatios(),
    ...gridSpacing(),
    ...gridItems({
      item_title: "Products",
      desktop_default: "4"
    }),
    ...pagination(),
  ],
};
