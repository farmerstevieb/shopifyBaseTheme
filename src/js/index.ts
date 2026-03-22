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
import wishlist from "./main/wishlist";
import slider from "./main/slider";
import video from "./main/video";

import(/* webpackChunkName: "side-effects" */ `./side-effects`);
import(/* webpackChunkName: "recently-viewed" */ `./modules/recently-viewed`);
import(/* webpackChunkName: "countdown-timer" */ `./modules/countdown-timer`);
import(/* webpackChunkName: "cookie-consent" */ `./modules/cookie-consent`);
import(/* webpackChunkName: "ecomplete-search" */ `./modules/ecomplete-search`);
import(/* webpackChunkName: "newsletter-popup" */ `./modules/newsletter-popup`).then(
  (m) => m.default(),
);
import(/* webpackChunkName: "compare" */ `./modules/compare`).then(
  (m) => m.default(),
);
import(/* webpackChunkName: "upsell" */ `./modules/upsell`).then(
  (m) => m.default(),
);

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
  wishlist,
];

for (const themeFn of themeFunctions) {
  themeFn();
}
