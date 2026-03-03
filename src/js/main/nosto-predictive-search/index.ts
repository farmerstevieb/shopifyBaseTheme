import { rIC } from "../../utils";

function nostoPredictiveSearchController() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window._Nosto) {
    void import("./nosto-predictive-search");
  }
}

const index = () => rIC(nostoPredictiveSearchController);
export default index;
