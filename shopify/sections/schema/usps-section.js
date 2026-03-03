const sectionHeader = require("./parts/section-header");
const spacing = require("./parts/spacing");
const cta = require("./parts/cta");
const ctaSettings = require("./parts/ctaSettings");
const userRestriction = require("./parts/user-restriction");

module.exports = {
  name: "USPs section",
  class: "o-row",
  presets: [
    {
      name: "USPs section",
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
        {
          type: "logo",
        },
        {
          type: "logo",
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
    ...spacing(),
    {
      type: "select",
      id: "text_color",
      label: "Text color",
      options: [
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" },
      ],
      default: "dark",
    },
    {
      type: "header",
      content: "Restriction Settings",
    },
    ...userRestriction()
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "logo",
      name: "Logo",
      limit: 6,
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
          ],
          default: "primary",
        },
        {
          type: "checkbox",
          id: "cta_target",
          label: "Open in new tab?",
          default: false,
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
