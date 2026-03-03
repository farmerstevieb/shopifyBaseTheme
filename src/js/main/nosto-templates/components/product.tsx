import React, { useEffect, useMemo, useState } from "react";
import type { SearchProduct } from "@nosto/nosto-js/client";
import he from "he";

import { get } from "../../../utils";
import type { Dialog } from "../../dialog/dialog";
import { defaultConfig } from "../config";
import { useAppState } from "../contexts/app-state";
import { useButtonHeight } from "../contexts/button-height-context";
import Image from "./elements/image";
import { ProductPrice } from "./product-price";
import { ProductStickers } from "./product-stickers";

// Extend Window interface for STOQ global
declare global {
  interface Window {
    _RestockRocketConfig?: {
      settings?: {
        enable_app?: boolean;
      };
    };
  }
}

type ProductProps = {
  product: SearchProduct;
  index: number;
  position?: number;
};

// Hook to fetch STOQ metafields for a product
function useStoqMetafields(productHandle: string) {
  const [stoqData, setStoqData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productHandle) {
      console.warn("No product handle provided to useStoqMetafields");
      return;
    }

    const fetchStoqData = async () => {
      setLoading(true);
      try {
        // Fetch STOQ metafields from Shopify using product handle
        const response = await fetch(`/products/${productHandle}.js`);
        if (response.ok) {
          const productData = await response.json();

          setStoqData(productData);
        } else {
          console.warn(
            "Failed to fetch STOQ data for product handle:",
            productHandle,
          );
        }
      } catch (error) {
        console.warn(
          "Failed to fetch STOQ data for product handle:",
          productHandle,
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStoqData();
  }, [productHandle]);

  return { stoqData, loading };
}

export default function Product({ product, index, position }: ProductProps) {
  const sectionId = get(
    ".shopify-section--nosto-search-template,.shopify-section--nosto-collection-template",
  )?.id.replace("shopify-section-", "");

  const { trackType, response } = useAppState();
  const { hasMultiLinePrice } = useButtonHeight();

  const { customerIsLoggedIn } = defaultConfig;
  const price = product.price ?? 0;
  const listPrice = product.listPrice ?? 0;

  // Fetch STOQ metafields for this product
  // Extract product handle from Nosto product URL
  const productHandle =
    product.url ? product.url.split("/products/")[1]?.split("?")[0] : "";
  const { stoqData, loading: stoqLoading } = useStoqMetafields(
    productHandle || "",
  );

  // Check if ANY variant is on sale, otherwise fall back to main product pricing
  const onSale =
    product.skus && product.skus.length > 0 ?
      product.skus.some((sku) => {
        const skuListPrice = Number(sku.listPrice) || 0;
        const skuPrice = Number(sku.price) || 0;
        return skuListPrice > skuPrice;
      })
    : listPrice > price;

  // Calculate price range from all variants - handle both range and sale pricing
  const priceRange = useMemo(() => {
    if (!product.skus || product.skus.length === 0) {
      return {
        minPrice: price,
        maxPrice: price,
        minListPrice: listPrice,
        maxListPrice: listPrice,
        hasVariedPricing: false,
        hasVariedListPricing: false,
      };
    }

    const currentPrices: number[] = [];
    const originalPrices: number[] = [];

    product.skus.forEach((variant: any) => {
      if (variant.price) {
        currentPrices.push(Number(variant.price));
      }
      if (variant.listPrice) {
        originalPrices.push(Number(variant.listPrice));
      }
    });

    if (currentPrices.length === 0) {
      return {
        minPrice: price,
        maxPrice: price,
        minListPrice: listPrice,
        maxListPrice: listPrice,
        hasVariedPricing: false,
        hasVariedListPricing: false,
      };
    }

    const minPrice = Math.min(...currentPrices);
    const maxPrice = Math.max(...currentPrices);
    const minListPrice =
      originalPrices.length > 0 ? Math.min(...originalPrices) : 0;
    const maxListPrice =
      originalPrices.length > 0 ? Math.max(...originalPrices) : 0;

    const hasVariedPricing = minPrice !== maxPrice;
    const hasVariedListPricing =
      minListPrice !== maxListPrice && minListPrice > 0 && maxListPrice > 0;

    const result = {
      minPrice,
      maxPrice,
      minListPrice: minListPrice || minPrice,
      maxListPrice: maxListPrice || maxPrice,
      hasVariedPricing,
      hasVariedListPricing,
    };

    return result;
  }, [product.skus, price, listPrice]);

  const initialVariant =
    product.skus && product.skus.length > 0 ? product.skus[0] : undefined;
  const isDefaultVariant =
    initialVariant && initialVariant.name?.toLowerCase() === "default title";

  const name = product.name;
  const url =
    isDefaultVariant ?
      product.url
    : `${product.url}?variant=${initialVariant?.id}`;

  const image =
    initialVariant && initialVariant.imageUrl ?
      initialVariant.imageUrl
    : product.imageUrl;

  const isManagedInventory =
    initialVariant &&
    initialVariant.inventoryLevel !== null &&
    initialVariant.inventoryLevel !== undefined;
  const isOutOfStock =
    !initialVariant?.availability ||
    (isManagedInventory && initialVariant?.inventoryLevel! <= 0);

  // Check if product is pre-order using STOQ data
  // Check if STOQ app is enabled
  const isStoqEnabled = () => {
    if (
      window._RestockRocketConfig &&
      window._RestockRocketConfig.settings &&
      typeof window._RestockRocketConfig.settings.enable_app === "boolean"
    ) {
      return window._RestockRocketConfig.settings.enable_app === true;
    }
    return false;
  };

  // Check if product is available first
  const isProductAvailable = stoqData?.available !== false;

  // Check if product is pre-order using STOQ data
  const isPreorder =
    isProductAvailable &&
    isStoqEnabled() &&
    (stoqData?.selling_plan_groups?.some(
      (group: any) =>
        group.name?.toLowerCase().includes("pre-order") ||
        group.name?.toLowerCase().includes("preorder"),
    ) ||
      stoqData?.variants?.[0]?.metafields?.restockrocket_production
        ?.selling_plan_ids ||
      stoqData?.variants?.[0]?.metafields?.restockrocket_production
        ?.preorder_enabled?.value === true);

  // Check if pre-order is full using STOQ data
  const isPreorderFull =
    isPreorder &&
    stoqData?.variants?.[0]?.metafields?.restockrocket_production
      ?.preorder_max_count?.value &&
    stoqData?.variants?.[0]?.metafields?.restockrocket_production
      ?.preorder_count?.value >=
      stoqData?.variants?.[0]?.metafields?.restockrocket_production
        ?.preorder_max_count?.value;

  return (
    <li
      key={product.pid}
      className="js-product-card order-[var(--order)] flex flex-col gap-y-4"
      style={{ "--order": position || index + 1 } as React.CSSProperties}
    >
      <div className="nst-wk group">
        <div className="relative">
          <ProductStickers product={product} onSale={onSale} />

          <div className="relative grid bg-cover bg-center bg-no-repeat [&>*]:col-end-1 [&>*]:row-end-1">
            <Image url={image ?? ""} loading={index > 8 ? "lazy" : "eager"} />
          </div>

          <a
            className="js-wishlist-button absolute inset-0"
            href={url}
            aria-hidden="true"
            onClick={() =>
              onProductCardClick(product.productId ?? "", url ?? "")
            }
          ></a>

          {customerIsLoggedIn && !isPreorder && (
            <div className="coarse:hidden pointer-events-none absolute bottom-0 w-full opacity-0 transition-all group-hover:pointer-events-auto group-hover:-translate-y-4 group-hover:opacity-100 max-md:hidden">
              <button
                className="button--primary js-quickshop-trigger min-w-full"
                type="button"
                data-product-handle={product.url}
                data-variant-id={initialVariant && initialVariant.id}
              >
                {he.decode(window._Nosto.i18n.products.card.quick_shop)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col md:gap-y-4">
        <p className="mb-1 text-center text-xs font-semibold uppercase text-inherit md:text-sm">
          <a href={url}>{name}</a>
        </p>

        {customerIsLoggedIn && (
          <div
            className="product__details-price flex justify-center text-grey-20 md:hidden"
            id={`button-price-${sectionId}`}
            role="status"
          >
            <ProductPrice
              product={product}
              range={true}
              className="mb-1 tracking-1 !text-grey-20"
              priceRange={
                priceRange as {
                  minPrice: number;
                  maxPrice: number;
                  minListPrice: number;
                  maxListPrice: number;
                  hasVariedPricing: boolean;
                  hasVariedListPricing: boolean;
                }
              }
            />
          </div>
        )}

        <div
          className={`flex items-center text-sm js-product-form-error-product-form-${sectionId} js-product-form-error gap-x-2`}
          role="alert"
          hidden
        >
          <span
            className={`js-product-form-error-message-product-form-${sectionId}`}
          ></span>
        </div>

        <div className="mt-auto flex flex-grow items-end">
          {customerIsLoggedIn ?
            <form
              method="post"
              action="/cart/add"
              id={`product-form-${sectionId}-${initialVariant?.id}`}
              accept-charset="utf8"
              className={`button--primary relative flex w-full hover:opacity-90 max-md:flex-col-reverse max-md:justify-center md:justify-between max-lg:gap-y-[11px] lg:items-center lg:px-5 lg:py-3 lg:text-white ${
                hasMultiLinePrice ? "max-h-[57px]" : "h-[40px]"
              }`}
              encType="multipart/form-data"
              data-product-url={url}
              data-product-id={product.productId}
              data-preorder={isPreorder}
              is="product-form"
            >
              <input type="hidden" name="form_type" value="product" />
              <input type="hidden" name="utf8" value="✓" />
              <input type="hidden" name="id" value={initialVariant?.id} />

              {
                isPreorder ?
                  // For pre-order products, always link to PDP
                  <a href={url} className="button--collection text-center">
                    {stoqLoading ?
                      "Loading..."
                    : isPreorderFull ?
                      "Pre-Order Full"
                    : "Pre-Order Now"}
                  </a>
                  // For regular products, use the existing logic
                : product.skus && product.skus.length <= 1 ?
                  <button
                    type="submit"
                    name="add"
                    className="button--collection"
                    disabled={isOutOfStock}
                  >
                    <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>

                    <span className="loading-overlay--collection invisible">
                      <span className="loading-overlay__spinner">
                        <svg
                          className="spinner"
                          aria-hidden="true"
                          focusable="false"
                          viewBox="0 0 66 66"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="currentColor"
                          fill="none"
                          width="10"
                          height="10"
                        >
                          <circle
                            className="path"
                            fill="none"
                            strokeWidth="6"
                            cx="33"
                            cy="33"
                            r="30"
                          ></circle>
                        </svg>
                      </span>
                    </span>
                  </button>
                : <a
                    href={url}
                    className="button--collection w-fit text-center font-semibold"
                  >
                    Shop Now
                  </a>

              }

              <div
                className="product__details-price flex max-md:hidden"
                id={`button-price-${sectionId}`}
                role="status"
              >
                <ProductPrice
                  product={product}
                  range={true}
                  priceRange={
                    priceRange as {
                      minPrice: number;
                      maxPrice: number;
                      minListPrice: number;
                      maxListPrice: number;
                      hasVariedPricing: boolean;
                      hasVariedListPricing: boolean;
                    }
                  }
                />
              </div>

              <input type="hidden" name="product-id" value={product.pid} />
              <input type="hidden" name="section-id" value={sectionId} />
            </form>
          : <button
              type="button"
              onClick={() => {
                const drawerAccount = get("drawer-account") as Dialog;
                return drawerAccount?.show();
              }}
              className="button button--primary button--full"
            >
              {he.decode(window._Nosto.i18n.products.card.button.login)}
            </button>
          }
        </div>
      </div>
    </li>
  );
}
/**
 * Add product-click Nosto triggers
 */

function onProductCardClick(dataProductId: string, url: string) {
  if (!dataProductId) return;

  if (location.pathname.includes("/search")) {
    void window.nostojs((api: any) => {
      api.recordSearchClick("serp", { productId: dataProductId, url: url });
    });
  }

  if (location.pathname.includes("/collections")) {
    void window.nostojs((api: any) => {
      api.recordSearchClick("category", { productId: dataProductId, url: url });
    });
  }
}
