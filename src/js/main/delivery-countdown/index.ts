import { rIC } from "../../utils";

function deliveryCountdownController() {
  import("./DeliveryCoundown");
}

export default () => rIC(deliveryCountdownController);
