import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useUIStore } from '../../store/useUIStore';

/**
 * Desktop Header Search Input Box (Exact Happi Planet style)
 * Replaces the desktop navigation links when search is active.
 * Features clean rounded-lg rectangular border, placeholder "I'm looking for",
 * with clear (X) and search icon on the right.
 */
export const HeaderSearchInput = () => {
  const { searchQuery, setSearchQuery, setIsSearchOpen } = useUIStore();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Focus automatically when search opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    const handleClickOutside = (e) => {
      const panel = document.getElementById('header-search-dropdown-panel');
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        panel &&
        !panel.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div ref={containerRef} className="hidden lg:flex flex-1 max-w-xl mx-8 animate-fadeIn">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="I'm looking for"
          className="w-full pl-4 pr-14 py-2 rounded-lg border border-gray-400 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-black transition-colors h-10 shadow-2xs"
          autoComplete="off"
          spellCheck="false"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-600">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Attached Search Dropdown Panel (Exact Happi Planet style)
 * Hangs directly below the header on white background.
 * - When empty: Slim single line "Popular Searches:" centered with no big canvas.
 * - When typing: "Results for [query]" + 6-product grid + "Show All Results" pill button.
 */
export const HeaderSearchDropdown = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useUIStore();
  const mobileInputRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

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

  const trimmed = searchQuery.trim().toLowerCase();

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleProductClick = (slug) => {
    setIsSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const matchedProducts = trimmed
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.subtitle.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <>
      {/* Invisible backdrop overlay to dismiss search when clicking outside (zero grey stripe) */}
      <div
        className="fixed inset-0 z-10"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />

      {/* White Dropdown Panel directly attached to the header */}
      <div
        id="header-search-dropdown-panel"
        ref={panelRef}
        className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-30 animate-fadeIn"
      >
        {/* Mobile Input Bar (< 1024px) */}
        <div className="lg:hidden px-4 py-2.5 border-b border-gray-200 bg-white">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="I'm looking for"
              className="w-full pl-4 pr-16 py-2 rounded-lg border border-gray-400 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-black h-10"
              autoComplete="off"
              autoFocus
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-600">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:text-black cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="p-1 text-gray-700 hover:text-black cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {!trimmed ? (
          /* Empty Search State (Exact Happi Planet style): Slim single line with "Popular Searches:" */
          <div className="w-full py-3.5 sm:py-4 px-4 text-center">
            <span className="text-xs sm:text-sm font-normal text-gray-500 tracking-wide">
              Popular Searches:
            </span>
          </div>
        ) : (
          /* Typed State (Exact Happi Planet style): Results for "query" + 6 Products + Show All Results */
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pb-8">
            {/* Results Title: Results for "query" */}
            <div className="text-center mb-4">
              <span className="text-sm font-normal text-gray-700">
                Results for &ldquo;<strong className="font-bold text-gray-900">{searchQuery}</strong>&rdquo;
              </span>
            </div>

            {matchedProducts.length > 0 ? (
              <>
                {/* 6-Column Responsive Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {matchedProducts.slice(0, 6).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleProductClick(prod.slug)}
                      className="group flex flex-col bg-white rounded-lg p-2 border border-transparent hover:border-gray-200 hover:shadow-xs cursor-pointer transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="aspect-square w-full rounded-md bg-[#F4F8F6] overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs font-medium text-gray-800 group-hover:text-emerald-deep line-clamp-2 leading-snug flex-1 mb-1 transition-colors">
                        {prod.title}
                      </h4>

                      {/* Price: MRP (strikethrough) + Selling Price */}
                      <div className="flex items-center gap-1.5 mt-auto pt-1">
                        {prod.baseMrp > prod.basePrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{prod.baseMrp}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-900">
                          ₹{prod.basePrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show All Results Button (Happi Planet dark emerald pill button) */}
                <div className="text-center mt-5 pt-1">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="bg-[#0A5C55] hover:bg-[#074640] text-white text-xs sm:text-sm font-bold py-2.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Show All Results</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm font-normal text-gray-600">
                  No products found for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export const HeaderSearchBar = () => {
  return (
    <>
      <HeaderSearchInput />
      <HeaderSearchDropdown />
    </>
  );
};

export default HeaderSearchBar;
