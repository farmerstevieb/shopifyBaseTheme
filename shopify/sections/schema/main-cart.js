const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Cart",
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
      default_spacing: "0",
      text_color: false,
    }),
    {
      type: "header",
      content: "Summary Settings",
    },
    {
      type: "color",
      id: "summary_background_color",
      label: "Background color",
    },
    {
      type: "select",
      id: "summary_text_color",
      label: "Text Color",
      options: [
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" },
      ],
      default: "dark",
    },
    {
      type: "header",
      content: "Loyalty Link Settings",
    },
    {
      type: "text",
      id: "logged_in_link_text",
      label: "Logged in Link text",
      default: "View your Cachet Club account",
    },
    {
      type: "url",
      id: "logged_in_link",
      label: "Logged in Link",
    },
    {
      type: "text",
      id: "guest_link_text",
      label: "Guest Link text",
      default: "Log into your Cachet Club account",
    },
    {
      type: "url",
      id: "guest_link",
      label: "Guest Link",
    }
  ],
  blocks: [
    {
      type: "subtotal",
      name: "Subtotal",
      limit: 1,
    },
    {
      type: "loyalty-points",
      name: "Total Loyalty Points",
      limit: 1,
    },
    {
      type: "buttons",
      name: "Buttons",
      limit: 1,
      settings: [
        {
          type: "select",
          id: "checkout_button_style",
          label: "Button style",
          options: [
            {
              value: "primary",
              label: "Primary",
            },
            {
              value: "secondary",
              label: "Secondary",
            },
            {
              value: "tertiary",
              label: "Tertiary",
            },
            {
              value: "solid",
              label: "Solid",
            },
            {
              value: "link",
              label: "Link",
            },
          ],
          default: "primary",
        },
      ],
    },
    {
      type: "free_delivery",
      name: "Free delivery",
      limit: 1,
    },
    {
      type: "text",
      name: "Text",
      settings: [
        {
          type: "richtext",
          id: "text",
          label: "Text",
        },
      ],
    },
    {
      type: "@app",
    },
  ],
};
