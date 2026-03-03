const content = require("./parts/content");
const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const overlay = require("./parts/overlay");

const video = require("./parts/video");
const slider = require("./parts/slider");

module.exports = {
  name: "Banner Grid - Carousel",
  class: "o-row shopify-section--banner-grid-carousel",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Banner Grid - Carousel",
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
      type: "header",
      content: "Settings",
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
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
      text_color: false,
    }),
    {
      type: "liquid",
      id: "show_if",
      label: "Render condition",
      info: "Advanced: use liquid condition to show/hide this section, return `true|empty` to show or `false` to hide.",
    },
    ...slider({
      dots_colour: "#000",
    }),
    {
      label: "Show Overlay",
      type: "checkbox",
      id: "show_overlay",
      default: false,
    },
    ...overlay(),
  ],
  blocks: [
    ...sectionHeader({
      content_settings: {
        default_heading: "Header",
        default_content_width: 600,
      },
    }),
    {
      type: "card",
      name: "Card",
      settings: [
        ...content({
          default_cta_size: "full",
        }),
        ...image(),
        ...video(),
      ],
    },
  ],
};
