import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { Async } from "../components/Async";
import { ProductGrid } from "../components/ProductCard";
import { useAsync } from "../useAsync";

export function SearchPage() {
  const q = useSearchParams()[0].get("q") ?? "";
  const results = useAsync(() => api.search(q), [q]);
  return (
    <>
      <h1>Results for “{q}”</h1>
      <Async state={results}>
        {(products) => (products.length ? <ProductGrid products={products} /> : <p>No products match “{q}”.</p>)}
      </Async>
    </>
  );
}
