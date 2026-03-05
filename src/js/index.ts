import "./utils/public-path";
import "@ungap/custom-elements";

import accordion from "./main/accordion";
import accountDialog from "./main/accountDialog";
import beforeAfter from "./main/beforeAfter";
import collection from "./main/collection";
import adresses from "./main/customer";
import deliveryCountdown from "./main/delivery-countdown";
import dialog from "./main/dialog";
import geoip from "./main/geo-ip";
import header from "./main/header";
import helpCenter from "./main/help-center";
import lazyload from "./main/lazyload";
import lightbox from "./main/lightbox";
import modal from "./main/modal";
import pagination from "./main/pagination";
import product from "./main/product";
import tooltip from "./main/product-tooltip";
import quickBuy from "./main/quick-buy";
import share from "./main/share";
import shopTheLook from "./main/shop-the-look";
import slider from "./main/slider";
import video from "./main/video";

import(/* webpackChunkName: "side-effects" */ `./side-effects`);

const themeFunctions = [
  lazyload,
  header,
  dialog,
  accountDialog,
  slider,
  shopTheLook,
  video,
  pagination,
  collection,
  quickBuy,
  modal,
  tooltip,
  accordion,
  beforeAfter,
  product,
  deliveryCountdown,
  lightbox,
  adresses,
  share,
  helpCenter,
  geoip,
];

for (const themeFn of themeFunctions) {
  themeFn();
}
