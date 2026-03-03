module.exports = ({
  has_arrows = true,
  has_dots = true,
  arrows_colour = "#000",
  dots_colour = "#222",
} = {}) => {
  return [
    {
      type: "header",
      content: "Slider Settings",
    },
    {
      type: "select",
      id: "slider_loop",
      label: "Loop",
      options: [
        {
          value: "",
          label: "No",
        },
        {
          value: "loop",
          label: "Yes",
        },
      ],
      default: "loop",
    },
    {
      type: "range",
      id: "slider_autoplay",
      min: 0,
      max: 10,
      step: 0.5,
      unit: "s",
      label: "Autoplay Delay",
      default: 0,
      info: "Set to 0s to disable autoplay",
    },
    has_arrows && {
      type: "select",
      id: "slider_arrows",
      label: "Slider Arrows",
      options: [
        {
          value: "",
          label: "No",
        },
        {
          value: "showArrows",
          label: "Yes",
        },
      ],
      default: "",
    },
    has_arrows && {
      type: "color",
      id: "slider_arrows_color",
      label: "Slider Arrows Color",
      default: arrows_colour,
    },
    has_dots && {
      type: "select",
      id: "slider_dots",
      label: "Slider Dots",
      options: [
        {
          value: "",
          label: "No",
        },
        {
          value: "showDots",
          label: "Yes",
        },
      ],
      default: "",
    },
    has_dots && {
      type: "color",
      id: "slider_dots_color",
      label: "Slider Dots Color",
      default: dots_colour,
    },
  ].filter(Boolean);
};
