import { get, rIC } from "../../utils";

async function headerController() {
  const elHeader = get(".js-header");
  if (!elHeader) return;

  const { Header } = await import("./Header");
  new Header(elHeader);
}

export default () => rIC(headerController);
