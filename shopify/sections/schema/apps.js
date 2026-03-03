const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "App wrapper",
  tag: "section",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [{ name: "App wrapper" }],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    {
      type: "range",
      id: "content_width",
      min: 400,
      max: 1680,
      step: 20,
      default: 800,
      unit: "px",
      label: "Content width",
    },
  ],
  blocks: [
    {
      type: "@app",
    },
  ],
};
