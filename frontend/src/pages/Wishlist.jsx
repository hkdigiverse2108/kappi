import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/common/MotionWrapper';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useProductStore } from '../store/useProductStore';
import { firstAvailableVariant, isOutOfStock } from '../utils/stock';
import { ProductCard } from '../components/product/ProductCard';
import { confirmDelete } from '../store/useConfirmStore';

export const Wishlist = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem, setIsCartOpen } = useCartStore();

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      addItem({
        product: item,
        variant: firstAvailableVariant(item),
        quantity: 1
      });
    });
    setIsCartOpen(true);
  };

  // Trending recommendations when empty
  const trendingProducts = products.slice(0, 4);

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <Helmet>
        <title>{`My Wishlist (${wishlist.length}) | KAPEE Enterprise`}</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-soft/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-soft flex items-center justify-center text-emerald-deep">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">My Wishlist</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1.5 ml-0.5">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved to purchase later
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleMoveAllToCart}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Move All to Cart
            </button>
            <button
              onClick={clearWishlist}
              className="text-xs text-error font-semibold hover:underline py-2 px-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="space-y-12">
          {/* Empty State Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-emerald-soft/60 shadow-soft max-w-xl mx-auto space-y-4"
          >
            <div className="w-20 h-20 bg-emerald-soft/80 rounded-full flex items-center justify-center mx-auto text-emerald-deep shadow-inner">
              <Heart className="w-10 h-10 text-emerald-deep" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink">Your Wishlist is Empty</h2>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Explore our German melamine magic erasers, chimney busters, and cleaning essentials, and tap the heart icon to save your favorites here.
            </p>
            <div className="pt-2">
              <Link to="/shop" className="btn-primary inline-flex text-xs px-7 py-3 cursor-pointer">
                Explore Best Cleaners <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Recommended Products Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-dark" /> Recommended Cleaners
                </h3>
                <p className="text-xs text-muted mt-0.5">Top picks customer favorites to start your cleaning journey</p>
              </div>
              <Link to="/shop" className="text-xs sm:text-sm font-bold text-emerald hover:underline whitespace-nowrap shrink-0">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: (idx % 4) * 0.05 }}
              className="bg-white rounded-2xl border border-emerald-soft/70 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-ivory/60 p-3">
                <Link to={`/product/${item.slug}`} className="block w-full h-full">
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => confirmDelete({ title: 'Remove from Wishlist?', message: `Remove ${item.title} from your wishlist?`, onConfirm: () => removeFromWishlist(item.id) })}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/95 hover:bg-white text-error rounded-full shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Remove from wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-medium text-xs sm:text-sm text-ink hover:text-emerald line-clamp-2 leading-snug block"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm sm:text-base font-bold text-emerald-deep">
                      ₹{item.basePrice || item.price}
                    </span>
                    {(item.baseMrp || item.mrp) > (item.basePrice || item.price) && (
                      <span className="text-xs text-muted line-through">
                        ₹{item.baseMrp || item.mrp}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isOutOfStock(item)) return;
                    addItem({
                      product: item,
                      variant: firstAvailableVariant(item),
                      quantity: 1
                    });
                    setIsCartOpen(true);
                  }}
                  aria-disabled={isOutOfStock(item)}
                  className={
                    isOutOfStock(item)
                      ? 'w-full text-xs py-2.5 rounded-xl font-bold bg-red-50 text-red-700 border border-red-300 cursor-not-allowed flex items-center justify-center gap-1.5'
                      : 'btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer'
                  }
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> {isOutOfStock(item) ? 'Out of Stock' : 'Move to Cart'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
