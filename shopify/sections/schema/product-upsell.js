const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Product upsell",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Product upsell",
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
      max: 8,
      step: 1,
      label: "Max products",
      default: 4,
    },
    {
      type: "checkbox",
      id: "show_price",
      label: "Show price",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_add_all",
      label: "Show \"Add all to cart\" button",
      default: false,
    },
    {
      type: "select",
      id: "layout",
      label: "Layout",
      options: [
        {
          value: "grid",
          label: "Grid",
        },
        {
          value: "slider",
          label: "Slider",
        },
      ],
      default: "grid",
    },
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "product_list",
      name: "Product list (manual override)",
      limit: 1,
      settings: [
        {
          type: "product_list",
          id: "products",
          label: "Products",
          limit: 8,
        },
      ],
    },
  ],
};
