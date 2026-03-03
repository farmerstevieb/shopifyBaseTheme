const sectionHeader = require("./parts/section-header");
const sectionSettings = require("./parts/sectionSettings");
const cta = require("./parts/cta");
module.exports = {
  name: "Journal feed",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Journal feed",
      blocks: [
        {
          type: "section_header",
        },
        {
          type: "blog",
        },
      ],
    },
  ],
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
      type: "select",
      id: "slider_enabled",
      label: "Enable slider?",
      options: [
        {
          value: "false",
          label: "No",
        },
        {
          value: "true",
          label: "Yes",
        },
        {
          value: "(max-width: 768px)",
          label: "On mobile",
        },
        {
          value: "(min-width: 768px)",
          label: "On desktop",
        },
      ],
      default: "true",
    },
    {
      type: "range",
      id: "total_column",
      min: 2,
      max: 4,
      step: 1,
      label: "Number of colum on desktop",
      default: 3,
    },
    {
      type: "header",
      content: "Content spacing on mobile",
    },
    {
      type: "range",
      id: "subheading_spacing",
      label: "Subheading spacing",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "heading_spacing",
      label: "Heading spacing",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "overline_spacing",
      label: "Overline spacing",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "description_spacing",
      label: "Description spacing",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "header",
      content: "Content spacing on desktop",
    },
    {
      type: "range",
      id: "subheading_spacing_desktop",
      label: "Subheading spacing on desktop",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "heading_spacing_desktop",
      label: "Heading spacing on desktop",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "overline_spacing_desktop",
      label: "Overline spacing on desktop",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "range",
      id: "description_spacing_desktop",
      label: "Description spacing on desktop",
      min: 0,
      max: 48,
      default: 16,
      step: 4,
      unit: "px",
    },
    {
      type: "paragraph",
      content: "Settings for content and cta",
    },
    {
      type: "select",
      id: "position",
      label: "Position",
      options: [
        { value: "start", label: "Left" },
        { value: "center", label: "Center" },
        { value: "end", label: "Right" },
      ],
      default: "start",
    },
    {
      type: "select",
      id: "position_desktop",
      label: "Position on desktop",
      options: [
        { value: "", label: "as above" },
        { value: "start", label: "Left" },
        { value: "center", label: "Center" },
        { value: "end", label: "Right" },
      ],
      default: "",
    },
    {
      type: "select",
      id: "cta_sizes",
      label: "CTA Sizes",
      options: [
        { value: "standard", label: "Standard (180px)" },
        { value: "small", label: "Small (160px)" },
        { value: "medium", label: "Medium (246px)" },
        { value: "large", label: "Large (309px)" },
        { value: "full", label: "Full (100%)" },
      ],
      default: "standard",
    },
    {
      type: "select",
      id: "cta_sizes_dsk",
      label: "CTA Sizes on desktop",
      options: [
        { value: "standard", label: "Standard (180px)" },
        { value: "small", label: "Small (160px)" },
        { value: "medium", label: "Medium (246px)" },
        { value: "large", label: "Large (309px)" },
        { value: "full", label: "Full (100%)" },
      ],
      default: "standard",
    },
    ...cta({
      default_text: "Read more",
      url: false,
    }),
  ],
  blocks: [
    ...sectionHeader(),
    {
      type: "article",
      name: "Article",
      limit: 8,
      settings: [
        {
          type: "article",
          id: "article",
          label: "Select article",
        },
      ],
    },
    {
      type: "blog",
      name: "Blog",
      limit: 1,
      settings: [
        {
          type: "blog",
          id: "blog",
          label: "Select blog",
        },
        {
          type: "range",
          id: "limit",
          min: 2,
          max: 8,
          step: 1,
          label: "Number of posts to show",
          default: 3,
        },
      ],
    },
  ],
};
