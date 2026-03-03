const banner = require("./parts/banner");

module.exports = {
  ...banner({
    name: "Banner (Hero - Standard)",
    classes: "o-row banner-hero-standard",
    slider_settings: {
      has_arrows: false,
    },
    mobile_sources: true,
  }),
};
