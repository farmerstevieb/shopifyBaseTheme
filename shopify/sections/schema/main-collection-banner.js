const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Collection banner",
  class: "o-row",
  tag: "section",
  enabled_on: {
    templates: ["collection"],
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
      type: "paragraph",
      content:
        "Add a description or image by editing your collection. [Learn more](https://help.shopify.com/manual/products/collections/collection-layout)",
    },
    {
      type: "checkbox",
      id: "show_collection_description",
      default: true,
      label: "Show collection description",
    },
    {
      type: "range",
      id: "content_width",
      min: 200,
      max: 800,
      step: 50,
      default: 300,
      label: "Content width",
      info: "Width of the content area in pixels",
    },
    {
      type: "range",
      id: "description_spacing",
      min: 0,
      max: 50,
      step: 2,
      default: 16,
      label: "Description spacing (mobile)",
      info: "Spacing between collection title and description on mobile (in pixels)",
    },
    {
      type: "range",
      id: "description_spacing_desktop",
      min: 0,
      max: 60,
      step: 2,
      default: 20,
      label: "Description spacing (desktop)",
      info: "Spacing between collection title and description on desktop (in pixels)",
    },
    {
      type: "checkbox",
      id: "enable_read_more",
      default: false,
      label: "Enable read more functionality",
      info: "Show truncated description with read more/read less toggle",
    },
    {
      type: "range",
      id: "max_lines",
      min: 1,
      max: 30,
      step: 1,
      default: 3,
      label: "Maximum lines",
      info: "Number of lines to show before truncating",
    },
    {
      type: "checkbox",
      id: "show_collection_image",
      default: true,
      label: "Show collection image",
      info: "For best results, use an image with a 4:3 aspect ratio. [Learn more](https://help.shopify.com/manual/shopify-admin/productivity-tools/image-editor#understanding-image-aspect-ratio)",
    },
    {
      type: "text",
      id: "image_height",
      label: "Image Ratio",
      info: "Enter the width and height in width / height format .e.g: 1424 / 576",
    },
  ],
  presets: [
    {
      name: "Collection banner",
    },
  ],
};
