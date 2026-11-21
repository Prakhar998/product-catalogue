import { type FormEvent, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../useAsync";

export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form role="search" onSubmit={submit} className="search">
      <input aria-label="Search products" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products" maxLength={100} />
      <button type="submit">Search</button>
    </form>
  );
}

export function Layout() {
  const categories = useAsync(api.categories, []);
  return (
    <>
      <header>
        <Link to="/" className="brand">Catalogue</Link>
        <nav aria-label="Categories">
          {categories.status === "ready" &&
            categories.data.map((c) => (
              <Link key={c} to={`/categories/${encodeURIComponent(c)}`}>{c}</Link>
            ))}
        </nav>
        <SearchBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
