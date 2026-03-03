const spacing = require("./parts/spacing");
const content = require("./parts/content");
const image = require("./parts/image");
const video = require("./parts/video");

module.exports = {
  name: "Blog banner",
  class: "o-row",
  tag: "section",
  templates: ["blog"],
  presets: [
    {
      name: "Blog banner",
    },
  ],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    {
      type: "liquid",
      id: "show_if",
      label: "Render condition",
      info: "Advanced: use liquid condition to show/hide this section, return `true|empty` to show or `false` to hide.",
    },
    ...spacing(),
    ...content(),
    ...image(),
    ...video(),
  ],
};
