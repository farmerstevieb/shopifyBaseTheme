module.exports = ({
  spacing = true,
  padding = true,
  bg = true,
  default_max_width = 0,
} = {}) => {
  return [
    spacing && {
      type: "select",
      id: "spacing",
      label: "Spacing",
      options: [
        { value: "0", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      default: "lg",
    },
    spacing && {
      type: "select",
      id: "spacing_desktop",
      label: "Spacing on desktop",
      options: [
        { value: "0", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      default: "lg",
    },
    padding && {
      type: "select",
      id: "padding",
      label: "Width",
      options: [
        {
          value: "full",
          label: "Full",
        },
        {
          value: "contained",
          label: "Contained",
        },
        {
          value: "padded",
          label: "Padded", // TODO: Find better name
        },
      ],
      default: "contained",
    },
    {
      type: "checkbox",
      id: "apply_content",
      label: "Apply max-width to content only?",
      default: false
    },
    {
      type: "number",
      id: "section_max_width",
      label: "Section Max Width (px)",
      info: "Setting this value to 0 will set no max width.",
      default: default_max_width,
    },
    bg && {
      type: "color",
      id: "background_color",
      label: "Background color",
    },
  ].filter(Boolean);
};
