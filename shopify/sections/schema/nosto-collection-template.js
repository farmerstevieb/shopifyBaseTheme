const sectionSettings = require("./parts/sectionSettings");
const aspectRatios = require("./parts/aspectRatios");
const gridSpacing = require("./parts/gridSpacing");
const gridItems = require("./parts/gridItems");
const pagination = require("./parts/pagination");
const content = require("./parts/content");
const image = require("./parts/image");
const video = require("./parts/video");

module.exports = {
  name: "Nosto Search Template",
  class: "shopify-section--nosto-collection-template o-row",
  tag: "section",
  presets: [{ name: "Nosto Search Template" }],
  enabled_on: {
    templates: ["collection"],
  },
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
      show_restriction: false,
    }),
    ...aspectRatios(),
    ...gridSpacing(),
    ...gridItems({
      item_title: "Products",
    }),
    ...pagination(),
  ],
  blocks: [
    {
      type: "banner",
      name: "Single Banner",
      settings: [
        {
          type: "select",
          id: "banner_width",
          label: "Banner width",
          options: [
            {
              value: "single",
              label: "Single",
            },
            {
              value: "double",
              label: "Double",
            },
            {
              value: "triple",
              label: "Triple",
            },
            {
              value: "full",
              label: "Full",
            },
          ],
          default: "single",
        },
        {
          type: "number",
          id: "order",
          label: "Banner Position",
        },
        ...content({ multiple_ctas: true }),
        ...image(),
        ...video(),
      ],
    },
  ],
  presets: [
    {
      name: "Collection Products",
      blocks: [
        {
          type: "banner",
        },
      ],
    },
  ],
};
