const content = require("./parts/content");
const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");
const cta = require("./parts/cta");

module.exports = {
  name: "Contact us",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Contact us",
      blocks: [
        {
          type: "find_us",
        },
        {
          type: "form",
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
      text_color: false,
    }),
  ],
  blocks: [
    {
      type: "form",
      name: "Form",
      limit: 1,
      settings: [
        {
          type: "color",
          id: "background_color",
          label: "Background Color",
        },
        ...content(),
      ],
    },
    {
      type: "find_us",
      name: "Find us",
      limit: 1,
      settings: [
        {
          type: "header",
          content: "Top Block",
        },
        {
          type: "text",
          id: "top_heading",
          label: "Heading",
        },
        {
          type: "richtext",
          id: "top_subheading",
          label: "Sub Heading",
        },
        {
          type: "richtext",
          id: "top_text",
          label: "Description",
        },
        {
          type: "header",
          content: "Call us",
        },
        {
          type: "checkbox",
          id: "show_call_us",
          label: "Show call us?",
          default: true,
          info: "Call us content is managed in translations.",
        },
        {
          type: "header",
          content: "Follow us",
        },
        {
          type: "checkbox",
          id: "show_follow_us",
          label: "Show follow us?",
          default: true,
          info: "Follow us content is managed in translations.",
        },
        {
          type: "header",
          content: "Bottom Block 1",
        },
        {
          type: "richtext",
          id: "bottom_heading_1",
          label: "Heading",
        },
        {
          type: "richtext",
          id: "bottom_text_1",
          label: "Description",
        },
        ...cta({
          default_text: "",
        }),
        {
          type: "header",
          content: "Bottom Block 2",
        },
        {
          type: "richtext",
          id: "bottom_heading_2",
          label: "Heading",
        },
        {
          type: "richtext",
          id: "bottom_text_2",
          label: "Description",
        },
      ],
    },
  ],
};
