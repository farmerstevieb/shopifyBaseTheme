/**
 * CTA Settings
 * - The global part used to generate consistent CTA
 *   settings. These aren't always required, and are probably most
 *   used when generating multiple_ctas,
 * -
 * Example:
 *  ...ctaSettings({
 *    multiple_ctas: true
 *  })
 */

module.exports = ({
  cta_spacing = true, // Enable/Disable the CTA Spacing settings
  cta_sizes = true, // Enable/Disable the CTA Sizes settings
  cta_alignment = false, // Enable/Disable the CTA Alignment settings (only necesssary when generating multiple_ctas)
  default_cta_size = "full", // The default CTA size on mobile viewports.
  default_cta_size_desktop = "medium", // The default CTA size on desktop viewports.
  default_cta_align = "vertical", // The default CTA alignment on mobile
  default_cta_align_desktop = "vertical", // The default CTA alignment on desktop.
} = {}) => {
  return [
    {
      type: "header",
      content: "CTA Settings",
    },
    cta_spacing && {
      type: "range",
      id: "cta_spacing",
      label: "CTA Spacing",
      min: 0,
      max: 48,
      default: 20,
      step: 4,
      unit: "px",
    },
    cta_spacing && {
      type: "range",
      id: "cta_spacing_desktop",
      label: "CTA Spacing on Desktop",
      min: 0,
      max: 48,
      default: 20,
      step: 4,
      unit: "px",
    },
    cta_sizes && {
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
      default: default_cta_size,
    },
    cta_sizes && {
      type: "select",
      id: "cta_sizes_desktop",
      label: "CTA Sizes on desktop",
      options: [
        { value: "standard", label: "Standard (180px)" },
        { value: "small", label: "Small (160px)" },
        { value: "medium", label: "Medium (246px)" },
        { value: "large", label: "Large (309px)" },
        { value: "full", label: "Full (100%)" },
      ],
      default: default_cta_size_desktop,
    },
    cta_alignment && {
      type: "select",
      id: "cta_align",
      label: "CTA Align",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
      default: default_cta_align,
    },
    cta_alignment && {
      type: "select",
      id: "cta_align_desktop",
      label: "CTA Align on desktop",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
      default: default_cta_align_desktop,
    },
  ].filter(Boolean);
};
