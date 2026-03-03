const spacing = require("./parts/spacing");
const userRestriction = require("./parts/user-restriction");

module.exports = {
  name: "Blog post",
  class: "article o-row",
  tag: "article",
  disabled_on: {
    groups: ["header", "footer"],
  },
  settings: [
    ...spacing(),
    {
      type: "checkbox",
      id: "show_tags",
      default: false,
      label: "Show tags",
    },
    ...userRestriction()
  ],
  blocks: [
    {
      type: "@app",
    },
    {
      type: "featured_image",
      name: "Featured image",
      limit: 1,
      settings: [],
    },
    {
      type: "title",
      name: "Title",
      limit: 1,
    },
    {
      type: "content",
      name: "Content",
      limit: 1,
    },
    {
      type: "social",
      name: "Social",
      limit: 1,
    },
  ],
};
