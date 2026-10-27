import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Check,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Heart,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  Sparkles,
  Copy,
  ChevronDown,
  Eye,
  Flame,
  Play,
  SlidersHorizontal,
  Tag,
  Leaf,
  Droplets,
  RefreshCw
} from 'lucide-react';

const renderTrustIcon = (iconName) => {
  const cls = "w-4 h-4 text-emerald mb-1";
  switch (iconName) {
    case 'Truck': return <Truck className={cls} />;
    case 'RotateCcw': return <RotateCcw className={cls} />;
    case 'ShieldCheck': return <ShieldCheck className={cls} />;
    case 'CreditCard': return <CreditCard className={cls} />;
    case 'Sparkles': return <Sparkles className={cls} />;
    case 'Zap': return <Zap className={cls} />;
    case 'Heart': return <Heart className={cls} />;
    case 'Leaf': return <Leaf className={cls} />;
    case 'Droplets': return <Droplets className={cls} />;
    case 'RefreshCw': return <RefreshCw className={cls} />;
    default: return <ShieldCheck className={cls} />;
  }
};
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { Select } from '../components/common/Select';
import { StarRating } from '../components/common/StarRating';
import { ProductCard, getShortVariantName } from '../components/product/ProductCard';
import { BeforeAfterSlider } from '../components/product/BeforeAfterSlider';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useUIStore } from '../store/useUIStore';
import { fetchProductPage } from '../api/productApi';
import { describeCoupon } from '../utils/coupons';
import { NotFound } from './NotFound';

// Customer photo strip above the reviews: this many tiles, the last one shows "+N" when there are more
const UGC_TILES = 8;

// YouTube / Vimeo page links -> embeddable player URLs
const toEmbedUrl = (url) => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return url;
};

// Review dates are stored like "18 Oct 2026"
const reviewTime = (rev) => Date.parse(rev.date) || 0;

