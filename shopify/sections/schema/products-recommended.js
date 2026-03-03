const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Cart Product feed",
  class: "o-row",
  templates: ["cart"],
  presets: [
    {
      name: "Cart Product feed",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "recommended",
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
      default_spacing: "0",
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
  ],
  blocks: [
    ...sectionHeader(),
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
