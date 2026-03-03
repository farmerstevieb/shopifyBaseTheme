const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Account Order",
  class: "o-row",
  templates: ["customers/order"],
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
    {
      type: "media",
      name: "Media",
      limit: 1,
      settings: [
        {
          type: "checkbox",
          id: "mobile_hidden",
          label: "Hide on mobile?",
          default: true,
        },
        ...image(),
      ],
    },
  ],
};
