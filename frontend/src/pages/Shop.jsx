import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useProductStore } from '../store/useProductStore';
import { ProductCard } from '../components/product/ProductCard';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const Shop = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  return (
    <div className="space-y-6 pb-16">
      <Helmet>
        <title>Shop All Cleaning Products | KAPEE Enterprise India</title>
        <meta
          name="description"
          content="Buy premium chemical-free magic melamine erasers, kitchen scrub pads, and home cleaning essentials online. Fast pan-India delivery & COD available."
        />
        <link rel="canonical" href="https://kapee-enterprise.com/shop" />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kapee-enterprise.com/shop" />
        <meta property="og:title" content="Shop All Cleaning Products | KAPEE Enterprise" />
        <meta property="og:description" content="Discover our complete range of German melamine sponges and eco cleaning heroes. Free shipping on orders over ₹499." />
        <meta property="og:image" content="https://kapee-enterprise.com/hero_banner.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop All Cleaning Products | KAPEE Enterprise" />
        <meta name="twitter:description" content="Buy chemical-free magic melamine erasers and eco-friendly cleaning essentials online." />
        <meta name="twitter:image" content="https://kapee-enterprise.com/hero_banner.png" />

        {/* CollectionPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Products - KAPEE Enterprise",
            "url": "https://kapee-enterprise.com/shop",
            "description": "Complete collection of German melamine magic erasers, kitchen scrub pads, and eco cleaning essentials."
          })}
        </script>
      </Helmet>

      {/* Clean Modern Collection Header (Shopify Prestige Style) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-6 pb-2"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-muted mb-2">
            <Link to="/" className="hover:text-emerald transition-colors">Home</Link>
            <span className="text-muted/40">/</span>
            <span className="text-ink font-semibold">All Products</span>
          </nav>

          {/* Heading Row with Title, Count and Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-emerald-soft/60">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-sans">
                All Products
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-muted">
                ({products.length} Products)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              100% chemical-free, German-grade cleaning essentials
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area - max-w-[1380px] with balanced side whitespace & Stagger Animation on Open */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Full-Width 4-Column Responsive Product Grid with Scroll-Triggered Stagger */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: (idx % 4) * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
