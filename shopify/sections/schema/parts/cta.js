const icon = require("./icon");

module.exports = ({
  index = 1,
  header = `CTA #${index}`,
  default_text = "Shop Now",
  default_style = "primary",
  default_icon = "arrow-right",
  default_icon_position = "right",
  url = true,
} = {}) => {
  return [
    {
      type: "header",
      content: header,
    },
    (default_text !== "" && {
      type: "text",
      id: `cta_${index}_text`,
      label: `CTA #${index} Text`,
      default: default_text,
    }) || {
      type: "text",
      id: `cta_${index}_text`,
      label: `CTA #${index} Text`,
    },
    ...icon({
      id: `cta_${index}_icon`,
      label: `CTA #${index} Icon`,
      default_icon: default_icon,
    }),
    {
      type: "select",
      id: `cta_${index}_icon_position`,
      label: `CTA #${index} Icon Position`,
      default: default_icon_position,
      options: [
        {
          value: "left",
          label: "Icon | Text",
        },
        {
          value: "right",
          label: "Text | Icon",
        },
      ],
    },
    url && {
      type: "url",
      id: `cta_${index}_link`,
      label: `CTA #${index} Link`,
    },
    {
      type: "select",
      id: `cta_${index}_link_style`,
      label: `CTA #${index} Link Style`,
      options: [
        {
          value: "primary",
          label: "Primary",
        },
        {
          value: "secondary",
          label: "Secondary",
        },
        {
          value: "tertiary",
          label: "Tertiary",
        },
        {
          value: "quaternary",
          label: "Quaternary",
        },
        {
          value: "quinary",
          label: "Quinary",
        },
        {
          value: "senary",
          label: "Senary",
        },
        {
          value: "septenary",
          label: "Septenary",
        },
        {
          value: "octonary",
          label: "Octonary",
        },
        {
          value: "nonary",
          label: "Nonary",
        },
        {
          value: "solid",
          label: "Solid",
        },
        {
          value: "link",
          label: "Link",
        },
      ],
      default: default_style,
    },
    {
      type: "checkbox",
      id: `cta_${index}_target`,
      label: `Open CTA #${index} in a new tab?`,
      default: false,
    },
  ].filter(Boolean);
};
