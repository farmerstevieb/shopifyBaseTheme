import { rIC } from "../../utils";

function productController() {
  import("./DrawerCart");
  import("./RemoveButton");
  import("./QuantityInput");
  import("./ProductForm");
  import("./VariantOptions");
  import("./ProductRecommendations");
  import("./TabSwitching");
  import("./StickyButton");
}

export default () => rIC(productController);
