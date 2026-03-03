const icon = require("./icon");

module.exports = ({
  generate = 1,
  default_title = "USP Title",
  default_text = "USP Description",
  default_icon = "heart",
} = {}) => {
  let usp_array = [];

  for (let usp = 1; usp <= generate; usp++) {
    usp_array.push(
      {
        type: "header",
        content: `USP #${usp}`,
      },
      ...icon({
        id: `usp_${usp}_icon`,
        label: `USP #${usp} Icon`,
        default_icon: default_icon,
      }),
      default_title !== "" && {
        type: "text",
        id: `usp_${usp}_title`,
        label: `USP #${usp} Title`,
        default: default_title,
      } || {
        type: "text",
        id: `usp_${usp}_title`,
        label: `USP #${usp} Title`,
      },
      default_text !== "" && {
        type: "text",
        id: `usp_${usp}_text`,
        label: `USP #${usp} Text`,
        default: default_text,
      } || {
        type: "text",
        id: `usp_${usp}_text`,
        label: `USP #${usp} Text`,
      }
    );
  };

  return usp_array.filter(Boolean)
};
