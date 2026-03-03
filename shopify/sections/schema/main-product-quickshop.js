const icon = require("./parts/icon");
const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Product Quick Shop",
  tag: "div",
  class: "shopify-section--product-quickshop",
  presets: [
    {
      name: "Product Quick Shop",
      blocks: [
        {
          type: "stickers",
        },
        {
          type: "header_start",
        },
        {
          type: "title",
        },
        {
          type: "price",
        },
        {
          type: "header_end",
        },
        {
          type: "box_start",
        },
        {
          type: "variant_picker",
        },
        {
          type: "quantity_selector",
        },
        {
          type: "box_end",
        },
        {
          type: "buy_buttons",
        },
      ],
    },
  ],
  settings: [
    ...sectionSettings({
      spacing: false,
      padding: false,
      width: false,
    }),
    {
      type: "header",
      content: "Media",
      info: "Learn more about [media types.](https://help.shopify.com/manual/products/product-media)",
    },
    {
      type: "checkbox",
      id: "hide_variants",
      default: false,
      label: "Hide other variants’ media after selecting a variant",
    },
    {
      type: "checkbox",
      id: "hide_variants_by_alt",
      default: false,
      label: "Use alt to assign media to product variants",
    },
  ],
  blocks: [
    {
      type: "@app",
    },
    {
      type: "box_start",
      name: "[---- Box start ----]",
      limit: 1,
    },
    {
      type: "box_end",
      name: "[---- Box end ----]",
      limit: 1,
    },
    {
      type: "header_start",
      name: "[---- Header start ----]",
      limit: 1,
    },
    {
      type: "header_end",
      name: "[---- Header end ----]",
      limit: 1,
    },
    {
      type: "divider",
      name: "---- Divider ----",
      settings: [],
    },
    {
      type: "stickers",
      name: "Stickers",
      limit: 1,
      settings: [
        {
          type: "paragraph",
          content:
            "To display sticker badges, add a tag that starts with `badge_` e.g. `badge_Hello World` to the product.",
        },
      ],
    },
    {
      type: "title",
      name: "Title",
      limit: 1,
    },
    {
      type: "price",
      name: "Price",
      limit: 1,
    },
    {
      type: "variant_picker",
      name: "Variant picker",
      limit: 1,
      settings: [
        {
          type: "select",
          id: "picker_type_default",
          label: "Default type",
          options: [
            {
              value: "button",
              label: "Button",
            },
          ],
          default: "button",
        },
        {
          type: "text",
          id: "picker_type_swatch",
          label: "Swatch type",
          default: "color, colour",
          info: "Selected variant options to display as swatch, comma separated list of option names.",
        },
        {
          type: "header",
          content: "Size guide",
        },
        {
          type: "page",
          id: "size_guide_page",
          label: "Size guide page",
        },
      ],
    },
    {
      type: "buy_buttons",
      name: "Buy buttons",
      limit: 1,
      settings: [
        {
          type: "checkbox",
          id: "show_dynamic_checkout",
          default: false,
          label: "Show dynamic checkout buttons",
          info: "Using the payment methods available on your store, customers see their preferred option, like PayPal or Apple Pay. [Learn more](https://help.shopify.com/manual/using-themes/change-the-layout/dynamic-checkout)",
        },
      ],
    },
    {
      type: "quantity_selector",
      name: "Quantity selector",
      limit: 1,
    },
    {
      type: "description",
      name: "Description",
      limit: 1,
      settings: [
        {
          type: "text",
          id: "title",
          label: "Title",
          default: "Description",
        },
        {
          type: "richtext",
          id: "text",
          label: "Text",
          info: "Defaults to product description, fill in this field or connect dynamic source to override",
        },
      ],
    },

    {
      type: "text",
      name: "Text",
      limit: 1,
      settings: [
        {
          type: "text",
          id: "title",
          label: "Title",
        },
        {
          type: "richtext",
          id: "text",
          label: "Text",
        },
      ],
    },
    {
      type: "custom_liquid",
      name: "Custom liquid",
    },
    {
      type: "collapsible_tab",
      name: "Collapsible row",
      settings: [
        {
          type: "text",
          id: "title",
          default: "Collapsible row",
          info: "Include a heading that explains the content.",
          label: "Title",
        },
        ...icon(),
        {
          type: "richtext",
          id: "text",
          label: "Row content",
        },
        {
          type: "checkbox",
          id: "use_description",
          default: false,
          label: "Use product description",
        },
        {
          type: "page",
          id: "page",
          label: "Row content from page",
        },
      ],
    },
  ],
};
