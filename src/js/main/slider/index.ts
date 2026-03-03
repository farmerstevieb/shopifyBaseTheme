import { get, rIC } from "../../utils";

function sliderController() {
  if (get("juno-slider") || get(".js-quickshop-trigger")) {
    import(/* webpackChunkName: "slider" */ "./Slider");
  }
}

export default () => rIC(sliderController);
