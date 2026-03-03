/**
 * Grid Spacing
 * - The global part used across sections to generate
 *   consistent grid spacing settings.
 * -
 * Example:
 *  ...gridSpacing()
 */

module.exports = () => {
  return [
    {
      type: "header",
      content: "Grid Spacing",
    },
    {
      type: "range",
      id: "mob_gap_x",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Spacing - X Axis (Mobile)",
      info: "Screen Width: < 767px",
    },
    {
      type: "range",
      id: "mob_gap_y",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Sacing - Y Axis (Mobile)",
      info: "Screen Width: < 767px",
    },
    {
      type: "range",
      id: "tab_gap_x",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Spacing - X Axis (Tablet)",
      info: "Screen Width: 768px > 1023px",
    },
    {
      type: "range",
      id: "tab_gap_y",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Spacing - Y Axis (Tablet)",
      info: "Screen Width: 768px > 1023px",
    },
    {
      type: "range",
      id: "dsk_gap_x",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Spacing - X Axis (Desktop)",
      info: "Screen Width: 1025px >",
    },
    {
      type: "range",
      id: "dsk_gap_y",
      min: 4,
      max: 36,
      step: 4,
      default: 4,
      label: "Spacing - Y Axis (Desktop)",
      info: "Screen Width: 1025px >",
    },
    {
      type: "range",
      id: "xl_dsk_gap_x",
      min: 4,
      max: 36,
      step: 4,
      default: 24,
      label: "Spacing - X Axis (XL Desktop)",
      info: "Screen Width: 1280px >",
    },
    {
      type: "range",
      id: "xl_dsk_gap_y",
      min: 4,
      max: 36,
      step: 4,
      default: 36,
      label: "Spacing - Y Axis (XL Desktop)",
      info: "Screen Width: 1280px >",
    },
  ].filter(Boolean);
};
