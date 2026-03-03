const sectionSettings = require("./parts/sectionSettings");

const sectionHeader = require("./parts/section-header");

module.exports = {
  name: "Technical details",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Technical details",
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
  ],
  blocks: [
    {
      type: "@app",
    },
    ...sectionHeader(),
    {
      type: "item",
      name: "Item",
      settings: [
        {
          type: "text",
          id: "text",
          label: "Text",
        },
        {
          type: "text",
          id: "info",
          label: "Info",
        },
      ],
    },
  ],
};
