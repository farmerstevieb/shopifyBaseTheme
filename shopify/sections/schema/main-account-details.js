const spacing = require("./parts/spacing");

module.exports = {
  name: "Account Details",
  class: "o-row",
  enabled_on: {
    templates: ["page"],
  },
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...spacing({
      width: false,
      default_spacing: "lg"
    }),
  ],
  blocks: [
    {
      type: "@app",
    }
  ],
};
