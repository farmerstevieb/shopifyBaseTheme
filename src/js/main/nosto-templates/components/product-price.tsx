import React, { useEffect, useMemo, useRef } from "react";
import type { SearchProduct } from "@nosto/nosto-js/client";
import he from "he";

import { formatMoney } from "../../../utils/shopify";
import { useButtonHeight } from "../contexts/button-height-context";
import { rcn } from "../tools/react-class-name";

interface ProductPriceProps {
  product: SearchProduct;
  range: boolean;
  className?: string;
  priceRange?: {
    minPrice: number;
    maxPrice: number;
    minListPrice: number;
    maxListPrice: number;
    hasVariedPricing: boolean;
    hasVariedListPricing: boolean;
  }; // New prop for price range calculation
}

export function ProductPrice({
  product,
  range,
  className,
  priceRange,
}: ProductPriceProps) {
  const { setHasMultiLinePrice } = useButtonHeight();
  const priceRef = useRef<HTMLDivElement>(null);
  const priceInCents = useMemo(
    () => Number(product.listPrice) * 100,
    [product.listPrice],
  );
  /**
   * TODO: Start price is wrong, leaving this here to be adjusted later once response returns actual start price,
   * as of 15/3/2025 the product doesn't return the variant pricing.
   */
  const startPriceInCents = useMemo(
    () => Number(product.listPrice) * 100,
    [product.listPrice],
  );
  const salePriceInCents = useMemo(
    () => Number(product.price) * 100,
    [product.price],
  );

  const price = useMemo(
    () => formatMoney({ cents: priceInCents }),
    [priceInCents],
  );
  const startPrice = useMemo(
    () => formatMoney({ cents: startPriceInCents }),
    [startPriceInCents],
  );
  const salePrice = useMemo(
    () => formatMoney({ cents: salePriceInCents }),
    [salePriceInCents],
  );

  // Calculate range prices when priceRange is provided
  const minPriceFormatted = useMemo(
    () =>
      priceRange ? formatMoney({ cents: priceRange.minPrice * 100 }) : null,
    [priceRange],
  );
  const maxPriceFormatted = useMemo(
    () =>
      priceRange ? formatMoney({ cents: priceRange.maxPrice * 100 }) : null,
    [priceRange],
  );
  const minListPriceFormatted = useMemo(
    () =>
      priceRange ? formatMoney({ cents: priceRange.minListPrice * 100 }) : null,
    [priceRange],
  );
  const maxListPriceFormatted = useMemo(
    () =>
      priceRange ? formatMoney({ cents: priceRange.maxListPrice * 100 }) : null,
    [priceRange],
  );

  const isMobileVersion = className?.includes("!text-grey-20");

  // Detect if price text overflows to multiple lines
  useEffect(() => {
    const checkOverflow = () => {
      if (priceRef.current) {
        const element = priceRef.current;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setHasMultiLinePrice(hasOverflow);
      }
    };

    checkOverflow();

    // Check again after a short delay to ensure content is loaded
    const timeout = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timeout);
  }, [setHasMultiLinePrice, priceRange, range]);

  const priceComponent = () => {
    return salePriceInCents === priceInCents ?
        /* Sale price being the same as the price means the product isn't on sale */

        <p
          className={`text-xs lg:text-sm ${isMobileVersion ? "text-grey-20" : "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"}`}
        >
          {price}
        </p>
      : /* Sale price not being the same as the price means the product is on sale */
        <>
          <p className="text-xs text-compare line-through lg:text-sm">
            {price}
          </p>
          <p
            className={`text-xs lg:text-sm ${isMobileVersion ? "text-grey-20" : "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"}`}
          >
            {salePrice}
          </p>
        </>;
  };

  const varyingPriceComponent = () => {
    return salePriceInCents === priceInCents ?
        /* Sale price being the same as the price means the product isn't on sale */
        <p
          className={`text-xs lg:text-sm ${isMobileVersion ? "text-grey-20" : "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"}`}
        >
          {range ?
            `${startPrice} - ${price}`
          : he.decode(
              window._Nosto.i18n.products.card.from_price.replace(
                "{{ price }}",
                startPrice,
              ),
            )
          }
        </p>
      : /* Sale price not being the same as the price means the product is on sale */
        <>
          <p className="text-xs text-compare line-through 4xl:text-[1.3rem]">
            {range ?
              `${startPrice} - ${price}`
            : he.decode(
                window._Nosto.i18n.products.card.from_price.replace(
                  "{{ price }}",
                  startPrice,
                ),
              )
            }
          </p>
          <p
            className={`text-xs 4xl:text-[1.3rem] ${isMobileVersion ? "text-grey-20" : "text-sale"}`}
          >
            {range ? `${startPrice} - ${salePrice}` : salePrice}
          </p>
        </>;
  };

  const rangePriceComponent = () => {
    if (!priceRange || !minPriceFormatted || !maxPriceFormatted) return null;

    // Case 1: Different current prices across variants - show range
    if (priceRange.hasVariedPricing) {
      return (
        <p
          className={`text-sm normal-case lg:text-sm ${isMobileVersion ? "text-grey-20" : "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"}`}
        >
          {`From ${minPriceFormatted} to ${maxPriceFormatted}`}
        </p>
      );
    }

    // Case 2: Same current price across variants, but on sale - show strikethrough
    if (
      priceRange.minListPrice > priceRange.minPrice &&
      minListPriceFormatted
    ) {
      return (
        <div className="flex items-center gap-1 text-xs 4xl:text-[1.3rem]">
          <span
            className={
              isMobileVersion ? "text-grey-20" : (
                "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"
              )
            }
          >
            {minPriceFormatted}
          </span>
          <span className="text-xs text-compare line-through 4xl:text-[1.3rem]">
            {minListPriceFormatted}
          </span>
        </div>
      );
    }

    // Case 3: Same current price, no sale - show single price
    return (
      <p
        className={`text-xs lg:text-sm ${isMobileVersion ? "text-grey-20" : "text-[var(--buttons-primary-color)] group-hover:text-[var(--buttons-primary-color-hover)]"}`}
      >
        {minPriceFormatted}
      </p>
    );
  };

  return (
    <h6
      ref={priceRef}
      className={`flex gap-x-rem font-body text-xs font-semibold ${rcn(className)} ${
        range ? "flex-col" : "flex-row-reverse"
      }`}
    >
      {range && priceRange ?
        /* Use new range pricing when priceRange is provided */
        rangePriceComponent()
      : startPriceInCents && startPriceInCents !== priceInCents ?
        /* Start price being present means there are varying prices for this product */
        varyingPriceComponent()
      : /* Start price not being present means there are no varying prices for this product */
        priceComponent()
      }
    </h6>
  );
}
