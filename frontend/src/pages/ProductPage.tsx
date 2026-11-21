import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Async } from "../components/Async";
import { EnquiryForm } from "../components/EnquiryForm";
import { useAsync } from "../useAsync";

export function ProductPage() {
  const { id = "" } = useParams();
  const product = useAsync(() => api.product(Number(id)), [id]);
  return (
    <Async state={product}>
      {(p) => (
        <article className="product">
          <img src={p.image} alt={p.title} />
          <div>
            <h1>{p.title}</h1>
            <p className="price">${p.price.toFixed(2)}</p>
            <p className="rating">★ {p.rating.rate} ({p.rating.count} reviews)</p>
            <p>{p.description}</p>
            <EnquiryForm product={p} />
          </div>
        </article>
      )}
    </Async>
  );
}
