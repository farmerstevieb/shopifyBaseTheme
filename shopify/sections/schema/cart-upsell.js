const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Cart upsell",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Cart upsell",
      blocks: [
        {
          type: "section_header",
        },
      ],
    },
  ],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    {
      type: "range",
      id: "max_products",
      min: 1,
      max: 6,
      step: 1,
      label: "Max products to show",
      default: 4,
    },
    {
      type: "checkbox",
      id: "show_price",
      label: "Show price on cards",
      default: true,
    },
    {
      type: "select",
      id: "placement",
      label: "Position",
      options: [
        {
          value: "above",
          label: "Above cart items",
        },
        {
          value: "below",
          label: "Below cart items",
        },
      ],
      default: "below",
    },
  ],
  blocks: [
    ...sectionHeader(),
  ],
};
