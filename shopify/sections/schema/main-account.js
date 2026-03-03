const sectionSettings = require("./parts/sectionSettings");
const ctaSettings = require("./parts/ctaSettings");
const cta = require("./parts/cta");

module.exports = {
  name: "Account",
  class: "o-row",
  templates: ["customers/account"],
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    ...ctaSettings({
      cta_alignment: true,
      cta_spacing: false,
    }),
    ...cta({
      default_text: "",
      default_icon: "none",
    }),
  ],
  blocks: [],
};
