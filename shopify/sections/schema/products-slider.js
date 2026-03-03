const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Product feed",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Product feed",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "list",
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
      type: "header",
      content: "Slider settings",
    },
    {
      type: "select",
      id: "slider_enabled",
      label: "Enable slider?",
      options: [
        {
          value: "false",
          label: "No",
        },
        {
          value: "true",
          label: "Yes",
        },
        {
          value: "(max-width: 768px)",
          label: "On mobile",
        },
        {
          value: "(min-width: 768px)",
          label: "On desktop",
        },
      ],
      default: "true",
    },
    {
      type: "liquid",
      id: "show_if",
      label: "Render condition",
      info: "Advanced: use liquid condition to show/hide this section, return `true|empty` to show or `false` to hide.",
    },
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "list",
      name: "Product list",
      limit: 1,
      settings: [
        {
          type: "product_list",
          id: "list",
          label: "Products",
          limit: 8,
        },
      ],
    },
    {
      type: "collection",
      name: "Collection",
      limit: 1,
      settings: [
        {
          type: "collection",
          id: "collection",
          label: "Collection",
        },
      ],
    },
    {
      type: "recommended",
      name: "Recommended products",
      limit: 1,
      settings: [
        {
          type: "select",
          id: "intent",
          label: "Intent",
          default: "related",
          options: [
            {
              value: "complementary",
              label: "Complementary",
            },
            {
              value: "related",
              label: "Related",
            },
          ],
          info: "[Learn more](https://shopify.dev/themes/product-merchandising/recommendations)",
        },
        {
          type: "range",
          id: "limit",
          min: 0,
          max: 10,
          step: 1,
          label: "Limit",
          default: 10,
        },
      ],
    },
  ],
};
