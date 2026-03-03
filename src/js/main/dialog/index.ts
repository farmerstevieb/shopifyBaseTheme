import { rIC } from "../../utils";

function dialogController() {
  import("./dialog");
  import("./DrawerAccount");
}

export default () => rIC(dialogController);
