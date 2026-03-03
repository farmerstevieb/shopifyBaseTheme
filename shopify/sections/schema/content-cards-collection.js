const content = require("./parts/content");
const image = require("./parts/image");
const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const aspectRatios = require("./parts/aspectRatios");

const video = require("./parts/video");

module.exports = {
  name: "Collection Cards",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Collection Cards",
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
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    ...aspectRatios(),
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "card",
      name: "Card",
      limit: 4,
      settings: [
        {
          type: "select",
          id: "card_layout",
          label: "Card Mobile Layout",
          options: [
            {
              value: "",
              label: "Media - Content",
            },
            {
              value: "max-lg:flex-col-reverse ",
              label: "Content - Media",
            }
          ],
          default: "",
        },
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
              value: "max-xmd:col-span-12",
              label: "Full",
            },
            {
              value: "max-xmd:col-span-8",
              label: "Two thirds",
            },
            {
              value: "max-xmd:col-span-6",
              label: "Half",
            },
            {
              value: "max-xmd:col-span-4",
              label: "One third",
            },
            {
              value: "max-xmd:col-span-3",
              label: "Quarter",
            },
          ],
          default: "max-xmd:col-span-6",
        },
        {
          type: "select",
          id: "width_desk",
          label: "Card width Desktop",
          options: [
            {
              value: "xmd:col-span-12",
              label: "Full",
            },
            {
              value: "xmd:col-span-8",
              label: "Two thirds",
            },
            {
              value: "xmd:col-span-6",
              label: "Half",
            },
            {
              value: "xmd:col-span-4",
              label: "One third",
            },
            {
              value: "xmd:col-span-3",
              label: "Quarter",
            },
          ],
          default: "xmd:col-span-6",
        },
        ...content({
          content_bullets: true,
          media_content_gap: true,
        }),
        ...image({
          hide_image: true
        }),
        ...video(),
      ],
    },
  ],
};
