const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Product FAQs",
  class: "o-row",
  tag: "section",
  enabled_on: {
    templates: ["product"],
  },
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
      text_color: false,
    }),
  ],
  blocks: [
    {
      type: "@app",
    },
    ...sectionHeader(),
  ],
  presets: [
    {
      name: "Product FAQs",
      blocks: [
        {
          type: "section_header",
        },
      ],
    },
  ],
};
