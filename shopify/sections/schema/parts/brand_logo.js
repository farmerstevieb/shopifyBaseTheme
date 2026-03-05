const brand_colours = require("./brand_colours");

module.exports = ({
  id = "brand_logo",
  label = "Brand Logo",
  default_logo = "none",
} = {}) => {
  return [
    {
      type: "select",
      id: id,
      label: label,
      default: default_logo,
      options: [
        {
          value: "none",
          label: "None",
        },
        {
          value: "logo",
          label: "Logo Only",
        },
        {
          value: "primary-logo",
          label: "Primary Logo Only",
        },
        {
          value: "primary-logo-dark",
          label: "Primary Logo Dark Only",
        },
        {
          value: "secondary-logo",
          label: "Secondary Logo Only",
        },
        {
          value: "logo-text-horizontal",
          label: "Logo & Text (Horizontal)",
        },
        {
          value: "logo-text-stacked",
          label: "Logo & Text (Stacked)",
        },
      ],
    },
    ...brand_colours("logo_colour", "Logo Colour", "#EB80A8"),
    ...brand_colours("word_one_colour", "Word #1 Colour", "#E6417A"),
    ...brand_colours("word_two_colour", "Word #2 Colour", "#EB80A8"),
    {
      type: "paragraph",
      content: "- OR -",
    },
    {
      type: "image_picker",
      id: "brand_image",
      label: "Brand Image",
    },
    {
      type: "range",
      id: `${id}_max_height_mobile`,
      min: 0,
      max: 96,
      step: 2,
      unit: "px",
      label: "Brand Logo (Mobile Height)",
      default: 32,
    },
    {
      type: "range",
      id: `${id}_max_height_desktop`,
      min: 0,
      max: 96,
      step: 2,
      unit: "px",
      label: "Brand Logo (Desktop Height)",
      default: 20,
    },
  ];
};
