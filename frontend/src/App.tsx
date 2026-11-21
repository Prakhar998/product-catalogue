import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { SearchPage } from "./pages/SearchPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="categories/:name" element={<CategoryPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Route>
    </Routes>
  );
}
