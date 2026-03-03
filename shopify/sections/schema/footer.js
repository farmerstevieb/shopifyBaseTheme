const brand_logo = require("./parts/brand_logo");

module.exports = {
  name: "Footer",
  class: "o-row shopify-section--footer footer",
  tag: "footer",
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    {
      type: "color",
      id: "background_color",
      label: "Background color",
      default: "#222",
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
    {
      type: "header",
      content: "Content",
    },
    ...brand_logo(),
    {
      type: "header",
      content: "Footer - Columns",
    },
    {
      type: "link_list",
      id: "footer_menu",
      label: "Main Linklist",
      info: "Limited to child-links. Parent-links will be utilised as titles, and grandchild-links will not be displayed.",
    },
    {
      label: "Show Social Media Links?",
      type: "checkbox",
      id: "show_social",
      default: true,
    },
    {
      type: "header",
      content: "Footer - Bottom",
    },
    {
      type: "link_list",
      id: "footer_link_bottom",
      label: "Bottom Linklist",
    },
    {
      type: "inline_richtext",
      id: "footer_bottom_text",
      label: "Bottom Text",
      default:
        "Remi Cachet is a trading name of Additional Lengths Ltd. Registered in England. No. 06069925 - VAT No. 804146851",
    },
    {
      type: "header",
      content: "Custom payment logos",
    },
    {
      label: "Payment Logos",
      id: "payment_logos",
      type: "image_picker",
    },
    {
      type: "header",
      content: "Newsletter",
    },
    {
      label: "Show Newsletter?",
      type: "checkbox",
      id: "show_newsletter",
      default: true,
    },
    {
      label: "Use Klaviyo form",
      id: "use_klaviyo_form",
      type: "radio",
      options: [
        {
          value: "no",
          label: "No",
        },
        {
          value: "yes",
          label: "Yes",
        },
      ],
      default: "no",
    },
    {
      label: "Klaviyo form embed",
      id: "klaviyo_form_embed",
      type: "html",
    },
    {
      label: "Newsletter Title",
      type: "inline_richtext",
      id: "heading_newsletter",
      default: "Stay up to date with remi cachet",
    },
    {
      label: "Newsletter Text",
      type: "inline_richtext",
      id: "text_newsletter",
      default:
        "Sign up to our newsletter to stay up to date on the latest news, events and promotions at Remi Cachet.",
    },
    {
      type: "select",
      id: "button_style",
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
};
