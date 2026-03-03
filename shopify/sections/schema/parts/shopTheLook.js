module.exports = () => {
  return [
    {
      type: "header",
      content: "Shop The Look",
    },
    {
      type: "product_list",
      id: "stl_products",
      label: "Select",
      limit: 4,
    },
    {
      type: "text",
      id: "stl_title",
      label: "Title",
    },
    {
      type: "select",
      id: "stl_position",
      label: "Position",
      options: [
        { value: "bottom-left", label: "Bottom Left" },
        { value: "bottom-right", label: "Bottom Right" },
      ],
      default: "bottom-left",
    },
  ];
};
