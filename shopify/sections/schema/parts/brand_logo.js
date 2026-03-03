const brand_colours = require("./brand_colours");

module.exports = ({
  id = "brand_logo",
  label = "Brand Logo",
  default_logo = "remi-cachet-logo-text-horizontal",
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
          value: "remi-cachet-logo",
          label: "Remi Cachet Logo Only",
        },
        {
          value: "remi-cachet-primary-logo",
          label: "Remi Cachet Primary Logo Only",
        },
        {
          value: "remi-cachet-primary-logo-dark",
          label: "Remi Cachet Primary Logo Dark Only",
        },
        {
          value: "remi-cachet-secondary-logo",
          label: "Remi Cachet Secondary Logo Only",
        },
        {
          value: "remi-cachet-logo-text-horizontal",
          label: "Remi Cachet Logo & Text (Horizontal)",
        },
        {
          value: "remi-cachet-logo-text-stacked",
          label: "Remi Cachet Logo & Text (Stacked)",
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
