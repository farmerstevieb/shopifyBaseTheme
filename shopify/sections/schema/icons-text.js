const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const icon = require("./parts/icon");

module.exports = {
  name: "Logos + Text",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Logos + Text",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "logo",
        },
        {
          type: "logo",
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
    ...sectionHeader(),
    {
      type: "logo",
      name: "Logo",
      limit: 4,
      settings: [
        {
          type: "header",
          content: "Image",
        },
        {
          type: "image_picker",
          id: "image",
          label: "Image",
        },
        {
          type: "header",
          content: "Text",
        },
        {
          type: "inline_richtext",
          id: "title",
          label: "Title",
        },
        {
          type: "richtext",
          id: "text",
          label: "Text",
        },
        {
          type: "paragraph",
          content: "CTA",
        },
        {
          type: "text",
          id: "cta_label",
          label: "Label",
        },
        {
          type: "url",
          id: "cta_link",
          label: "Link",
        },
        {
          type: "select",
          id: "cta_type",
          label: "Type",
          options: [
            {
              value: "primary",
              label: "Primary",
            },
            {
              value: "secondary",
              label: "Secondary",
            },
            {
              value: "tertiary",
              label: "Tertiary",
            },
            {
              value: "quaternary",
              label: "Quaternary",
            },
            {
              value: "link",
              label: "Link",
            },
          ],
          default: "primary",
        },
        ...icon(),
        {
          type: "checkbox",
          id: "cta_target",
          label: "Open in new tab?",
          default: false,
        },
      ],
    },
  ],
};
