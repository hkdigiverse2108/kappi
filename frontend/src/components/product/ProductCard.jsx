import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Flame } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useUIStore } from '../../store/useUIStore';
import { isOutOfStock, isLowStock as isProductLowStock, isVariantAvailable } from '../../utils/stock';

export const getShortVariantName = (name) => {
  if (!name) return '';
  const packMatch = name.match(/pack\s*of\s*(\d+)/i);
  if (packMatch) {
    return `Pack of ${packMatch[1]}`;
  }
  let cleaned = name.replace(/\s*\([^)]*\)/g, '').trim();
  cleaned = cleaned.replace(/\s+Bottle/i, '');
  cleaned = cleaned.replace(/500ml\s*\+\s*500ml\s*Refill/i, '500ml + Refill');
  return cleaned || name;
};

export const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { setQuickViewProduct } = useUIStore();

  const isLiked = isInWishlist(product.id);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    product.variants?.findIndex((v) => v.bestValue) !== -1
      ? Math.max(0, product.variants?.findIndex((v) => v.bestValue))
      : 0
  );
  const [isHovered, setIsHovered] = useState(false);

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    price: product.basePrice,
    mrp: product.baseMrp,
    name: 'Standard'
  };

  const discountPercent = Math.round(
    ((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100
  );

  // Stock is set in Admin > Products > Quantity in Stock: 0 = Out of Stock, and a pack bigger than the stock left is unavailable
  const isProductSoldOut = isOutOfStock(product);
  const isSoldOut = isProductSoldOut || !isVariantAvailable(product, selectedVariant);
  const isLowStock = isProductLowStock(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addItem({
      product,
      variant: selectedVariant,
      quantity: 1
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleSelectVariant = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariantIndex(index);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col justify-between overflow-hidden bg-white relative rounded-2xl border border-stone-200/80 hover:border-emerald-deep/40 shadow-xs hover:shadow-[0_20px_40px_rgba(11,72,65,0.12)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
    >
      {/* Top Image Frame */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-[#FAF8F5]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
              isProductSoldOut ? 'grayscale-[40%]' : ''
            }`}
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button with Tactile Pop */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-xs border hover:scale-115 active:scale-90 ${
            isLiked
              ? 'bg-emerald text-white border-emerald scale-105'
              : 'bg-white/90 backdrop-blur-md text-stone-600 hover:text-emerald hover:bg-white border-stone-200/60'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button with Slide-Up Transition */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 hidden sm:block pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleQuickView}
            className="w-full py-2 bg-white/95 backdrop-blur-md text-emerald-deep hover:text-emerald text-xs font-bold rounded-xl shadow-md border border-emerald-soft flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:bg-white"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating Badge (average of the approved reviews; hidden until the product has one) */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs mb-1.5">
              <div className="flex items-center text-amber-600 font-bold gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{product.rating}</span>
              </div>
              <span className="text-stone-400 text-[11px]">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          )}

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-serif font-bold text-base text-stone-900 hover:text-emerald-deep line-clamp-1 transition-colors leading-snug block"
          >
            {product.title}
          </Link>

          {/* Variant Selector Pills */}
          {product.variants && product.variants.length > 1 ? (
            <div className="mt-2.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={(e) => handleSelectVariant(e, idx)}
                  className={`text-[10px] sm:text-[10.5px] font-semibold px-2 py-0.5 sm:px-2 sm:py-0.5 rounded-lg border transition-all whitespace-nowrap ${
                    !isVariantAvailable(product, v) ? 'line-through ' : ''
                  }${
                    selectedVariantIndex === idx
                      ? 'bg-emerald-deep text-white border-emerald-deep shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-stone-100'
                  }`}
                >
                  {getShortVariantName(v.name)}
                </button>
              ))}
            </div>
          ) : null}

          {/* Low Stock Urgency */}
          {isLowStock && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-2">
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>Hurry! Only {product.stock} left in stock</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2.5 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-deep tracking-tight">
                ₹{selectedVariant.price}
              </span>
              <span className="text-xs text-stone-400 line-through">
                ₹{selectedVariant.mrp}
              </span>
            </div>
            {selectedVariant.savings > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                Save ₹{selectedVariant.savings}
              </span>
            )}
          </div>

          <p className="text-[10px] text-stone-400 mb-2.5">Inclusive of all taxes</p>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            aria-disabled={isSoldOut}
            className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group/btn ${
              isSoldOut
                ? 'bg-red-50 text-red-700 border border-red-300 cursor-not-allowed shadow-none'
                : 'bg-emerald-deep hover:bg-emerald text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
            <span>{isSoldOut ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
