const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Activate Account",
  class: "o-row",
  enabled_on: {
    templates: ["customers/activate_account"],
  },
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
