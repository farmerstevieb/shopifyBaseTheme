const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Addresses",
  class: "o-row",
  templates: ["customers/addresses"],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      width: false,
      default_spacing: "lg"
    }),
  ],
  blocks: [],
};
