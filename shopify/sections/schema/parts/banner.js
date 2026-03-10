/**
 * Part - Banner
 * ---------------
 * Usage:
 * A schema part that can be used as the basis
 * for various banner sections, objects like 'section_settings'
 * and 'slide_settings' can be used to add additional settings
 * inside of schema files.
 */

const content = require("./content");
const image = require("./image");
const overlay = require("./overlay");
const sectionSettings = require("./sectionSettings");
const video = require("./video");
const slider = require("./slider");
const shopTheLook = require("./shopTheLook");

module.exports = ({
  name = "Banner",
  classes = "o-row",
  section_settings = [],
  slide_settings = [],
  mobile_sources = false,
  multiple_ctas = false,
} = {}) => {
  return {
    name: name,
    class: classes,
    tag: "section",
    disabled_on: {
      groups: ["header"],
    },
    presets: [
      {
        name: name,
        blocks: [
          {
            type: "slide",
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
        type: "text",
        id: "banner_ratio",
        label: "Image Ratio",
        info: "Enter the width and height in width / height format .e.g: 414 / 394",
      },
      {
        type: "text",
        id: "banner_ratio_dsk",
        label: "Image Ratio on desktop",
        info: "Enter the width and height in width / height format .e.g: 1424 / 576",
      },
      ...slider(),
      ...section_settings,
    ],
    blocks: [
      {
        type: "slide",
        name: "Slide",
        settings: [
          ...content({
            spread_content: true,
            default_content_width: 350,
            multiple_ctas: multiple_ctas,
            default_heading: "Heading",
          }),
          ...slide_settings,
          ...image(),
          ...video(mobile_sources),
          ...shopTheLook(),
          ...overlay(),
        ],
      },
    ],
  };
};
