const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

const video = require("./parts/video");

module.exports = {
  name: "Bundle hotspots",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Bundle hotspots",
      blocks: [
        {
          type: "section_header",
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
      type: "select",
      id: "layout",
      label: "Layout",
      options: [
        {
          value: "auto",
          label: "Image | Products",
        },
        {
          value: "reversed",
          label: "Products | Image",
        },
      ],
      default: "auto",
    },
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "media",
      name: "Media",
      limit: 1,
      settings: [...image(), ...video()],
    },
    {
      type: "product",
      name: "Product",
      limit: 4,
      settings: [
        {
          type: "product",
          id: "product",
          label: "Product",
        },
        {
          type: "paragraph",
          content: "Marker",
        },
        {
          type: "checkbox",
          id: "show_marker",
          label: "Show media marker",
          default: true,
        },
        {
          type: "range",
          id: "marker_x",
          default: 30,
          min: 0,
          max: 100,
          label: "Horizontal position",
          unit: "%",
        },
        {
          type: "range",
          id: "marker_y",
          default: 40,
          min: 0,
          max: 100,
          label: "Vertical position",
          unit: "%",
        },
      ],
    },
  ],
};
