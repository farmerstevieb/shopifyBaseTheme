import { get, rIC } from "../../utils";

async function load(el) {
  const { Addresses } = await import("./Addresses");
  new Addresses(el);
}

function addressesController() {
  const elAddresses = get(".js-addresses");
  if (elAddresses) load(elAddresses);
}

export default () => rIC(addressesController);
