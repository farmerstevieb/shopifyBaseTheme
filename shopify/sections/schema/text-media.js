const content = require("./parts/content");
const image = require("./parts/image");
const shopTheLook = require("./parts/shopTheLook");
const sectionSettings = require("./parts/sectionSettings");

const video = require("./parts/video");

module.exports = {
  name: "Text Media",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Text Media",
      blocks: [
        {
          type: "text",
        },
        {
          type: "media",
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
    {
      type: "checkbox",
      id: "media_first",
      label: "Force media first on mobile",
      default: true,
    },
    {
      type: "select",
      id: "media_width",
      label: "Media width",
      options: [
        {
          value: "half",
          label: "Half",
        },
        {
          value: "two-thirds",
          label: "Two thirds",
        },
      ],
      default: "half",
    },
  ],
  blocks: [
    {
      type: "text",
      name: "Text",
      limit: 1,
      settings: [
        ...content({
          default_content_width: 400,
          default_heading_size_dsk: "5xl",
          content_position: true,
        }),
      ],
    },
    {
      type: "media",
      name: "Media",
      limit: 1,
      settings: [
        ...image(),
        {
          type: "text",
          id: "image_ratio",
          label: "Image Ratio",
          info: "Enter the width and height in width / height format .e.g: 1424 / 576",
        },
        ...video(),
        ...shopTheLook(),
      ],
    },
  ],
};
