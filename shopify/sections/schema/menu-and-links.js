const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Menu & Link",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Menu & Link",
    },
  ],
  settings: [
    {
      type: "link_list",
      id: "main_menu",
      label: "Main menu",
      default: "main-menu",
    },
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
