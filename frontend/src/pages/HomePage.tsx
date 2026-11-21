import { api } from "../api/client";
import { Async } from "../components/Async";
import { ProductGrid } from "../components/ProductCard";
import { useAsync } from "../useAsync";

export function HomePage() {
  const featured = useAsync(api.featured, []);
  return (
    <>
      <h1>Top rated</h1>
      <Async state={featured}>{(products) => <ProductGrid products={products} />}</Async>
    </>
  );
}
