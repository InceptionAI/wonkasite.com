'use client';
import { orama, parseSorting } from "@/lib/orama";
import { Product } from "@/lib/shopify/types";
import { useSearchParams } from "next/navigation";
import Grid from "../grid";
import ProductGridItems from "./product-grid-items";

export const SearchComponent = async () => {
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") || "relevance";
    const searchValue = searchParams.get("q") || "";
  
    const products = await orama.search({
      term: searchValue,
      boost: {
        title: 2,
      },
      sortBy: parseSorting(sort),
      limit: 50,
    });
    if (!products) return null;
  
    const resultsText = products.count > 1 ? "results" : "result";
    const docs = products.hits.map((hit: any) => hit.document) as Product[];
  
    return (
      <>
        {searchValue ? (
          <p className="mb-4">
            {products.count === 0
              ? "There are no products that match "
              : `Showing ${products.count} ${resultsText} for `}
            <span className="font-bold">&quot;{searchValue}&quot;</span>
          </p>
        ) : null}
        {products.count > 0 ? (
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <ProductGridItems products={docs} />
          </Grid>
        ) : null}
      </>
    );
    }