const content = require("./parts/content");
const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

const video = require("./parts/video");

module.exports = {
  name: "Content cards - carousel",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Content cards - carousel",
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
      settings: [...content(), ...image(), ...video()],
    },
  ],
};
