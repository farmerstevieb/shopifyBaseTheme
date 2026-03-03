import React from "react";
import type { SearchProduct } from "@nosto/nosto-js/client";

type ProductStickersProps = {
  product: SearchProduct;
  onSale: boolean;
};

function handleize(str: string): string {
  return str
    .toLowerCase()
    .replace("badge_", "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-/g, "_");
}

export function ProductStickers({ product, onSale }: ProductStickersProps) {
  const tags = [];
  if (product.tags1) tags.push(...product.tags1);
  if (product.tags2) tags.push(...product.tags2);
  if (product.tags3) tags.push(...product.tags3);

  const stickers = [];

  // # Custom Stickers
  const customStickers = tags.filter((t) => t.includes("badge_"));
  if (customStickers.length > 0) {
    stickers.push(...customStickers);
  }

  // # On Sale
  if (onSale) {
    stickers.push(window._Nosto.i18n.products.card.stickers.on_sale);
  }

  // # Sold Out
  if (!product.available) {
    stickers.push(window._Nosto.i18n.products.card.stickers.sold_out);
  }

  if (stickers.length > 0) {
    return (
      <div className="absolute left-0 right-0 top-0 z-1 flex flex-wrap gap-1">
        <ul className="flex w-full flex-wrap gap-2 text-sm">
          {stickers.map((sticker) => {
            const sanitisedSticker = sticker
              .replace("badge_", "")
              .replaceAll("-", " ")
              .trim();

            return (
              <li
                className="block w-full px-[5px] py-[1px] text-center text-sm font-semibold uppercase tracking-standard"
                data-sticker={handleize(sticker)}
                key={sticker}
              >
                {sanitisedSticker}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
