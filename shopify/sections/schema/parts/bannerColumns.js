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
          ...slide_settings,
          ...overlay(),
          ...shopTheLook(),

          {
            type: "header",
            content: "Content Column",
          },
          {
            type: "text",
            id: "order_3",
            label: "Column order",
          },
          ...content({
            spread_content: true,
            default_content_width: 350,
            multiple_ctas: false,
            default_heading: "Heading",
          }),
          {
            type: "header",
            content: "Image Columns",
          },
          {
            type: "header",
            content: "Image 1",
          },
          {
            type: "text",
            id: "order_1",
            label: "Column order",
          },
          {
            type: "image_picker",
            id: "image_1",
            label: "Image",
          },
          {
            type: "image_picker",
            id: "image_mobile_1",
            label: "Mobile override",
          },
          {
            type: "select",
            id: "image_fit_1",
            label: "Fit",
            options: [
              {
                value: "cover",
                label: "Cover",
              },
              {
                value: "contain",
                label: "Contain",
              },
            ],
            default: "cover",
          },
          {
            type: "header",
            content: "Video 1",
          },
          {
            type: "video",
            id: "video_file_1",
            label: "Hosted video",
            info: "A Shopify-hosted video",
          },
          {
            type: "video_url",
            id: "video_url_1",
            accept: ["youtube", "vimeo"],
            label: "Youtube/Vimeo hosted video",
          },
          {
            type: "checkbox",
            id: "video_autoplay_1",
            label: "Autoplay",
            default: true,
          },
          {
            type: "checkbox",
            id: "video_muted_1",
            label: "Muted",
            default: true,
          },
          {
            type: "header",
            content: "Image 2",
          },
          {
            type: "text",
            id: "order_2",
            label: "Column order",
          },
          {
            type: "image_picker",
            id: "image_2",
            label: "Image",
          },
          {
            type: "image_picker",
            id: "image_mobile_2",
            label: "Mobile override",
          },
          {
            type: "select",
            id: "image_fit_2",
            label: "Fit",
            options: [
              {
                value: "cover",
                label: "Cover",
              },
              {
                value: "contain",
                label: "Contain",
              },
            ],
            default: "cover",
          },
          {
            type: "header",
            content: "Video 2",
          },
          {
            type: "video",
            id: "video_file_2",
            label: "Hosted video",
            info: "A Shopify-hosted video",
          },
          {
            type: "video_url",
            id: "video_url_2",
            accept: ["youtube", "vimeo"],
            label: "Youtube/Vimeo hosted video",
          },
          {
            type: "checkbox",
            id: "video_autoplay_2",
            label: "Autoplay",
            default: true,
          },
          {
            type: "checkbox",
            id: "video_muted_2",
            label: "Muted",
            default: true,
          },
        ],
      },
    ],
  };
};
