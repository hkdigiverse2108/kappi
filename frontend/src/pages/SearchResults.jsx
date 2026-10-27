import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/product/ProductCard';

export const SearchResults = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const matchedProducts = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Helmet>
        <title>{`Search Results for "${query}" | KAPEE Enterprise`}</title>
      </Helmet>

      {/* Header */}
      <div className="border-b border-emerald-soft pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald">
          Search Discovery
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-ink mt-1">
          Results for "{query}"
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Found {matchedProducts.length} product{matchedProducts.length !== 1 ? 's' : ''} matching your search.
        </p>
      </div>

      {matchedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {matchedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-emerald-soft max-w-lg mx-auto space-y-4">
          <Sparkles className="w-12 h-12 text-gold mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-ink">No Exact Products Found</h2>
          <p className="text-xs text-muted leading-relaxed">
            We couldn't find any items matching "{query}". Try checking your spelling or search for "magic eraser", "microfiber", "kitchen" or "sneakers".
          </p>
          <div className="pt-2">
            <Link to="/shop" className="btn-primary inline-flex text-xs px-6 py-3">
              Explore All 12 Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
