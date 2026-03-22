const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Testimonials",
  class: "o-row",
  tag: "section",
  disabled_on: {
    groups: ["header", "footer"],
  },
  settings: [
    ...sectionSettings({
      default_spacing: "lg",
      text_color: false,
    }),
    {
      type: "header",
      content: "Testimonials Settings",
    },
    {
      type: "range",
      id: "columns_per_view",
      label: "Columns per view (desktop)",
      min: 1,
      max: 3,
      step: 1,
      default: 2,
      info: "Number of testimonials visible at once on desktop.",
    },
    {
      type: "checkbox",
      id: "autoplay",
      label: "Autoplay slider",
      default: false,
    },
    {
      type: "range",
      id: "autoplay_speed",
      label: "Autoplay speed",
      min: 2,
      max: 10,
      step: 1,
      unit: "s",
      default: 5,
      info: "Only applies when autoplay is enabled.",
    },
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "testimonial",
      name: "Testimonial",
      limit: 12,
      settings: [
        {
          type: "richtext",
          id: "quote",
          label: "Quote",
          default: "<p>This product changed my life. Absolutely love it!</p>",
        },
        {
          type: "text",
          id: "author",
          label: "Author name",
          default: "Happy Customer",
        },
        {
          type: "text",
          id: "author_title",
          label: "Author title / location",
          placeholder: "e.g. Verified buyer",
        },
        {
          type: "range",
          id: "rating",
          label: "Star rating",
          min: 1,
          max: 5,
          step: 1,
          default: 5,
        },
        {
          type: "image_picker",
          id: "avatar",
          label: "Author avatar (optional)",
        },
      ],
    },
  ],
  presets: [
    {
      name: "Testimonials",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "testimonial",
        },
        {
          type: "testimonial",
        },
        {
          type: "testimonial",
        },
      ],
    },
  ],
};
