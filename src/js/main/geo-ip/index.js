import { get, rIC } from "../../utils";

async function locationController() {
  const elLoc = get(".js-uk-only");
  if (!elLoc) return;

  const { GeoIpBlock } = await import("./GeoIpBlocker");
  const geoIpBlockInstance = new GeoIpBlock(elLoc);

  document.addEventListener("quickshopContentRendered", () => {
    geoIpBlockInstance.productBlock();
  });
}

export default () => rIC(locationController);
