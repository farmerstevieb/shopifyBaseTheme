const sectionSettings = require("./parts/sectionSettings");
const content = require("./parts/content");

module.exports = {
  name: "Banner collage",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [{ name: "Banner collage" }],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
      text_color: false,
    }),
    {
      type: "select",
      id: "section_position",
      label: "Section Position",
      options: [
        {
          label: "Left",
          value: "left",
        },
        {
          label: "Right",
          value: "right",
        },
      ],
      default: "left",
    },
  ],
  max_blocks: 3,
  blocks: [
    {
      name: "Item",
      type: "item",
      settings: [
        {
          type: "header",
          content: "Media",
        },
        {
          type: "image_picker",
          id: "desktop_image",
          label: "Desktop Image",
        },
        {
          type: "image_picker",
          id: "mobile_image",
          label: "Mobile Image",
        },
        {
          type: "header",
          content: "Content",
        },
        ...content(),
      ],
    },
  ],
};
