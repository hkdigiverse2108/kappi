import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Droplets,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/product/ProductCard';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';

export const Combos = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  // Combos are the products in the "Combos" category in Admin > Products
  const products = useProductStore((s) => s.products);
  const preMadeCombos = products.filter((p) => p.category === 'Combos');

  // Filter options
  const filterOptions = [
    { id: 'All', label: 'All Combos' },
    { id: 'Popular', label: '⭐ Bestsellers' },
    { id: 'Budget', label: 'Under ₹600' }
  ];

  const filteredCombos = preMadeCombos.filter((combo) => {
    if (activeFilter === 'Popular') {
      return combo.badge?.toLowerCase().includes('best') || combo.badge?.toLowerCase().includes('popular') || (combo.reviewCount > 0 && combo.rating >= 4.9);
    }
    if (activeFilter === 'Budget') {
      return (combo.basePrice || combo.comboPrice || 0) <= 600;
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-20">
      <Helmet>
        <title>Curated Cleaning Combos & Value Kits | KAPEE Enterprise - Save up to 50%</title>
        <meta
          name="description"
          content="Shop pre-curated cleaning combos with discounts up to 50%. Complete kits for kitchen degreasing, bathroom scaling, and sneaker care with free delivery across India."
        />
        <link rel="canonical" href="https://kapee-enterprise.com/combos" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kapee-enterprise.com/combos" />
        <meta property="og:title" content="Curated Cleaning Combos & Value Kits | KAPEE Enterprise - Save up to 50%" />
        <meta property="og:description" content="Shop multi-item cleaning bundles engineered for tough stains. Save up to 50% with free express shipping." />
        <meta property="og:image" content="https://kapee-enterprise.com/hero_banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Curated Cleaning Combos & Value Kits | KAPEE Enterprise" />
        <meta name="twitter:description" content="Multi-item cleaning bundles with instant discounts up to 50%." />
        <meta name="twitter:image" content="https://kapee-enterprise.com/hero_banner.png" />
      </Helmet>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] py-14 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-stone-500 mb-2">
            <Link to="/" className="hover:text-emerald transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Combos & Kits</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-deep text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold" /> Exclusive Bundle Discounts
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-emerald-deep tracking-tight">
            Curated Cleaning Combos
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Multi-item value bundles engineered by our cleaning specialists for specific problem areas: kitchen grease, bathroom hard-water scale, and sneaker care. Save up to 50% with free delivery across India.
          </p>
        </div>
      </section>

      {/* Main Combos Listing */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald">
              Ready-to-Clean Bundles
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink mt-0.5">
              Explore Our Signature Kits
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeFilter === opt.id
                    ? 'bg-emerald-deep text-white shadow-xs scale-102'
                    : 'bg-white text-stone-600 hover:text-ink border border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with Staggered Animations */}
        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCombos.map((combo) => (
            <StaggerItem key={combo.id}>
              <ProductCard product={combo} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {filteredCombos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <p className="text-base font-bold text-ink">No combos found in this category.</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="btn-primary text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Show All Combos
            </button>
          </div>
        )}
      </section>

      {/* Bottom Value Proposition & Trust Strip */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald-deep">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">100% Water-Activated</h4>
                <p className="text-xs text-stone-500">Zero toxic fumes or harsh chemicals</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald-deep">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Free Express Delivery</h4>
                <p className="text-xs text-stone-500">Fast pan-India dispatch on all bundles</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald-deep">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Cash on Delivery</h4>
                <p className="text-xs text-stone-500">Cash on Delivery available</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald-deep">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Satisfaction Guarantee</h4>
                <p className="text-xs text-stone-500">Hassle-free 7-day replacement support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Combos;
