import { get, rIC } from "../../utils";

function trustpilotController() {
  if (get("trustpilot-reviews")) {
    import(/* webpackChunkName: "trustpilot" */ "./Trustpilot");
  }
}

export default () => rIC(trustpilotController);
