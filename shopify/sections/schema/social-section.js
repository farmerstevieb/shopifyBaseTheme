const content = require("./parts/content");
const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

const video = require("./parts/video");

module.exports = {
  name: "Social Section",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Social Section",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "larger_card",
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
      color_spacing: false,
      text_color: false,
    }),
    {
      type: "range",
      id: "background_height",
      min: 10,
      max: 100,
      step: 10,
      unit: "%",
      label: "Background height",
      default: 70,
    },
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "larger_card",
      name: "Larger Card",
      limit: 1,
      settings: [
        ...image(),
        ...video(),
        {
          type: "url",
          id: "link",
          label: "Link",
        },
      ],
    },
    {
      type: "card",
      name: "Card",
      limit: 6,
      settings: [
        {
          type: "header",
          content: "Width",
        },
        ...image(),
        ...video(),
        {
          type: "url",
          id: "link",
          label: "Link",
        },
      ],
    },
  ],
};
