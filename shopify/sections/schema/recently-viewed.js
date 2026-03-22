const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Recently Viewed",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Recently Viewed",
    },
  ],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    {
      type: "text",
      id: "title",
      label: "Heading",
      default: "Recently Viewed",
    },
    {
      type: "range",
      id: "max_products",
      label: "Maximum products to show",
      min: 4,
      max: 12,
      step: 1,
      default: 8,
    },
    {
      type: "select",
      id: "columns",
      label: "Columns",
      options: [
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      default: "4",
    },
    {
      type: "select",
      id: "aspect_ratio",
      label: "Product image aspect ratio",
      options: [
        { value: "300 / 384", label: "Portrait (3:4)" },
        { value: "1 / 1", label: "Square (1:1)" },
        { value: "4 / 3", label: "Landscape (4:3)" },
      ],
      default: "300 / 384",
    },
    {
      type: "header",
      content: "Section Settings",
    },
    ...sectionSettings({
      default_spacing: "lg",
      width: false,
    }),
  ],
};
