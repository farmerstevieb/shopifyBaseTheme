const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Main reset password",
  class: "o-row",
  enabled_on: {
    templates: ["customers/reset_password"],
  },
  presets: [
    {
      name: "Main reset password",
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
