const sectionSettings = require("./parts/sectionSettings");
const shopTheLook = require("./parts/shopTheLook");
const content = require("./parts/content");
module.exports = {
  name: "Before & After",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Before & After",
      blocks: [{ type: "before" }, { type: "after" }],
    },
  ],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
  ],
  blocks: [
    {
      type: "before",
      name: "Before",
      limit: 1,
      settings: [
        {
          type: "image_picker",
          id: "image",
          label: "Desktop image",
        },
        {
          type: "image_picker",
          id: "image_mobile",
          label: "Mobile image",
        },
        ...content({
          spread_content: true,
          default_content_width: 350,
          multiple_ctas: false,
          default_heading: "Heading",
        }),
        ...shopTheLook(),
      ],
    },
    {
      type: "after",
      name: "After",
      limit: 1,
      settings: [
        {
          type: "image_picker",
          id: "image",
          label: "Desktop image",
        },
        {
          type: "image_picker",
          id: "image_mobile",
          label: "Mobile image",
        },
        ...content({
          spread_content: true,
          default_content_width: 350,
          multiple_ctas: false,
          default_heading: "Heading",
        }),
        ...shopTheLook(),
      ],
    },
  ],
};
