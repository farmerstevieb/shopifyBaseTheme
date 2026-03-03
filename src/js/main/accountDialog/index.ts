import { get, rIC } from "../../utils";

async function accountDialogController() {
  const element = get(".js-account-tabs");
  if (!element) return;
  const { setup } = await import("./AccountDialog");
  setup(element);
}

export default () => rIC(accountDialogController);
