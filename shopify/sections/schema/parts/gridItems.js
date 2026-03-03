/**
 * Grid Items
 * - The global part used across sections to generate
 *   consistent grid items settings.
 * -
 * Example:
 *  ...gridItems({
 *    item_title: "Collections"
 *  })
 */

module.exports = ({
  item_title = "Items",
  mobile_items_pr = ["1", "2"],
  mobile_default = "2",
  tablet_items_pr = ["2", "3"],
  tablet_default = "3",
  desktop_items_pr = ["3", "4", "5"],
  desktop_default = "3",
  xl_desktop_items_pr = ["3", "4", "5"],
  xl_desktop_default = "4",
} = {}) => {
  return [
    {
      type: "select",
      id: "mob_per_row",
      label: `${item_title} Per Row (Mobile / SM)`,
      info: "Screen Width: < 767px",
      options: mobile_items_pr.map((integer) => ({
        value: integer,
        label: integer,
      })),
      default: mobile_default,
    },
    {
      type: "select",
      id: "tab_per_row",
      label: `${item_title} Per Row (Tablet / MD)`,
      info: "Screen Width: 768px > 1023px",
      options: tablet_items_pr.map((integer) => ({
        value: integer,
        label: integer,
      })),
      default: tablet_default,
    },
    {
      type: "select",
      id: "dsk_per_row",
      label: `${item_title} Per Row (Desktop / LG)`,
      info: "Screen Width: 1025px >",
      options: desktop_items_pr.map((integer) => ({
        value: integer,
        label: integer,
      })),
      default: desktop_default,
    },
    {
      type: "select",
      id: "xl_dsk_per_row",
      label: `${item_title} Per Row (Large Desktop / XL)`,
      info: "Screen Width: 1280px >",
      options: xl_desktop_items_pr.map((integer) => ({
        value: integer,
        label: integer,
      })),
      default: xl_desktop_default,
    },
  ].filter(Boolean);
};
