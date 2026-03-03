import { get, rIC } from "../../utils";

async function helpCenterController() {
  const elForm = get(".js-help-center-form");
  if (!elForm) return;

  const { HelpCenter } = await import("./HelpCenter");
  new HelpCenter(elForm as HTMLFormElement);
}

export default () => rIC(helpCenterController);
