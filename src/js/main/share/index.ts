import { get, rIC } from "../../utils";

function shareController() {
  const elShareButton = get("[is=share-button]");
  if (!elShareButton) return;
  import("./Share");
}

export default () => rIC(shareController);
