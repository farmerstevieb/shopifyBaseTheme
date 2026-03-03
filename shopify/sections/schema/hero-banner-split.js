const usp = require("./parts/usp");
const banner = require("./parts/banner");
const brand_colours = require("./parts/brand_colours");

module.exports = {
  ...banner({
    name: "Banner (Hero - Split)",
    classes: "o-row shopify-section--banner-hero-split",
    slide_settings: [
      ...usp({
        generate: 4,
      }),
      {
        type: "header",
        content: "Position Settings",
      },
      {
        type: "select",
        id: "mobile_media_position",
        label: "Mobile Media Position",
        options: [
          {
            label: "Media First",
            value: "media_first",
          },
          {
            label: "Text First",
            value: "text_first",
          },
        ],
        default: "media_first",
      },
      {
        type: "header",
        content: "Colours",
      },
      ...brand_colours("bg_content", "Content Background Colour", "#fad9e4"),
    ],
    slider_settings: {
      has_arrows: false,
    },
  }),
};
