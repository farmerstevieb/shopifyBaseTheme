const content = require("./content");

module.exports = ({
  info = "The section's header.",
  content_settings = {
    default_content_width: 0,
    default_heading_size_mob: "2xl",
    default_heading_size_dsk: "",
    content_align: true,
  },
  additional_settings = [],
} = {}) => {
  return [
    {
      type: "section_header",
      name: "Section Header",
      limit: 1,
      settings: [
        {
          type: "header",
          content: "Section Header",
          info: info,
        },
        ...additional_settings,
        ...content(content_settings),
      ],
    },
  ].filter(Boolean);
};
