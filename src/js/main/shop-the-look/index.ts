import { get, rIC } from "../../utils";

function shopTheLookController() {
  if (get("shop-the-look")) {
    import(/* webpackChunkName: "shop-the-look" */ "./ShopTheLook");
  }
}

export default () => rIC(shopTheLookController);
