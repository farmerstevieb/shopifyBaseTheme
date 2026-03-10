const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");
const sectionHeader = require("./parts/section-header");
const { type } = require("os");

module.exports = {
  name: "Main register",
  class: "o-row",
  enabled_on: {
    templates: ["customers/register"],
  },
  presets: [
    {
      name: "Main register",
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
      type: "checkbox",
      id: "disable_register",
      label: "Disable default form"
    },
  ],
  blocks: [
    ...sectionHeader({
      content_settings: {
        default_heading: "Header",
        default_content_width: 600,
        content_align: true,
      },
    }),
    {
      type: "section_bullets",
      name: "Bullet List",
      limit: 1,
      settings: [
        {
         type:"richtext",
         id: "bullet_header",
         label: "Bullet header"
        },
        {
         type:"richtext",
         id: "bullet_list",
         label: "Bullet content",
         info: "Create bullet list points terminating in ;"
        }
      ]
    },
    {
      type: "media",
      name: "Media",
      limit: 1,
      settings: [
        {
          type: "checkbox",
          id: "mobile_hidden",
          label: "Hide on mobile?",
          default: true,
        },
        ...image(),
      ],
    },
  ],
};
