const bannerColumns = require("./parts/bannerColumns");

module.exports = {
  ...bannerColumns({
    name: "Banner (Hero - Columns)",
    classes: "o-row banner-three-columns",
    slider_settings: {
      has_arrows: false,
    },
  }),
};
