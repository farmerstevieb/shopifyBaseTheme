module.exports = ({
  hide_image = false,

} = {}) => {
  return [
    {
      type: "header",
      content: "Image",
    },
    {
      type: "image_picker",
      id: "image",
      label: "Image",
    },
    {
      type: "image_picker",
      id: "image_mobile",
      label: "Mobile override",
    },
    {
      type: "select",
      id: "image_fit",
      label: "Fit",
      options: [
        {
          value: "cover",
          label: "Cover",
        },
        {
          value: "contain",
          label: "Contain",
        },
      ],
      default: "cover",
    },
    hide_image && {
      label: "Hide media on mobile?",
      type: "checkbox",
      id: "hide_mobile_media",
      default: false,
    }
  ].filter(Boolean);
};
