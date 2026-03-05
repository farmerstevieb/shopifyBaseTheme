const {
  dialogSettings,
  dialogBlocks,
  dialogPresets,
} = require("./parts/dialog");
module.exports = {
  name: "Cart Drawer",
  tag: "section",
  class: "shopify-section--dialog-drawer-cart",
  ...dialogSettings(),
  ...dialogBlocks({
    header_controls_settings: [
      {
        type: "text",
        id: "title",
        label: "Title",
        default: "Your Bag",
      },
      {
        type: "text",
        id: "count_one_item_text",
        label: "Single Count Text",
        default: "item",
      },
      {
        type: "text",
        id: "count_multi_item_text",
        label: "Multi Count Text",
        default: "items",
      },
    ],
    blocks_header: [
      {
        type: "free-delivery",
        name: "Free delivery",
        limit: 1,
        settings: [
          {
            type: "paragraph",
            content:
              "The free delivery threshold can be updated in the global theme settings.",
          },
        ],
      },
    ],
    blocks_main: [
      {
        type: "cart-items",
        name: "Cart Items",
        limit: 1,
      },
      {
        type: "recommendations",
        name: "Recommendations",
        limit: 1,
        settings: [
          {
            type: "color",
            id: "container_background",
            label: "Container Background",
            default: "#F5F5F5",
          },
          {
            type: "color",
            id: "card_background",
            label: "Card Background",
            default: "#FFF",
          },
          {
            type: "select",
            id: "text_color",
            label: "Text Color",
            options: [
              {
                value: "text-white",
                label: "Light",
              },
              {
                value: "text-grey-10",
                label: "Dark",
              },
            ],
            default: "text-grey-10",
          },
          {
            type: "color",
            id: "quick_add_color",
            label: "Quick Add hover color",
          },
          {
            type: "product_list",
            id: "list",
            label: "Products",
            limit: 3,
          },
        ],
      },
    ],
    blocks_footer: [
      {
        type: "cart-totals",
        name: "Cart Totals",
        limit: 1,
      },
      {
        type: "delivery-countdown",
        name: "Delivery Countdown",
        limit: 1,
        settings: [
          {
            type: "paragraph",
            content:
              "The delivery countdown settings can be updated in the global theme settings.",
          },
        ],
      },
      {
        type: "submit-buttons",
        name: "Submit Buttons",
        limit: 1,
      },
    ],
  }),
  ...dialogPresets({
    presets_header: [
      {
        type: "free-delivery",
      },
    ],
    presets_main: [
      {
        type: "cart-items",
      },
      {
        type: "recommendations",
      },
    ],
    presets_footer: [
      {
        type: "cart-totals",
      },
      {
        type: "delivery-countdown",
      },
      {
        type: "submit-buttons",
      },
    ],
  }),
};
