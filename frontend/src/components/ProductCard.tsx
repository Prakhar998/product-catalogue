import { Link } from "react-router-dom";
import type { Product } from "../api/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="card" aria-label={product.title}>
      <img src={product.image} alt="" loading="lazy" />
      <h3>{product.title}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="rating">★ {product.rating.rate} ({product.rating.count})</p>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
