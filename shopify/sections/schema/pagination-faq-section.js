const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "FAQs",
  class: "o-row",
  tag: "section",
  disabled_on: {
    groups: ["header", "footer"],
  },
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
      text_color: false,
    }),
    {
      type: "blog",
      id: "blog",
      label: "Select blog",
    },
    {
      type: "select",
      id: "limit",
      label: "Faqs per page",
      options: [
        {
          label: "4",
          value: "4",
        },
        {
          label: "8",
          value: "8",
        },
        {
          label: "16",
          value: "16",
        },
      ],
      default: "4",
    },
  ],
  presets: [
    {
      name: "Pagination FAQs",
    },
  ],
};
