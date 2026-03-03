import { get, getAll, rIC } from "../../utils";

function tooltipController() {
  if (get("product-tooltip")) {
    import("./Tooltip");
  }

  if (matchMedia("(hover: hover)").matches) {
    const elTooltips = getAll(".js-tooltip");
    if (elTooltips.length) {
      import("./Tooltip").then(({ BasicTooltip }) => {
        elTooltips.forEach((el) => new BasicTooltip(el));
      });
    }
  }
}

export default () => rIC(tooltipController);
