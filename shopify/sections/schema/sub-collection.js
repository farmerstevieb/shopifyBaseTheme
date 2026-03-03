const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

const slider = require("./parts/slider");

module.exports = {
  name: "Sub collection",
  class: "o-row",
  enabled_on: {
    templates: ["collection"],
  },
  presets: [
    {
      name: "Sub collection",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "color_picker",
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
    ...slider({
      has_dots: false,
      has_arrows: false,
    }),
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "color_picker",
      name: "Swatch",
      settings: [
        {
          type: "header",
          content: "Swatch Colors/Images",
          info: "Choose a color OR image to associate with a product option that utilises swatches.",
        },
        {
          type: "text",
          id: "swatch_name",
          label: "Swatch Name",
        },
        {
          type: "color",
          id: "swatch_color",
          label: "Use a Swatch Color",
        },
        {
          type: "paragraph",
          content: "OR",
        },
        {
          type: "image_picker",
          id: "swatch_image",
          label: "Use a Swatch Image",
        },
        {
          type: "url",
          id: "swatch_link",
          label: "Swatch link",
        },
      ],
    },
  ],
};
