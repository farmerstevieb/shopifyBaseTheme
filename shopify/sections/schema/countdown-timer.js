const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Countdown Timer",
  tag: "section",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Countdown Timer",
    },
  ],
  settings: [
    {
      type: "header",
      content: "Content",
    },
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Sale ends in",
    },
    {
      type: "text",
      id: "subheading",
      label: "Subheading",
    },
    {
      type: "text",
      id: "target_date",
      label: "Target date & time",
      info: "Format: YYYY-MM-DD HH:MM:SS (e.g. 2025-12-31 23:59:59). Uses store local time.",
      default: "2025-12-31 23:59:59",
    },
    {
      type: "checkbox",
      id: "show_after_expired",
      label: "Show section after countdown ends",
      info: "If unchecked, the section is hidden once the target date has passed.",
      default: false,
    },
    {
      type: "header",
      content: "Call to Action",
    },
    {
      type: "text",
      id: "cta_text",
      label: "Button text",
    },
    {
      type: "url",
      id: "cta_link",
      label: "Button link",
    },
    {
      type: "header",
      content: "Colors",
    },
    {
      type: "color",
      id: "background_color",
      label: "Background color",
      default: "#1a1a1a",
    },
    {
      type: "color",
      id: "text_color",
      label: "Text color",
      default: "#ffffff",
    },
    {
      type: "header",
      content: "Section Settings",
    },
    ...sectionSettings({
      default_spacing: "0",
      bg: false,
      text_color: false,
      width: false,
    }),
  ],
};
