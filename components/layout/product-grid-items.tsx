import Link from "next/link";

import { Product } from "@/lib/shopify/types";

import Grid from "../store/grid";
import { GridTileImage } from "../store/grid/tile";

export default function ProductGridItems({
  products,
}: {
  products: Product[];
}) {
  return (
    <>
      {products.map((product) => (
        <Grid.Item key={product.handle} className="animate-fadeIn">
          <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.handle}`}
          >
            <GridTileImage
              alt={product.title}
              label={{
                title: product.title,
                // @ts-expect-error - Orama converts `maxVariantPrice` to `max`
                amount: product.priceRange.max,
                currencyCode: product.priceRange?.maxVariantPrice?.currencyCode,
              }}
              src={product.featuredImage?.url}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
