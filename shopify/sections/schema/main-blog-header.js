const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Blog title & tags",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
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
};
