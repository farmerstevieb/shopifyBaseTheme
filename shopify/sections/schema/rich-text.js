const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Rich text",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Rich text",
      blocks: [
        {
          type: "heading",
        },
        {
          type: "text",
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
    {
      type: "number",
      id: "content_width",
      label: "Content Width (in px)",
      info: "Set to 0 for no set content width.",
      default: 702,
    },
    {
      type: "select",
      id: "position",
      label: "Position",
      options: [
        { value: "start", label: "Left" },
        { value: "center", label: "Center" },
        { value: "end", label: "Right" },
      ],
      default: "start",
    },
    {
      type: "select",
      id: "position_desktop",
      label: "Position on desktop",
      options: [
        { value: "", label: "as above" },
        { value: "start", label: "Left" },
        { value: "center", label: "Center" },
        { value: "end", label: "Right" },
      ],
      default: "",
    },
  ],
  blocks: [
    {
      type: "overline",
      name: "Overline",
      settings: [
        {
          type: "inline_richtext",
          id: "text",
          label: "Overline",
        },
      ],
    },
    {
      type: "heading",
      name: "Heading",
      settings: [
        {
          type: "richtext",
          id: "title",
          label: "Heading",
          info: "Wrap text with [highlight]...[/highlight] to display it in highlight color",
        },
        {
          type: "select",
          id: "heading_size",
          label: "Heading size",
          options: [
            { value: "lg", label: "lg (18px)" },
            { value: "2xl", label: "2xl (24px)" },
            { value: "3xl", label: "3xl (28px)" },
            { value: "4xl", label: "4xl (32px)" },
            { value: "5xl", label: "5xl (36px)" },
            { value: "6xl", label: "6xl (40px)" },
            { value: "7xl", label: "7xl (56px)" },
            { value: "8xl", label: "8xl (64px)" },
            { value: "9xl", label: "9xl (72px)" },
          ],
          default: "3xl",
        },
        {
          type: "select",
          id: "heading_size_desktop",
          label: "Heading size on desktop",
          options: [
            { value: "", label: "as above" },
            { value: "lg", label: "lg (18px)" },
            { value: "2xl", label: "2xl (24px)" },
            { value: "3xl", label: "3xl (28px)" },
            { value: "4xl", label: "4xl (32px)" },
            { value: "5xl", label: "5xl (36px)" },
            { value: "6xl", label: "6xl (40px)" },
            { value: "7xl", label: "7xl (56px)" },
            { value: "8xl", label: "8xl (64px)" },
            { value: "9xl", label: "9xl (72px)" },
          ],
          default: "5xl",
        },
        {
          type: "select",
          id: "heading_tracking_font",
          label: "Letter Spacing",
          options: [
            { value: "tracking-0", label: "None" },
            { value: "tracking-standard", label: "Standard - 1.92px" },
            { value: "tracking-wide", label: "Wide - 2.4px" },
          ],
          default: "tracking-wide",
        },
      ],
    },
    {
      type: "text",
      name: "Text",
      settings: [
        {
          type: "richtext",
          id: "text",
          label: "Text",
          info: "Wrap text with [highlight]...[/highlight] to display it in highlight color",
        },
        {
          type: "select",
          id: "text_size",
          label: "Text size",
          options: [
            { value: "2xs", label: "xs (10px)" },
            { value: "sm", label: "sm (12px)" },
            { value: "md", label: "md (14px)" },
            { value: "base", label: "base (16px)" },
            { value: "lg", label: "lg (18px)" },
            { value: "2xl", label: "2xl (24px)" },
          ],
          default: "base",
        },
        {
          type: "select",
          id: "text_size_desktop",
          label: "Text size on desktop",
          options: [
            { value: "", label: "as above" },
            { value: "2xs", label: "xs (10px)" },
            { value: "sm", label: "sm (12px)" },
            { value: "md", label: "md (14px)" },
            { value: "base", label: "base (16px)" },
            { value: "lg", label: "lg (18px)" },
            { value: "2xl", label: "2xl (24px)" },
          ],
          default: "base",
        },
      ],
    },
    {
      type: "button",
      name: "Buttons",
      settings: [
        {
          type: "paragraph",
          content: "CTA 1",
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
        {
          type: "paragraph",
          content: "CTA 2",
        },
        {
          type: "text",
          id: "cta_label_2",
          label: "Label",
        },
        {
          type: "url",
          id: "cta_link_2",
          label: "Link",
        },
        {
          type: "select",
          id: "cta_type_2",
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
          id: "cta_target_2",
          label: "Open in new tab?",
          default: false,
        },
      ],
    },
  ],
};
