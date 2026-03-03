const content = require("./parts/content");
const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const video = require("./parts/video");

module.exports = {
  name: "Banner Grid",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Banner Grid",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "card",
        },
        {
          type: "card",
        },
      ],
    },
  ],
  settings: [
    {
      type: "select",
      id: "media_ratio",
      options: [
        {
          value: "auto",
          label: "Default",
        },
        {
          value: "from_media",
          label: "Adapt to media",
        },
      ],
      default: "auto",
      label: "Media ratio",
    },
    {
      type: "select",
      id: "content_position",
      options: [
        {
          value: "",
          label: "Below media",
        },
        {
          value: "located",
          label: "Located on media",
        },
      ],
      default: "",
      label: "Image position",
    },
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
      type: "card",
      name: "Card",
      limit: 4,
      settings: [
        {
          type: "header",
          content: "Width",
        },
        {
          type: "select",
          id: "width",
          label: "Card width",
          options: [
            {
              value: "col-span-8",
              label: "Two thirds",
            },
            {
              value: "col-span-6",
              label: "Half",
            },
            {
              value: "col-span-4",
              label: "One third",
            },
            {
              value: "col-span-3",
              label: "Quarter",
            },
          ],
          default: "col-span-6",
        },
        ...content(),
        ...image(),
        ...video(),
      ],
    },
  ],
};
