const icon = require("./parts/icon");
const brand_colours = require("./parts/brand_colours");
const userRestriction = require("./parts/user-restriction");

module.exports = {
  name: "Promo Bar",
  tag: "section",
  enabled_on: {
    groups: ["header"],
  },
  class: "o-row z-promo-bar sticky top-0 promo-bar js-promo-bar",
  presets: [{ name: "Promo Bar" }],
  limit: 1,
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    {
      type: "select",
      id: "desktop_columns",
      label: "Desktop Columns",
      options: [
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
        {
          label: "3",
          value: "3",
        },
      ],
      default: "2",
    },
    {
      type: "header",
      content: "Restriction Settings",
    },
    ...userRestriction()
  ],
  blocks: [
    {
      type: "promo_text",
      name: "Promo text",
      settings: [
        {
          type: "header",
          content: "Content",
        },
        ...icon({
          default_icon: 'none'
        }),
        {
          type: "select",
          id: "icon_position",
          label: "Icon Position",
          default: "left",
          options: [
            {
              value: "left",
              label: "Icon | Text",
            },
            {
              value: "right",
              label: "Text | Icon",
            },
          ],
        },
        {
          type: "inline_richtext",
          id: "text_desktop",
          label: "Text (Desktop)",
        },
        {
          type: "inline_richtext",
          id: "text_mobile",
          label: "Text (Mobile)"
        },
        {
          type: "url",
          id: "link",
          label: "Link",
          info: "Applies a link to the entire area of the promo bar."
        },
        {
          type: "header",
          content: "Colors",
        },
        {
          type: "paragraph",
          content: "Background",
        },
        ...brand_colours("bg_color_brand", "Background Colour (Brand)", "#fad9e4"),
        {
          type: "color",
          id: "bg_color_custom",
          label: "Background Color (Custom)",
        },
        {
          type: "paragraph",
          content: "Text",
        },
        {
          type: "select",
          id: "text_color",
          label: "Text color",
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ],
          default: "dark",
        },
      ],
    },
  ],
};
