const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Divider",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [{ name: "Divider" }],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
  ],
};
