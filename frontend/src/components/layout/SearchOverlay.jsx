import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useUIStore } from '../../store/useUIStore';

export const SearchOverlay = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const { isSearchOpen, setIsSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-md flex flex-col justify-start animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsSearchOpen(false);
        }
      }}
    >
      {/* Top Search Bar */}
      <div className="w-full bg-white border-b border-emerald-soft shadow-lg px-4 md:px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Search className="w-6 h-6 text-emerald shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search magic erasers, microfiber cloths, cleaning essentials..."
              className="w-full text-base md:text-xl font-medium text-ink bg-transparent outline-none placeholder:text-muted/60"
            />
          </form>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted hover:text-ink text-xs font-semibold px-2.5 py-1 bg-ivory rounded-md transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="w-10 h-10 rounded-full bg-emerald-soft hover:bg-emerald text-emerald hover:text-white flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area - ONLY displays live search results when user types, NO suggestions */}
      {query.trim() && (
        <div
          className="flex-1 overflow-y-auto px-4 md:px-8 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-emerald-soft/60">
              <div className="flex items-center justify-between mb-4 border-b border-emerald-soft pb-3">
                <span className="text-sm font-bold text-ink">
                  Products matching &ldquo;{query}&rdquo; ({filteredProducts.length})
                </span>
                {filteredProducts.length > 0 && (
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-emerald hover:text-emerald-deep flex items-center gap-1"
                  >
                    View all results <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.slice(0, 6).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/product/${prod.slug}`);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-soft/60 hover:border-gold hover:bg-ivory/50 cursor-pointer transition-all group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-14 h-14 object-cover rounded-lg shrink-0 border border-emerald-soft"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-ink line-clamp-1 group-hover:text-emerald">
                          {prod.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-emerald-deep">₹{prod.basePrice}</span>
                          <span className="text-[10px] text-muted line-through">₹{prod.baseMrp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Sparkles className="w-8 h-8 text-gold mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-ink">No exact products found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-muted mt-1">
                    Try searching for &ldquo;Magic Eraser&rdquo;, &ldquo;Microfiber&rdquo;, or &ldquo;Kitchen&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchOverlay;