// Product page content; all data comes from the backend via ProductDetail below
const ProductDetailView = ({ product, reviews, coupons, fbtCandidates, youMayAlsoLikeProducts }) => {
  const navigate = useNavigate();

  // All sections below are edited per product in Admin > Products
  const trustBadgesToDisplay = product.trustBadges || [];

  const howToUseHeadline = product.howToUse?.headline;
  const howToUseSteps = product.howToUse?.steps?.length
    ? product.howToUse.steps
    : (Array.isArray(product.howToUse)
        ? product.howToUse.map((s, idx) => ({ id: `s-${idx}`, title: s.title || `Step ${idx+1}`, desc: s.desc || '' }))
        : []);
  const howToUseProTip = product.howToUse?.proTip;

  const safeSurfaces = product.whereToUse?.safeSurfaces || [];
  const cautionSurfaces = product.whereToUse?.cautionSurfaces || [];

  const specificationsList = Array.isArray(product.specifications) && product.specifications.length
    ? product.specifications
    : (product.specs
        ? Object.entries(product.specs).map(([label, value], idx) => ({ id: `spec-${idx}`, label, value }))
        : []);

  const ecoSafetyNote = product.ecoNote;

  const { addItem, setIsCartOpen } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addRecentlyViewed } = useUIStore();

  const isLiked = isInWishlist(product.id);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImageState] = useState('');
  // Demo video from Admin > Products (shown in the lightbox instead of an image)
  const [lightboxVideo, setLightboxVideo] = useState('');
  const setLightboxImage = (src) => {
    setLightboxVideo('');
    setLightboxImageState(src);
  };

  // Accordions state in right column
  const [openAccordions, setOpenAccordions] = useState({
    'effectively-cleaning': true,
    'how-to-use': true,
    'where-to-use': false,
    'specifications': false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Frequently bought together checkboxes
  const [fbtSelected, setFbtSelected] = useState(() => fbtCandidates.map(() => true));

  // Reviews filter & sort state
  const [reviewSort, setReviewSort] = useState('recent');
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Everything in the reviews section comes from this product's approved reviews
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount) * 10) / 10
    : 0;
  const reviewPhotos = reviews.flatMap((r) => (r.photos || []).map((src) => ({ src, author: r.author })));
  const sortedReviews = (() => {
    if (reviewSort === 'photos') return reviews.filter((r) => r.photos?.length);
    const list = [...reviews];
    if (reviewSort === 'highest') return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    if (reviewSort === 'lowest') return list.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
    return list.sort((a, b) => reviewTime(b) - reviewTime(a));
  })();

  // Register in recently viewed
  useEffect(() => {
    addRecentlyViewed(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIndex(0);
  }, [product.id, addRecentlyViewed]);

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    price: product.basePrice,
    mrp: product.baseMrp,
    name: 'Standard',
    savings: product.baseMrp - product.basePrice,
    perPiece: product.basePrice
  };

  const discountPercent = Math.round(
    ((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100
  );

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code'
      });
      return;
    }
    const isFast = pincode.startsWith('11') || pincode.startsWith('40') || pincode.startsWith('56') || pincode.startsWith('50');
    setPincodeStatus({
      valid: true,
      message: isFast ? 'Express 48-Hour Delivery Available!' : 'Standard 3-5 Days Delivery Available',
      date: isFast ? 'Delivery by Friday, 24 Oct' : 'Delivery by Monday, 27 Oct',
      cod: 'Cash on Delivery is available'
    });
  };

  const handleAddToCart = () => {
    addItem({
      product,
      variant: selectedVariant,
      quantity
    });
  };

  const handleBuyNow = () => {
    addItem({
      product,
      variant: selectedVariant,
      quantity
    });
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleAddFbt = () => {
    addItem({ product, variant: selectedVariant, quantity: 1 });
    fbtCandidates.forEach((item, idx) => {
      if (fbtSelected[idx] && item.variants?.length) {
        addItem({ product: item, variant: item.variants[0], quantity: 1 });
      }
    });
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  // Calculate FBT total price
  const fbtTotalPrice =
    selectedVariant.price +
    fbtCandidates.reduce((acc, c, idx) => acc + (fbtSelected[idx] ? c.basePrice : 0), 0);
  const fbtTotalMrp =
    selectedVariant.mrp +
    fbtCandidates.reduce((acc, c, idx) => acc + (fbtSelected[idx] ? c.baseMrp : 0), 0);
  const fbtSavingsPercent = fbtTotalMrp > 0 ? Math.round(((fbtTotalMrp - fbtTotalPrice) / fbtTotalMrp) * 100) : 0;

  return (
    <div className="space-y-12 pb-24">
      <Helmet>
        {/* Product price for Facebook / WhatsApp shops (title, description & image come from RouteSeo) */}
        <meta property="product:price:amount" content={String(product.basePrice)} />
        <meta property="product:price:currency" content="INR" />

        {/* Product JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "image": product.images.map((img) => img.startsWith('http') ? img : `https://kapee-enterprise.com${img}`),
            "description": product.subtitle,
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": "KAPEE"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://kapee-enterprise.com/product/${product.slug}`,
              "priceCurrency": "INR",
              "price": String(product.basePrice),
              "priceValidUntil": "2027-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "KAPEE Enterprise"
              }
            },
            ...(reviewCount
              ? {
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": String(avgRating),
                    "reviewCount": String(reviewCount),
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                }
              : {})
          })}
        </script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-2 text-xs text-muted flex-wrap">
          <Link to="/" className="hover:text-emerald">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-emerald">Shop</Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{product.title}</span>
        </nav>
      </div>

      {/* Top Product Hero (Gallery + Purchase Configurator + Accordions) */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* ========================================================
              LEFT COLUMN: STICKY IMAGE GALLERY — Happi Planet style
              Thumbnails on far left | Large portrait card on right
             ======================================================== */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 z-10 self-start">
            <div className="flex flex-row gap-3 items-start">

              {/* Vertical Thumbnail Strip — left side */}
              <div className="flex flex-col gap-2 shrink-0 w-[68px]">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-emerald-deep shadow-md'
                        : 'border-gray-200 hover:border-emerald/50'
                    }`}
                    style={{ background: '#f0f7f5' }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}

                {product.videoUrl && (
                  <button
                    onClick={() => {
                      setLightboxVideo(product.videoUrl);
                      setLightboxOpen(true);
                    }}
                    className="w-[68px] h-[68px] rounded-xl overflow-hidden border-2 border-emerald-soft bg-emerald-deep text-white flex flex-col items-center justify-center shrink-0 hover:border-gold transition-all"
                    aria-label="View demo video"
                  >
                    <Play className="w-4 h-4 fill-current text-gold-light" />
                    <span className="text-[9px] font-bold mt-0.5">Video</span>
                  </button>
                )}
              </div>

              {/* Main Product Image — portrait card with pastel background */}
              <div
                onClick={() => {
                  setLightboxImage(product.images[selectedImageIndex] || product.images[0]);
                  setLightboxOpen(true);
                }}
                className="flex-1 rounded-2xl overflow-hidden cursor-zoom-in group relative"
                style={{
                  aspectRatio: '4/5',
                  minHeight: '520px',
                  maxHeight: '660px'
                }}
              >
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount badge — top left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.badge && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-deep text-white shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-gold-gradient text-emerald-950 shadow-sm">
                    {discountPercent}% OFF
                  </span>
                </div>

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ink shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3 text-emerald" /> Zoom
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: CONFIGURATOR, BUY ACTIONS & ACCORDIONS
             ======================================================== */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              {/* Quality & Safety Badge (set per product in the admin) */}
              {product.qualityBadge && (
                <div className="flex items-center mb-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-success bg-emerald-soft px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> {product.qualityBadge}
                  </span>
                </div>
              )}

              {/* Title & Tagline */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight font-sans">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                {product.subtitle}
              </p>

              {/* Rating & Urgency Counter */}
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-emerald-soft/70">
                <a
                  href="#reviews-section"
                  className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-emerald"
                >
                  {reviewCount > 0 ? (
                    <>
                      <StarRating value={avgRating} className="w-3.5 h-3.5" fillClassName="fill-current text-emerald-deep" emptyClassName="text-gray-200" />
                      <span>{avgRating}</span>
                      <span className="text-muted underline">
                        ({reviewCount} customer review{reviewCount === 1 ? '' : 's'})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted underline">No reviews yet</span>
                  )}
                </a>
              </div>

              {/* Live viewing count (set per product in the admin; hidden when empty) */}
              {(product.viewingCount > 0 || product.soldIn24h > 0) && (
                <div className="flex items-center gap-4 text-xs font-semibold text-emerald-deep mt-2">
                  {product.viewingCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald" />
                      {product.viewingCount} people viewing right now
                    </span>
                  )}
                  {product.viewingCount > 0 && product.soldIn24h > 0 && <span>•</span>}
                  {product.soldIn24h > 0 && (
                    <span className="flex items-center gap-1 text-gold-dark">
                      <Flame className="w-3.5 h-3.5 text-gold-dark" />
                      {product.soldIn24h} sold in last 24h
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price Block */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-emerald-soft space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-emerald-deep">
                  ₹{selectedVariant.price}
                </span>
                <span className="text-base text-muted line-through">
                  ₹{selectedVariant.mrp}
                </span>
                <span className="text-xs font-bold text-success bg-emerald-soft px-2.5 py-0.5 rounded-full">
                  Save ₹{selectedVariant.savings} ({discountPercent}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-muted">Inclusive of all taxes • Free shipping on orders ₹499+</p>
            </div>

            {/* Pack Selector Pills with per-piece price */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-ink text-xs sm:text-sm">Choose Pack Size:</span>
                  {selectedVariant.perPiece && (
                    <span className="text-emerald font-bold text-xs">
                      ₹{selectedVariant.perPiece} / piece
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative flex flex-col justify-start min-w-0 ${
                        selectedVariantIndex === idx
                          ? 'border-emerald bg-emerald-soft/50 shadow-xs ring-1 ring-emerald/30'
                          : 'border-emerald-soft bg-white hover:border-emerald/40'
                      }`}
                    >
                      {v.bestValue && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold-gradient text-emerald-950 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase whitespace-nowrap z-10">
                          BEST VALUE
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-ink leading-tight truncate w-full block">
                        {getShortVariantName(v.name)}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1 leading-tight">
                        <span className="text-sm sm:text-base font-black text-emerald-deep">₹{v.price}</span>
                        <span className="text-[10px] sm:text-[11px] text-muted/80 line-through">₹{v.mrp}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-muted mt-1 font-medium leading-tight whitespace-nowrap block">
                        ₹{v.perPiece}/pc
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-muted/30 rounded-xl overflow-hidden bg-white shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-muted hover:text-ink hover:bg-emerald-soft transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-xs text-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-muted hover:text-ink hover:bg-emerald-soft transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 text-xs sm:text-sm font-bold py-3.5 tracking-wider uppercase"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200 shrink-0 ${
                    isLiked
                      ? 'bg-emerald text-white border-emerald shadow-sm hover:bg-emerald-deep active:scale-95'
                      : 'bg-white text-ink border-emerald-soft hover:border-emerald hover:text-emerald hover:bg-emerald-soft/40 active:scale-95'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-transform duration-200 ${isLiked ? 'fill-current scale-105' : ''}`} />
                </button>
              </div>

              {/* Buy Now Button (Gold Gradient) */}
              <button
                onClick={handleBuyNow}
                className="btn-gold w-full text-xs sm:text-sm font-bold py-3.5 shadow-gold tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Buy Now • Express Checkout
              </button>
            </div>

            {/* Offers Box (Bank, UPI, Coupons with ticket voucher design) */}
            {coupons.length > 0 && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-soft flex items-center justify-center text-emerald">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-ink">Available Offers & Coupons</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-deep bg-emerald-soft/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {coupons.length} {coupons.length === 1 ? 'Offer' : 'Offers'} Available
                </span>
              </div>

              <div className="space-y-2.5">
                {coupons.map((coupon, idx) => {
                  const { title, subtitle } = describeCoupon(coupon);
                  // Cards alternate between the emerald and gold voucher styles
                  const isGold = idx % 2 === 1;
                  return (
                    <div
                      key={coupon.id || coupon.code}
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group relative overflow-hidden ${
                        copiedCoupon === coupon.code
                          ? 'border-emerald bg-emerald-soft/50 shadow-xs'
                          : 'border-stone-200/90 bg-white hover:border-emerald/50 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isGold ? (
                          <div className="bg-gold-50 text-gold-dark font-mono font-black text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-gold/60 flex items-center gap-1.5 shrink-0 tracking-wider shadow-2xs">
                            <Sparkles className="w-3 h-3 text-gold-dark" />
                            <span>{coupon.code}</span>
                          </div>
                        ) : (
                          <div className="bg-emerald-soft/70 text-emerald-deep font-mono font-black text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-emerald/50 flex items-center gap-1.5 shrink-0 tracking-wider shadow-2xs">
                            <Tag className="w-3 h-3 text-emerald" />
                            <span>{coupon.code}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-ink leading-tight truncate">{title}</p>
                          <p className="text-[11px] text-muted leading-tight mt-0.5 truncate">{subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCoupon(coupon.code);
                        }}
                        aria-label={`Copy coupon code ${coupon.code}`}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 ${
                          copiedCoupon === coupon.code
                            ? 'bg-success text-white'
                            : 'bg-emerald text-white hover:bg-emerald-deep'
                        }`}
                      >
                        {copiedCoupon === coupon.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* Pincode Delivery Checker */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-soft space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald" /> Check Delivery & COD Availability
                </span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 560103)"
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-deep text-white text-xs font-bold rounded-xl hover:bg-emerald transition-colors"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <div
                  className={`text-xs p-2.5 rounded-xl border ${
                    pincodeStatus.valid
                      ? 'bg-emerald-soft/60 border-emerald/30 text-emerald-deep'
                      : 'bg-red-50 border-error/30 text-error'
                  }`}
                >
                  <p className="font-bold">{pincodeStatus.message}</p>
                  {pincodeStatus.valid && (
                    <div className="text-[11px] text-muted mt-1 space-y-0.5">
                      <p>📅 {pincodeStatus.date}</p>
                      <p>💵 {pincodeStatus.cod}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trust Mini-row (set per product in the admin) */}
            {trustBadgesToDisplay.length > 0 && (
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-muted pt-2 border-t border-emerald-soft">
              {trustBadgesToDisplay.map((tb, idx) => (
                <div key={tb.id || idx} className="flex flex-col items-center">
                  {renderTrustIcon(tb.icon)}
                  <span>{tb.text}</span>
                </div>
              ))}
            </div>
            )}

            {/* ========================================================
                CLEAN ACCORDIONS LIST (Exact Happi Planet Screenshot 2)
               ======================================================== */}
            <div className="pt-4 border-t border-gray-200 divide-y divide-gray-200">
              {/* Effectively Cleaning with Interactive Before/After Slider */}
              {(product.beforeAfter?.some((b) => b.before && b.after) || product.featureBadges?.length > 0) && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('effectively-cleaning')}
                  className="w-full py-4 flex items-center justify-between text-left hover:text-emerald transition-colors"
                >
                  <span className="font-bold text-ink text-sm sm:text-base">Effectively Cleaning</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink transition-transform duration-200 ${
                      openAccordions['effectively-cleaning'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions['effectively-cleaning'] && (
                  <div className="pb-5 pt-1 animate-fadeIn">
                    <BeforeAfterSlider product={product} />
                  </div>
                )}
              </div>
              )}

              {/* 1. How to Use */}
              {howToUseSteps.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('how-to-use')}
                  className="w-full py-4 flex items-center justify-between text-left hover:text-emerald transition-colors"
                >
                  <span className="font-bold text-ink text-sm sm:text-base">How to Use</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink transition-transform duration-200 ${
                      openAccordions['how-to-use'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions['how-to-use'] && (
                  <div className="pb-4 text-xs sm:text-sm text-muted leading-relaxed space-y-2.5 animate-fadeIn">
                    {howToUseHeadline && <p className="font-semibold text-ink">{howToUseHeadline}</p>}
                    <ol className="list-decimal pl-5 space-y-1.5">
                      {howToUseSteps.map((step, idx) => (
                        <li key={step.id || idx}>
                          <strong>{step.title}:</strong> {step.desc}
                        </li>
                      ))}
                    </ol>
                    {howToUseProTip && (
                      <div className="pt-1 text-[11px] text-emerald-deep bg-emerald-soft/50 p-2.5 rounded-xl">
                        💡 <strong>Pro Tip:</strong> {howToUseProTip}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* 3. Where to Use & Caution */}
              {(safeSurfaces.length > 0 || cautionSurfaces.length > 0) && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('where-to-use')}
                  className="w-full py-4 flex items-center justify-between text-left hover:text-emerald transition-colors"
                >
                  <span className="font-bold text-ink text-sm sm:text-base">Where to Use & Caution</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink transition-transform duration-200 ${
                      openAccordions['where-to-use'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions['where-to-use'] && (
                  <div className="pb-4 text-xs sm:text-sm space-y-3 animate-fadeIn">
                    {/* Safe Surfaces */}
                    {safeSurfaces.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-soft/50 border border-emerald/20 space-y-1.5">
                      <p className="font-bold text-emerald-deep flex items-center gap-1.5 text-xs">
                        <Check className="w-4 h-4 text-emerald shrink-0" /> Safe & Recommended For:
                      </p>
                      <ul className="text-muted text-xs space-y-1 pl-5 list-disc leading-relaxed">
                        {safeSurfaces.map((safe, idx) => (
                          <li key={safe.id || idx}>
                            <strong>{safe.label || safe.name}:</strong> {safe.desc || safe.note}
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}

                    {/* Caution Surfaces */}
                    {cautionSurfaces.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 space-y-1.5">
                      <p className="font-bold text-rose-800 flex items-center gap-1.5 text-xs">
                        <X className="w-4 h-4 text-rose-600 shrink-0" /> Caution — Do NOT Use On:
                      </p>
                      <ul className="text-stone-600 text-xs space-y-1 pl-5 list-disc leading-relaxed">
                        {cautionSurfaces.map((caut, idx) => (
                          <li key={caut.id || idx}>
                            {typeof caut === 'string' ? caut : (caut.text || caut.name)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* 4. Specifications & Eco-Safety */}
              {(specificationsList.length > 0 || ecoSafetyNote) && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('specifications')}
                  className="w-full py-4 flex items-center justify-between text-left hover:text-emerald transition-colors"
                >
                  <span className="font-bold text-ink text-sm sm:text-base">Specifications & Eco-Safety</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink transition-transform duration-200 ${
                      openAccordions['specifications'] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions['specifications'] && (
                  <div className="pb-4 text-xs sm:text-sm space-y-3 animate-fadeIn">
                    {specificationsList.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {specificationsList.map((spec, idx) => (
                        <div key={spec.id || idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80">
                          <p className="text-muted text-[11px]">{spec.label || spec.name}</p>
                          <p className="font-bold text-ink mt-0.5">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                    )}

                    {ecoSafetyNote && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-soft/50 border border-emerald/20 text-xs text-emerald-deep">
                        <ShieldCheck className="w-4 h-4 text-emerald shrink-0" />
                        <span><strong>Eco-Friendly & Safe:</strong> {ecoSafetyNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Box with Scroll Reveal (products chosen in the admin) */}
      {fbtCandidates.length > 0 && (
      <FadeIn direction="up">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-dark" />
              <h3 className="text-sm sm:text-base font-bold text-ink">Frequently Bought Together</h3>
            </div>
            {fbtTotalMrp > fbtTotalPrice && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                Combo Savings: Save ₹{fbtTotalMrp - fbtTotalPrice} ({fbtSavingsPercent}% OFF)
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row items-stretch gap-4 xl:gap-5">

              {/* Product items: equal-width flex-1 cards with centered + badges */}
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">

                {/* Current product (This item) */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-soft/25 border-2 border-emerald/30 flex-1 min-w-0 transition-all">
                  <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 shadow-2xs">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald bg-white px-2 py-0.5 rounded-full border border-emerald/20 inline-block">This Item</span>
                    <p className="text-xs sm:text-sm font-bold text-ink line-clamp-2 mt-1 leading-snug" title={product.title}>{product.title}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm sm:text-base font-extrabold text-emerald-deep">₹{selectedVariant.price}</span>
                      <span className="text-xs text-muted line-through">₹{selectedVariant.mrp}</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald flex items-center justify-center shrink-0 text-white shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Plus & FBT Candidates */}
                {fbtCandidates.map((c, idx) => (
                  <React.Fragment key={c.id}>
                    <div className="flex items-center justify-center shrink-0">
                      <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-black text-gray-500 shadow-2xs">+</span>
                    </div>

                    <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all flex-1 min-w-0 ${
                      fbtSelected[idx]
                        ? 'bg-emerald-soft/15 border-emerald/30 shadow-2xs'
                        : 'bg-gray-50/70 border-gray-200 opacity-60'
                    }`}>
                      <div className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden border shrink-0 shadow-2xs ${fbtSelected[idx] ? 'border-emerald/30 bg-white' : 'border-gray-200 bg-gray-100'}`}>
                        <img src={c.images[0]} alt={c.title} className={`w-full h-full object-cover transition-opacity ${fbtSelected[idx] ? 'opacity-100' : 'opacity-40'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${fbtSelected[idx] ? 'text-ink' : 'text-muted'}`} title={c.title}>{c.title}</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className={`text-sm sm:text-base font-extrabold ${fbtSelected[idx] ? 'text-emerald-deep' : 'text-muted'}`}>₹{c.basePrice}</span>
                          <span className="text-xs text-muted line-through">₹{c.baseMrp}</span>
                        </div>
                      </div>
                      {/* Checkbox */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        fbtSelected[idx] ? 'bg-emerald border-emerald shadow-xs' : 'bg-white border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={fbtSelected[idx]}
                          onChange={(e) => {
                            const copy = [...fbtSelected];
                            copy[idx] = e.target.checked;
                            setFbtSelected(copy);
                          }}
                          className="sr-only"
                        />
                        {fbtSelected[idx] && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </label>
                  </React.Fragment>
                ))}
              </div>

              {/* Dedicated Right Bundle Card */}
              <div className="xl:w-72 shrink-0 bg-emerald-soft/20 rounded-xl p-4 border border-emerald/20 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted">Bundle Total</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Save ₹{fbtTotalMrp - fbtTotalPrice}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-deep">₹{fbtTotalPrice}</span>
                    <span className="text-sm text-muted line-through">₹{fbtTotalMrp}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={handleAddFbt}
                    className="btn-gold w-full font-bold py-2.5 px-4 text-sm flex items-center justify-center gap-2 rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Bundle to Cart</span>
                  </button>
                  <p className="text-[11px] text-muted text-center flex items-center justify-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald" /> Free delivery on this bundle
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </FadeIn>
      )}

      {/* ========================================================
          CUSTOMER REVIEWS & UGC SECTION (Exact Happi Planet Screenshot 3 & 4)
         ======================================================== */}
      <div id="reviews-section" className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        {/* Customer Photos & Videos Header (Judge.me Style) */}
        <div>
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink">
                Customer Reviews & Real Results
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {reviewCount > 0 ? (
                  <>
                    <StarRating value={avgRating} fillClassName="fill-current text-emerald-deep" emptyClassName="text-gray-200" />
                    <span className="text-sm font-bold text-ink">{avgRating} / 5</span>
                    <span className="text-xs text-muted">
                      ({reviewCount} customer review{reviewCount === 1 ? '' : 's'})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted">No reviews yet for this product.</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setWriteReviewOpen(true)}
              className="px-4 py-2 bg-emerald-deep hover:bg-emerald text-white text-xs font-bold rounded-full transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Customer photos from this product's reviews */}
          {reviewPhotos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5 rounded-2xl overflow-hidden bg-gray-50 p-2 sm:p-3 border border-gray-200">
              {reviewPhotos.slice(0, UGC_TILES).map((photo, idx) => {
                // The last tile is covered by "+N", so it counts as one of the hidden photos
                const moreCount = idx === UGC_TILES - 1 && reviewPhotos.length > UGC_TILES ? reviewPhotos.length - (UGC_TILES - 1) : 0;
                return (
                  <div
                    key={`${photo.src}-${idx}`}
                    onClick={() => {
                      if (moreCount > 0) {
                        // Show the reviews that have photos
                        setReviewSort('photos');
                        document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth' });
                        return;
                      }
                      setLightboxImage(photo.src);
                      setLightboxOpen(true);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-200"
                  >
                    <img
                      src={photo.src}
                      alt={`Photo by ${photo.author}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {moreCount > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                        <span className="text-[10px] font-bold">+{moreCount}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters & Sort Toolbar (as seen in Screenshot 3) */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-ink flex items-center gap-1.5 hover:border-ink transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
              <span>Filters</span>
            </button>

            <Select
              value={reviewSort}
              onChange={setReviewSort}
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'highest', label: 'Highest Rating' },
                { value: 'lowest', label: 'Lowest Rating' },
                { value: 'photos', label: 'With Photos' },
              ]}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-ink focus:outline-none focus:border-ink shadow-2xs"
              menuClassName="right-0 text-xs"
            />
          </div>
        </div>

        {/* Screenshot 4: Verified Customer Reviews List with Scroll Reveal */}
        <div id="reviews-list" className="divide-y divide-gray-200 border-t border-gray-200">
          {sortedReviews.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              {reviewCount === 0 ? 'No reviews yet for this product.' : 'No reviews with photos yet.'}
            </p>
          )}
          {sortedReviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="py-5 sm:py-6 space-y-2.5"
            >
              {/* 5 Teal/Emerald Stars (Exact #006056 from Screenshot 4) */}
              <div className="flex text-emerald-deep gap-0.5">
                <StarRating value={rev.rating} fillClassName="fill-current text-emerald-deep" emptyClassName="text-gray-200" />
              </div>

              {/* Avatar Initial + Name + Verified Badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-ink uppercase shrink-0 border border-gray-200">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-ink">
                      {rev.author}
                    </span>
                    {rev.verified && (
                      <span className="text-[10px] font-medium text-ink border border-gray-300 px-2 py-0.5 rounded-full bg-gray-50">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {rev.date}
                  </span>
                </div>
              </div>

              {/* Review Comment Text */}
              <p className="text-xs sm:text-sm text-ink leading-relaxed pt-1">
                {rev.comment}
              </p>

              {/* Customer Photos */}
              {rev.photos?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.photos.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLightboxImage(src);
                        setLightboxOpen(true);
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-emerald transition-colors"
                    >
                      <img src={src} alt={`Photo by ${rev.author}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {writeReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setWriteReviewOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 border border-emerald-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-soft">
              <h3 className="font-bold text-lg text-ink font-sans">Write a Customer Review</h3>
              <button onClick={() => setWriteReviewOpen(false)} className="p-1 text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Your Overall Rating:</label>
                <div className="flex gap-1 text-emerald-deep text-lg cursor-pointer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-6 h-6 fill-current text-emerald-deep" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Your Full Name:</label>
                <input
                  type="text"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Vishakha Patel"
                  className="w-full p-2.5 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Your Review:</label>
                <textarea
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your cleaning results, surface experience, or tips..."
                  className="w-full p-2.5 rounded-xl border border-emerald-soft focus:outline-none focus:border-emerald"
                />
              </div>

              <button
                onClick={() => {
                  alert('Thank you! Your verified review has been submitted.');
                  setWriteReviewOpen(false);
                }}
                className="btn-primary w-full text-xs py-3 font-bold"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          {lightboxVideo ? (
            /youtube\.com|youtu\.be|vimeo\.com/.test(lightboxVideo) ? (
              <iframe
                src={toEmbedUrl(lightboxVideo)}
                title={`${product.title} video`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl aspect-video rounded-2xl shadow-2xl bg-black"
              />
            ) : (
              <video
                src={lightboxVideo}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl bg-black"
              />
            )
          ) : (
            <img
              src={lightboxImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          )}
        </div>
      )}

      {/* You May Also Like (products chosen in the admin) with Scroll Reveal */}
      {youMayAlsoLikeProducts.length > 0 && (
        <FadeIn direction="up">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-emerald-soft">
            <h3 className="text-xl sm:text-2xl font-bold text-ink mb-6 font-sans">
              You May Also Like
            </h3>
            <StaggerContainer staggerChildren={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {youMayAlsoLikeProducts.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}
    </div>
  );
};

// Product pages already opened in this session show instantly while the latest data loads
const productPageCache = new Map();

export const ProductDetail = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(() => productPageCache.get(slug) || null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPage(productPageCache.get(slug) || null);
    setNotFound(false);

    fetchProductPage(slug)
      .then((data) => {
        productPageCache.set(slug, data);
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled && !productPageCache.has(slug)) setNotFound(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) return <NotFound />;
  if (!page) return null;

  return (
    <ProductDetailView
      key={page.product.id}
      product={page.product}
      reviews={page.reviews || []}
      coupons={page.coupons || []}
      fbtCandidates={page.frequentlyBoughtTogether || []}
      youMayAlsoLikeProducts={page.youMayAlsoLike || []}
    />
  );
};

export default ProductDetail;
