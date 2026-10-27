import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Zap, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { StarRating } from '../common/StarRating';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { getShortVariantName } from './ProductCard';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct } = useUIStore();
  const { addItem, setIsCartOpen } = useCartStore();
  const navigate = useNavigate();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    price: product.basePrice,
    mrp: product.baseMrp,
    name: 'Standard'
  };

  const handleClose = () => {
    setQuickViewProduct(null);
    setQuantity(1);
    setSelectedImageIndex(0);
    setSelectedVariantIndex(0);
  };

  const handleAddToCart = () => {
    addItem({ product, variant: selectedVariant, quantity });
    handleClose();
  };

  const handleBuyNow = () => {
    addItem({ product, variant: selectedVariant, quantity });
    handleClose();
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl z-10 border border-emerald-soft overflow-hidden animate-fadeIn">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ivory hover:bg-emerald-soft text-muted hover:text-ink flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left: Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-emerald-soft/60 bg-ivory mb-3">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-emerald shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                {product.title}
              </h3>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <StarRating value={product.rating} className="w-3.5 h-3.5" fillClassName="fill-current text-gold" emptyClassName="text-stone-200" />
                  <span className="font-bold text-ink">{product.rating}</span>
                  <span className="text-muted">({product.reviewCount} review{product.reviewCount === 1 ? '' : 's'})</span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 p-3 rounded-2xl bg-ivory border border-emerald-soft">
              <span className="text-2xl font-bold text-emerald-deep">
                ₹{selectedVariant.price}
              </span>
              <span className="text-sm text-muted line-through">
                ₹{selectedVariant.mrp}
              </span>
              {selectedVariant.savings > 0 && (
                <span className="text-xs font-bold text-success bg-emerald-soft px-2 py-0.5 rounded-full">
                  Save ₹{selectedVariant.savings}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && (
              <div>
                <label className="block text-xs font-bold text-ink mb-2">
                  Select Pack Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedVariantIndex === idx
                          ? 'bg-emerald text-white border-emerald shadow-xs'
                          : 'bg-white text-ink border-emerald-soft hover:border-emerald'
                      }`}
                    >
                      {getShortVariantName(v.name)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 text-xs py-3"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-gold flex-1 text-xs py-3 font-bold"
                >
                  <Zap className="w-4 h-4" /> Buy Now
                </button>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={handleClose}
                className="block text-center text-xs font-semibold text-emerald hover:underline pt-1"
              >
                View Full Product Details, FAQs & Reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
