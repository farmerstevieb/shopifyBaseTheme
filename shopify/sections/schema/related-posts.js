const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Related posts",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Related posts",
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
      type: "latest",
      name: "Latest posts",
      limit: 1,
    },
    {
      type: "article",
      name: "Article",
      limit: 3,
      settings: [
        {
          type: "article",
          id: "article",
          label: "Article",
        },
      ],
    },
  ],
};
