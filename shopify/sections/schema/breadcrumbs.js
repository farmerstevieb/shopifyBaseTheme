const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Breadcrumbs",
  disabled_on: {
    groups: ["header", "footer"],
  },
  class: "o-row shopify-section--breadcrumbs",
  presets: [{ name: "Breadcrumbs" }],
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
};
