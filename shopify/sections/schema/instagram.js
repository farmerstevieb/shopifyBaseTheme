const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const cta = require("./parts/cta");
const ctaSettings = require("./parts/ctaSettings");

module.exports = {
  name: "Instagram",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Instagram",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "ctas",
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
      default_spacing: "lg",
    }),
  ],
  blocks: [
    {
      type: "@app",
    },
    ...sectionHeader(),
    {
      type: "image",
      name: "Image",
      limit: 5,
      settings: [
        {
          type: "image_picker",
          id: "image",
          label: "Image",
        },
        {
          type: "url",
          id: "link",
          label: "Link",
        },
      ],
    },
    {
      type: "ctas",
      name: "CTAs",
      limit: 1,
      settings: [
        ...ctaSettings({
          cta_alignment: true,
          cta_spacing: false,
        }),
        ...cta({
          default_text: "",
          default_icon: "none",
        }),
        ...cta({
          index: 2,
          default_text: "",
          default_style: "secondary",
          default_icon: "none",
        }),
      ],
    },
  ],
};
