import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShoppingBag, Package, Star, Gift, BookOpen, Check } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';

export const ShopMegaMenu = ({ onClose }) => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const { addItem } = useCartStore();
  // Best sellers = products with the "Bestseller" badge, then the best rated by real reviews
  const bestSellers = products.filter((p) => p.badge === 'Bestseller' || (p.reviewCount > 0 && p.rating >= 4.8)).slice(0, 4);

  return (
    <div
      className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-2xl border-b border-emerald-soft/80 py-8 px-6 lg:px-12 z-50 animate-fadeIn"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left Column: Quick Navigation Links */}
        <div className="col-span-3 border-r border-emerald-soft pr-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Shop Essentials</span>
            <Link
              to="/shop"
              onClick={onClose}
              className="text-xs font-semibold text-emerald hover:text-emerald-deep flex items-center gap-1"
            >
              All Products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-1.5">
            <li>
              <Link
                to="/shop"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-ink hover:text-emerald hover:bg-emerald-soft/50 font-medium text-sm transition-all group"
              >
                <span className="group-hover:translate-x-1 transition-transform">Browse All Products</span>
                <span className="text-xs text-muted/80 bg-ivory px-2 py-0.5 rounded-full border border-muted/20">
                  {products.length}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=combos"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-ink hover:text-emerald hover:bg-emerald-soft/50 font-medium text-sm transition-all group"
              >
                <span className="group-hover:translate-x-1 transition-transform">Combos & Bundles</span>
                <span className="text-[10px] font-bold bg-gold-light text-emerald-900 px-2 py-0.5 rounded-full">
                  Save More
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/guides"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-ink hover:text-emerald hover:bg-emerald-soft/50 font-medium text-sm transition-all group"
              >
                <span className="group-hover:translate-x-1 transition-transform">Cleaning Guides</span>
              </Link>
            </li>
          </ul>

          <div className="pt-2 border-t border-emerald-soft/70">
            <div className="p-3 rounded-xl bg-ivory border border-emerald-soft text-xs text-emerald-deep space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-success" /> 100% Chemical-Free
              </p>
              <p className="text-[11px] text-muted">Water-activated German melamine foam</p>
            </div>
          </div>
        </div>

        {/* Center Column: Best Sellers with Quick Add */}
        <div className="col-span-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Customer Favorites</span>
            </div>
            <span className="text-xs text-emerald font-medium">⚡ Quick Add Available</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {bestSellers.map((prod) => (
              <div
                key={prod.id}
                className="group relative flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-emerald-soft hover:bg-ivory/60 transition-all duration-200"
              >
                <Link
                  to={`/product/${prod.slug}`}
                  onClick={onClose}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-emerald-soft/60 shadow-xs"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${prod.slug}`}
                    onClick={onClose}
                    className="text-xs font-semibold text-ink line-clamp-1 hover:text-emerald"
                  >
                    {prod.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-deep">₹{prod.basePrice}</span>
                    <span className="text-[10px] text-muted line-through">₹{prod.baseMrp}</span>
                  </div>
                  {prod.reviewCount > 0 && (
                    <div className="text-[10px] text-gold-dark font-medium mt-0.5 flex items-center gap-1">
                      ★ {prod.rating} ({prod.reviewCount})
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    addItem({ product: prod, variant: prod.variants[0], quantity: 1 });
                  }}
                  title="Quick Add"
                  className="w-8 h-8 rounded-full bg-emerald-soft text-emerald hover:bg-emerald hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-90"
                  aria-label={`Quick add ${prod.title}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Promo Banner Tile */}
        <div className="col-span-3 bg-gradient-to-br from-emerald-deep to-emerald rounded-2xl p-5 text-white flex flex-col justify-between shadow-soft relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold/20 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-gradient text-emerald-900 mb-2.5 shadow-sm">
              SPECIAL BUNDLE DEAL
            </span>
            <h4 className="font-serif text-lg font-bold leading-tight mb-1 text-ivory">
              Build Your Custom Cleaning Kit
            </h4>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Mix & match any items: Buy 3 @ ₹549 or Buy 5 @ ₹849. Save up to 50%!
            </p>
          </div>

          <Link
            to="/shop?category=combos"
            onClick={onClose}
            className="w-full bg-gold-gradient hover:opacity-95 text-emerald-950 font-bold text-xs py-2.5 px-4 rounded-xl text-center shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            Build Your Bundle <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopMegaMenu;
