const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Main stocklist",
  class: "o-row",
  presets: [
    {
      name: "Main stocklist",
    },
  ],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      default_spacing: "lg",
    }),
  ],
};
