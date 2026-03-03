/**
 * Aspect Ratios
 * - The global part used to set consistent aspect
 *   ratio options across the site.
 * -
 * Example:
 *  ...aspectRatios({
 *    default_ratio: 'square'
 8  }),
 *
 */

module.exports = ({ default_ratio = "square" } = {}) => {
  return [
    {
      type: "header",
      content: "Aspect Ratio Settings",
    },
    {
      type: "select",
      id: "image_aspect_ratio",
      label: "Image Aspect Ratio",
      options: [
        {
          value: "square",
          label: "Square",
        },
        {
          value: "mobile",
          label: "Mobile",
        },
        {
          value: "landscape",
          label: "Landscape",
        },
        {
          value: "custom",
          label: "Custom",
        },
      ],
      default: default_ratio,
    },
    {
      type: "text",
      id: "custom_image_aspect_ratio",
      label: "Custom Image Aspect Ratio",
      info: "(Advanced) Set a specific aspect ratio of choice in the format: '1 / 1', '2 / 3', etc. Requires the aspect ratio setting above to be set to 'Custom'",
    },
  ];
};
