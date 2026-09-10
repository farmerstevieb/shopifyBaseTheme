const image = require("./parts/image");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Account Order",
  class: "o-row",
  enabled_on: {
    templates: ["customers/order"],
  },
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    {
      type: "checkbox",
      id: "show_sufio_invoice",
      label: "Show downloadable invoice link (requires the Sufio app)",
      info: "Only enable this if the Sufio invoicing app is installed on this store - the link is broken without it.",
      default: false,
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
