const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Loyalty Rewards",
  class: "o-row",
  templates: ["page"],
  presets: [
    {
      name: "Loyalty Rewards",
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
};
