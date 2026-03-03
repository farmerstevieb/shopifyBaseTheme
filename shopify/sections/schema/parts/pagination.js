/**
 * Pagination
 * - The global part used to set consistent pagination
 *   settings across the site.
 * -
 * Example:
 *  ...pagination(),
 *
 */

module.exports = ({ default_pagination_amount = 9 } = {}) => {
  return [
    {
      type: "header",
      content: "Pagination Settings",
    },
    {
      type: "number",
      id: "pagination_amount",
      label: "Pagination Amount",
      info: "Changes the amount of paginatable items per page",
      default: default_pagination_amount,
    },
    {
      type: "select",
      id: "pagination_style",
      label: "Pagination Style",
      options: [
        {
          value: "text",
          label: "Pages",
        },
        {
          value: "dynamic",
          label: "Load More",
        },
      ],
      default: "text",
    },
  ];
};
