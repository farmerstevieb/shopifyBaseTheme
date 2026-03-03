import { getAll, rIC } from "../../utils";

async function load(elements) {
  const { QuickBuy } = await import("./QuickBuy");
  new QuickBuy(elements);
}

function quickBuyController() {
  const elQuickBuy = getAll(".js-quickshop-modal");
  if (elQuickBuy.length) load(elQuickBuy);

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const elButton = event.target.closest(".js-product-card-variant");
    if (!elButton) return;

    const elCard = elButton.closest(".js-product-card");

    // Show variant image
    const variantImage = elButton.querySelector("img").src;
    const elMedia = elCard.querySelector(".js-product-card-media");
    if (elMedia) {
      const img = document.createElement("img");
      img.src = variantImage
        .replace(/width=(\d+)/, "450")
        .replace(/height=(\d+)/, "450");
      img.onload = () => {
        elMedia.classList.add("[&>*]:invisible");
        elMedia.style.backgroundImage = `url(${img.src})`;
      };
    }

    // Update quickshop variant
    const variantId = elButton.getAttribute("data-variant-id");
    const elQuickShopTrigger = elCard.querySelector(".js-quickshop-trigger");
    if (elQuickShopTrigger) {
      elQuickShopTrigger.setAttribute("data-variant-id", variantId);
    }
  });
}

export default () => rIC(quickBuyController);
