const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "FAQs",
  class: "o-row",
  tag: "section",
  disabled_on: {
    groups: ["header", "footer"],
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
    {
      type: "faq",
      name: "FAQ",
      settings: [
        {
          type: "text",
          id: "title",
          label: "FAQ Question",
          default: "How do I...?",
        },
        {
          type: "richtext",
          id: "body",
          label: "FAQ Answer",
          default: "<p>We're here to help.</p>",
        },
      ],
    },
  ],
  presets: [
    {
      name: "FAQs",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "faq",
        },
      ],
    },
  ],
};
