const brand_logo = require("./parts/brand_logo");
const icon = require("./parts/icon");

module.exports = {
  name: "Header",
  tag: "section",
  class: "o-row header js-header",
  enabled_on: {
    section_groups: ["header-group"],
  },
  settings: [
    {
      type: "header",
      content: "Content",
    },
    ...brand_logo({
      default_logo: "none",
    }),
    {
      type: "header",
      content: "Menu",
    },
    {
      type: "link_list",
      id: "main_menu",
      label: "Main menu",
      default: "main-menu",
    },
    {
      type: "header",
      content: "Trade button",
    },
    ...icon({
      id: "trade_button_icon",
      label: "Trade Icon",
      default_icon: "truck",
    }),
    {
      type: "select",
      id: "trade_button_style",
      label: "Button style",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "tertiary", label: "Tertiary" },
        { value: "quaternary", label: "Quaternary" },
        { value: "quinary", label: "Quinary" },
        { value: "senary", label: "Senary" },
        { value: "septenary", label: "Septenary" },
        { value: "octonary", label: "Octonary" },
        { value: "nonary", label: "Nonary" },
        { value: "solid", label: "Solid" },
        { value: "link", label: "Link" },
      ],
      default: "primary",
    },
  ],
  blocks: [
    {
      type: "mega_menu",
      name: "Mega menu",
      settings: [
        {
          type: "text",
          id: "parent",
          label: "Associated Navigation Item ",
          info: "Set this to the top-level link you want to associate this megamenu with, i.e. if you want it to appear when someone hovers over 'Hair Extensions', then enter 'Hair Extensions' e.g Womens (Ignore any additional accessors on the title, just enter what you see.)",
        },
        {
          type: "header",
          content: "Block 1",
        },
        {
          type: "image_picker",
          id: "image_1",
          label: "Image",
        },
        {
          type: "text",
          id: "title_1",
          label: "Title",
        },
        {
          type: "url",
          id: "link_1",
          label: "Link",
        },
        {
          type: "select",
          id: "size_1",
          label: "Size",
          options: [
            {
              value: "standard",
              label: "Standard",
            },
            {
              value: "wide",
              label: "Wide",
            },
          ],
          default: "standard",
        },
        {
          type: "header",
          content: "Block 2",
        },
        {
          type: "image_picker",
          id: "image_2",
          label: "Image",
        },
        {
          type: "text",
          id: "title_2",
          label: "Title",
        },
        {
          type: "url",
          id: "link_2",
          label: "Link",
        },
        {
          type: "select",
          id: "size_2",
          label: "Size",
          options: [
            {
              value: "standard",
              label: "Standard",
            },
            {
              value: "wide",
              label: "Wide",
            },
          ],
          default: "standard",
        },
        {
          type: "header",
          content: "Block 3",
        },
        {
          type: "image_picker",
          id: "image_3",
          label: "Image",
        },
        {
          type: "text",
          id: "title_3",
          label: "Title",
        },
        {
          type: "url",
          id: "link_3",
          label: "Link",
        },
        {
          type: "select",
          id: "size_3",
          label: "Size",
          options: [
            {
              value: "standard",
              label: "Standard",
            },
            {
              value: "wide",
              label: "Wide",
            },
          ],
          default: "standard",
        },
      ],
    },
  ],
};
