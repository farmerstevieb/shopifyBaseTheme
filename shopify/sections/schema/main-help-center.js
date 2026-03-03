const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Help center",
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
    {
      type: "text",
      id: "author",
      label: "Author assigned to Help Center article",
      default: "Help Centre",
    },
    {
      type: "range",
      id: "limit",
      min: 1,
      max: 18,
      step: 1,
      label: "Number of FAQs to show on one page",
      default: 10,
    },
  ],
};
