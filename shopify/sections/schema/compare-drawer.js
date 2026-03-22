module.exports = {
  name: "Compare drawer",
  class: "o-row",
  limit: 1,
  enabled_on: {
    groups: ["footer"],
  },
  settings: [
    {
      type: "header",
      content: "Compare Settings",
    },
    {
      type: "range",
      id: "max_items",
      label: "Maximum products to compare",
      min: 2,
      max: 4,
      step: 1,
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
      id: "show_availability",
      label: "Show availability",
      default: true,
    },
    {
      type: "url",
      id: "compare_page",
      label: "Full comparison page URL",
      info: "Optional. Leave blank to hide the 'View full comparison' link.",
    },
  ],
  presets: [
    {
      name: "Compare drawer",
    },
  ],
};
