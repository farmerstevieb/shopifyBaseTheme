const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Main page",
  class: "o-row",
  templates: ["page", "password"],
  presets: [
    {
      name: "Main page",
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
