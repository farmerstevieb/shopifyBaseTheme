const sectionSettings = require("./parts/sectionSettings");

const icon = require("./parts/icon");

module.exports = {
  name: "Product information",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Product information",
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
          type: "estimated_delivery",
        },
        {
          type: "box_end",
        },
        {
          type: "buy_buttons",
        },
        {
          type: "description",
        },
        {
          type: "switch_tab",
        },
        {
          type: "sticky_button",
        },
      ],
    },
  ],
  settings: [
    {
      type: "checkbox",
      id: "enable_sticky_info",
      default: true,
      label: "Enable sticky content on desktop",
    },
    {
      type: "checkbox",
      id: "enable_media_sticker_mobile",
      default: false,
      label: "Enable Product Stickers on media - Mobile",
    },
    {
      type: "header",
      content: "Media",
      info: "Learn more about [media types.](https://help.shopify.com/manual/products/product-media)",
    },
    {
      type: "checkbox",
      id: "constrain_to_viewport",
      default: false,
      label: "Constrain media to screen height",
      info: "Forces media height to fit within viewport",
    },
    {
      type: "select",
      id: "media_fit",
      options: [
        {
          value: "contain",
          label: "Original",
        },
        {
          value: "cover",
          label: "Fill",
        },
      ],
      default: "contain",
      label: "Media fit",
    },
    {
      type: "select",
      id: "hide_variants",
      options: [
        {
          value: "",
          label: "Show all variants' media",
        },
        {
          value: "1",
          label: "Only show selected variants' media",
        },
        {
          value: "2",
          label: "Use alt to assign media to selected variants",
        },
      ],
      default: "",
      label: "Product variants' image",
      info: "Use to hide or show variants' image",
    },
    {
      type: "select",
      id: "image_zoom",
      options: [
        {
          value: "lightbox",
          label: "Open lightbox",
        },
        {
          value: "none",
          label: "No zoom",
        },
      ],
      default: "lightbox",
      label: "Image zoom",
    },

    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    {
      type: "page",
      id: "colour_guide_page",
      label: "Colour guide page",
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
      type: "body_start",
      name: "[---- Body start ----]",
      limit: 1,
    },
    {
      type: "body_end",
      name: "[---- Body end ----]",
      limit: 1,
    },
    {
      type: "divider",
      name: "---- Divider ----",
      settings: [
        {
          type: "select",
          id: "hidden",
          options: [
            {
              value: "",
              label: "None",
            },
            {
              value: "max-md:hidden",
              label: "Mobile",
            },
            {
              value: "md:hidden",
              label: "Desktop",
            },
          ],
          default: "",
          label: "Hidden on",
        },
      ],
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
      type: "sticky_button",
      name: "Sticky button",
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
      ],
    },
    {
      type: "estimated_delivery",
      name: "Estimated delivery",
      limit: 1,
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
      type: "usps",
      name: "USPs",
      limit: 1,
      settings: [
        {
          type: "text",
          id: "title_1",
          label: "1) Title",
        },
        {
          type: "image_picker",
          id: "image_1",
          label: "1) Image",
        },
        {
          type: "text",
          id: "title_2",
          label: "2) Title",
        },
        {
          type: "image_picker",
          id: "image_2",
          label: "2) Image",
        },
        {
          type: "text",
          id: "title_3",
          label: "3) Title",
        },
        {
          type: "image_picker",
          id: "image_3",
          label: "3) Image",
        },
      ],
    },
    {
      type: "description",
      name: "Description",
      limit: 1,
      settings: [
        {
          type: "select",
          id: "hidden",
          options: [
            {
              value: "",
              label: "None",
            },
            {
              value: "max-md:hidden",
              label: "Mobile",
            },
            {
              value: "md:hidden",
              label: "Desktop",
            },
          ],
          default: "",
          label: "Hidden on",
        },
        {
          type: "text",
          id: "title",
          default: "Description",
          info: "Include a heading that explains the content.",
          label: "Title",
        },
        ...icon(),
      ],
    },
    {
      type: "switch_tab",
      name: "Switch tab",
      limit: 1,
      settings: [
        {
          type: "select",
          id: "hidden",
          options: [
            {
              value: "",
              label: "None",
            },
            {
              value: "max-md:hidden",
              label: "Mobile",
            },
            {
              value: "md:hidden",
              label: "Desktop",
            },
          ],
          default: "",
          label: "Hidden on",
        },
        {
          type: "header",
          content: "First tab",
        },
        {
          type: "text",
          id: "first_tab_title",
          label: "Title",
          default: "Tab Title",
        },
        {
          type: "richtext",
          id: "first_tab_content",
          label: "Tab Content",
          info: "Defaults to product description, fill in this field or connect dynamic source to override",
        },
        {
          type: "header",
          content: "Second tab",
        },
        {
          type: "text",
          id: "second_tab_title",
          label: "Tab Content",
          default: "Description",
        },
        {
          type: "richtext",
          id: "second_tab_content",
          label: "Tab Content",
          info: "Defaults to product description, fill in this field or connect dynamic source to override",
        },
        {
          id: "page",
          type: "page",
          label: "Page",
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
      type: "popup",
      name: "Pop-up",
      settings: [
        {
          type: "select",
          id: "hidden",
          options: [
            {
              value: "",
              label: "None",
            },
            {
              value: "max-md:hidden",
              label: "Mobile",
            },
            {
              value: "md:hidden",
              label: "Desktop",
            },
          ],
          default: "",
          label: "Hidden on",
        },
        ...icon(),
        {
          type: "text",
          id: "text",
          label: "Title",
        },
        {
          id: "page",
          type: "page",
          label: "Page",
        },
      ],
    },

    {
      type: "share",
      name: "Share",
      limit: 1,
      settings: [
        {
          type: "text",
          id: "title",
          label: "Title",
          default: "Share on",
        },
        {
          type: "paragraph",
          content:
            "If you include a link in social media posts, the page's featured image will be shown as the preview image. [Learn more](https://help.shopify.com/manual/online-store/images/showing-social-media-thumbnail-images).",
        },
        {
          type: "paragraph",
          content:
            "A store title and description are included with the preview image. [Learn more](https://help.shopify.com/manual/promoting-marketing/seo/adding-keywords#set-a-title-and-description-for-your-online-store).",
        },
      ],
    },
    {
      type: "complementary",
      name: "Complementary products",
      limit: 1,
      settings: [
        {
          type: "text",
          id: "title",
          label: "Title",
          default: "Complete the package",
        },
        {
          type: "select",
          id: "implementation",
          label: "Implementation",
          options: [
            {
              value: "api",
              label: "API",
            },
            {
              value: "meta",
              label: "Metafields",
            },
          ],
          default: "api",
        },
        {
          type: "product_list",
          id: "products",
          label: "Products",
          limit: 10,
          info: "Use metafields to populate products instead of API",
        },
        {
          type: "range",
          id: "limit",
          min: 1,
          max: 10,
          step: 1,
          default: 2,
          label: "Maximum products to show",
        },
        {
          type: "paragraph",
          content:
            "To select complementary products, add the Search & Discovery app. [Learn more](https://help.shopify.com/manual/online-store/search-and-discovery/product-recommendations)",
        },
      ],
    },
    {
      type: "collapsible_tab",
      name: "Collapsible row",
      settings: [
        {
          type: "select",
          id: "hidden",
          options: [
            {
              value: "",
              label: "None",
            },
            {
              value: "max-md:hidden",
              label: "Mobile",
            },
            {
              value: "md:hidden",
              label: "Desktop",
            },
          ],
          default: "",
          label: "Hidden on",
        },
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
