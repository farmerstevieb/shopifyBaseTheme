import React from "react";

import { defaultConfig } from "../config";
import { useAppState } from "../contexts/app-state";
import { ButtonHeightProvider } from "../contexts/button-height-context";
import Banner from "./banner";
import Product from "./product";

export default function Products() {
  const {
    response: { products },
  } = useAppState();

  const bannerBlocks = defaultConfig.categoryBlocks || [];

  return (
    <ButtonHeightProvider>
      <ul className="section-grid mb-[4rem] grid">
        {bannerBlocks.map((block, index) => (
          <Banner block={block} index={index} key={`banner-${block.id}`} />
        ))}

        {products?.hits.map((hit, index) => (
          <Product
            product={hit}
            index={index}
            key={`${hit.pid}${hit.skus && hit.skus.length > 0 ? `-${hit.skus[0]?.id}` : ""}`}
          />
        ))}
      </ul>
    </ButtonHeightProvider>
  );
}
