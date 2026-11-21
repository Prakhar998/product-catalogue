import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Async } from "../components/Async";
import { ProductGrid } from "../components/ProductCard";
import { useAsync } from "../useAsync";

export function CategoryPage() {
  const { name = "" } = useParams();
  const listing = useAsync(() => api.category(name), [name]);
  return (
    <>
      <h1>{name}</h1>
      <Async state={listing}>
        {({ topRated, others }) => (
          <>
            <h2>Top rated in {name}</h2>
            <ProductGrid products={topRated} />
            {others.length > 0 && (
              <>
                <h2>More in {name}</h2>
                <ProductGrid products={others} />
              </>
            )}
          </>
        )}
      </Async>
    </>
  );
}
