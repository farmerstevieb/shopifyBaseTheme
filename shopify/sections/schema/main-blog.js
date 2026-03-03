const sectionSettings = require("./parts/sectionSettings");

module.exports = {
  name: "Blog posts",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  settings: [
    {
      type: "header",
      content: "Settings",
    },
    ...sectionSettings({
      width: false,
      default_spacing: "0",
    }),
    {
      type: "header",
      content: "Content",
    },
    {
      type: "select",
      id: "layout",
      options: [
        {
          value: "grid",
          label: "Grid",
        },
        {
          value: "collage",
          label: "Collage",
        },
      ],
      default: "collage",
      label: "Layout",
      info: "Posts are stacked on mobile.",
    },
    {
      type: "range",
      id: "limit",
      min: 1,
      max: 18,
      step: 1,
      label: "Number of posts to show on one page",
      default: 11,
    },
    {
      type: "checkbox",
      id: "show_image",
      default: true,
      label: "Show featured image",
    },
    {
      type: "checkbox",
      id: "show_date",
      default: true,
      label: "Show date",
    },
    {
      type: "checkbox",
      id: "show_author",
      default: true,
      label: "Show author",
    },
    {
      type: "checkbox",
      id: "show_tags",
      default: true,
      label: "Show tags",
    },
    {
      type: "paragraph",
      content:
        "Change excerpts by editing your blog posts. [Learn more](https://help.shopify.com/manual/online-store/blogs/writing-blogs#display-an-excerpt-from-a-blog-post)",
    },
  ],
};
