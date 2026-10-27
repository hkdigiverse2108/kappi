import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Banknote,
  Leaf,
  Star,
  Check,
  X,
  Play,
  Heart,
  Droplets,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Globe
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProductCard } from '../components/product/ProductCard';
import { BeforeAfterSlider } from '../components/home/BeforeAfterSlider';
import { AutoScrollReviews } from '../components/home/AutoScrollReviews';
import { HousePromiseCard } from '../components/home/HousePromiseCard';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { useAdminStore } from '../admin/store/adminStore';

const ICON_MAP = {
  Sparkles,
  ShieldCheck,
  Droplets,
  Zap,
  Leaf,
  Truck,
  Star,
  Check
};

// Links typed without a scheme (e.g. "instagram.com/p/...") would open as a page of this site
const toExternalUrl = (url) => {
  const link = (url || '').trim();
  if (!link) return undefined;
  return /^(https?:)?\/\//i.test(link) || link.startsWith('/') ? link : `https://${link}`;
};



export const Home = () => {
  // All home content is managed in Admin > Homepage CMS and loaded from the backend (GET /api/home)
  const {
    seo,
    heroBanner,
    trustSection,
    trustPillars,
    bestSellersSection,
    beforeAfterSettings,
    howItWorksHeader,
    howItWorksSteps,
    reviewsSection,
    comparisonTable,
    ugcSection,
    homepageSections,
    homeBestSellers,
    homeFeaturedReviews
  } = useAdminStore();

  const activeTrustPillars = (trustPillars || []).filter((p) => p.active !== false);
  const activeHowItWorksSteps = (howItWorksSteps || []).filter((s) => s.active !== false);
  const activeComparisonRows = (comparisonTable?.rows || []).filter((r) => r.active !== false);
  const activeUgcImages = (ugcSection?.images || []).filter((img) => img.active !== false);

  const isSectionVisible = (sectionId) => {
    if (!homepageSections || homepageSections.length === 0) return true;
    const sec = homepageSections.find((s) => s.id === sectionId);
    return sec ? sec.active !== false : true;
  };

  return (
    <div className="overflow-hidden">
      {/* Title & meta tags come from Admin > SEO via RouteSeo; this adds the store rating data */}
      {seo && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: seo.storeName,
              url: seo.storeUrl,
              image: seo.ogImage,
              description: seo.storeDescription,
              priceRange: seo.priceRange,
              ...(seo.ratingValue && seo.reviewCount
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: seo.ratingValue,
                      reviewCount: seo.reviewCount,
                      bestRating: '5'
                    }
                  }
                : {})
            })}
          </script>
        </Helmet>
      )}

      {/* Semantic H1 for Search Engine Indexing */}
      {seo?.h1 && <h1 className="sr-only">{seo.h1}</h1>}

      {/* ========================================================
          1. FULL SCREEN HERO BANNER SECTION (Single Banner & Action Strip)
         ======================================================== */}
      {isSectionVisible('hero') && heroBanner && (
        <section className="relative w-full bg-[#EBF3EF] border-b border-emerald-soft/70 overflow-hidden">
          {/* Full Screen Banner Container taking 100% of visible viewport below header */}
          <div className="relative w-full group overflow-hidden">
            <Link
              to={heroBanner.bannerLink || '/'}
              className="block relative w-full h-full overflow-hidden cursor-pointer"
              aria-label={heroBanner.altText}
            >
              <img
                src={heroBanner.image}
                alt={heroBanner.altText}
                className="w-full h-auto max-h-[calc(100vh-106px)] block object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
                fetchPriority="high"
              />
              {/* Subtle sheen highlight on hover */}
              <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/[0.015] transition-colors" />
            </Link>
          </div>

          {/* Hero Bottom Interactive Action & Trust Strip */}
          {heroBanner.showActionStrip !== false && (
            <div className="relative z-10 bg-white/95 backdrop-blur-md border-t border-emerald-soft/60 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
              <FadeIn direction="up" delay={0.1}>
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-4">
                  
                  {/* Trust and Rating Highlights */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center lg:justify-start text-center lg:text-left">
                    <div className="flex items-center gap-1 text-gold">
                      {[...Array(Math.max(1, Math.min(5, Number(heroBanner.ratingStars) || 5)))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-gold" />
                      ))}
                    </div>
                    {heroBanner.ratingText && (
                      <span className="text-xs sm:text-sm font-bold text-ink">
                        {heroBanner.ratingText}
                      </span>
                    )}
                    {heroBanner.ratingText && heroBanner.featureText && (
                      <span className="hidden sm:inline text-muted text-xs">•</span>
                    )}
                    {heroBanner.featureText && (
                      <span className="text-xs text-muted font-medium hidden sm:inline">
                        {heroBanner.featureText}
                      </span>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-center">
                    {heroBanner.primaryCtaText && (
                      <Link
                        to={heroBanner.primaryCtaLink || '/'}
                        className="btn-primary text-xs sm:text-sm px-6 py-2.5 sm:py-3 shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-initial whitespace-nowrap group"
                      >
                        <span>{heroBanner.primaryCtaText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    {heroBanner.secondaryCtaText && (
                      <Link
                        to={heroBanner.secondaryCtaLink || '/'}
                        className="btn-gold text-xs sm:text-sm px-5 py-2.5 sm:py-3 shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-initial whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-950" />
                        <span>{heroBanner.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>

                </div>
              </FadeIn>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          2. THE KAPEE DIFFERENCE - ARCH TRUST CARDS
         ======================================================== */}
      {isSectionVisible('trust') && activeTrustPillars.length > 0 && (
        <section className="w-full bg-gradient-to-b from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] py-14 sm:py-20 border-b border-stone-200/80">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up" delay={0.1}>
              {/* Header */}
              <div className="text-center mb-10 sm:mb-12">
                {trustSection?.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-deep text-xs font-bold tracking-widest uppercase mb-2.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-gold" /> {trustSection.badge}
                  </span>
                )}
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-deep tracking-tight">
                  {trustSection?.heading}
                </h2>
                {trustSection?.subheading && (
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
                    {trustSection.subheading}
                  </p>
                )}
              </div>

              {/* Minimalist House-Shaped Cards with Staggered Entrance on Scroll */}
              <StaggerContainer staggerChildren={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-7 sm:gap-4.5 pt-3">
                {activeTrustPillars.map((p, idx) => {
                  const IconComp = typeof p.icon === 'function' ? p.icon : (ICON_MAP[p.icon] || Sparkles);
                  return (
                    <StaggerItem key={p.id || idx}>
                      <HousePromiseCard
                        idx={idx}
                        icon={IconComp}
                        title={p.title}
                        desc={p.desc}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ========================================================
          4. BEST SELLERS CAROUSEL / GRID
         ======================================================== */}
      {isSectionVisible('bestSellers') && (homeBestSellers || []).length > 0 && (
        <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8">
          <FadeIn direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald">
                  {bestSellersSection?.badge}
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink mt-1">
                  {bestSellersSection?.heading}
                </h2>
              </div>
              {bestSellersSection?.linkText && (
                <Link
                  to={bestSellersSection.linkUrl || '/'}
                  className="text-xs sm:text-sm font-bold text-emerald-deep hover:text-emerald flex items-center gap-1.5 underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  {bestSellersSection.linkText} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </FadeIn>

          <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeBestSellers.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* ========================================================
          5. "SEE THE MAGIC" BEFORE/AFTER TRANSFORMATION SLIDER
         ======================================================== */}
      {isSectionVisible('beforeAfter') && beforeAfterSettings && (
        <section className="bg-emerald-soft/50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-emerald-soft">
          <ScaleIn delay={0.1}>
            <div className="max-w-[1380px] mx-auto space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-deep text-xs font-bold uppercase tracking-wider border border-emerald-soft shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> {beforeAfterSettings?.badge}
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink">
                  {beforeAfterSettings?.heading}
                </h2>
                <p className="text-xs sm:text-sm text-muted">
                  {beforeAfterSettings?.subheading}
                </p>
              </div>

            <BeforeAfterSlider />
          </div>
          </ScaleIn>
        </section>
      )}

      {/* ========================================================
          7. HOW IT WORKS: ANIMATED STEPS (WET → WIPE → WOW)
         ======================================================== */}
      {isSectionVisible('howItWorks') && activeHowItWorksSteps.length > 0 && (
        <section className="bg-emerald-deep text-white py-16 sm:py-22 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 relative z-10">
            <FadeIn direction="up">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
                  {howItWorksHeader?.badge}
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                  {howItWorksHeader?.heading}
                </h2>
                <p className="text-xs sm:text-sm text-ivory/80">
                  {howItWorksHeader?.subheading}
                </p>
              </div>
            </FadeIn>

            <StaggerContainer
              staggerChildren={0.15}
              className={`grid grid-cols-1 ${
                activeHowItWorksSteps.length === 2
                  ? 'md:grid-cols-2'
                  : activeHowItWorksSteps.length === 4
                  ? 'md:grid-cols-2 lg:grid-cols-4'
                  : 'md:grid-cols-3'
              } gap-8`}
            >
              {activeHowItWorksSteps.map((s, idx) => (
                <StaggerItem key={s.id || idx}>
                  <div className="bg-emerald/40 rounded-3xl p-8 border border-white/10 text-center space-y-4 hover:border-gold-light/40 transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="w-16 h-16 rounded-2xl bg-gold-gradient text-emerald-950 font-bold text-xl flex items-center justify-center mx-auto shadow-gold">
                      {s.step || idx + 1}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-ivory">{s.title}</h3>
                    <p className="text-xs text-ivory/80 leading-relaxed">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ========================================================
          8. REAL CUSTOMER REVIEWS (CONTINUOUS AUTO-SCROLL)
         ======================================================== */}
      {isSectionVisible('reviews') && (
        <AutoScrollReviews
          heading={reviewsSection?.heading}
          subheading={reviewsSection?.subheading}
          reviews={homeFeaturedReviews || []}
        />
      )}

      {/* ========================================================
          9. WHY KAPEE: COMPARISON TABLE
         ======================================================== */}
      {isSectionVisible('comparison') && comparisonTable && activeComparisonRows.length > 0 && (
      <section className="bg-ivory py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-emerald-soft/60">
        <FadeIn direction="up">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald">
                {comparisonTable.badge}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink">
                {comparisonTable.heading}
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                {comparisonTable.subheading}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-emerald-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-emerald-soft/60 border-b border-emerald-soft">
                      <th className="p-4 sm:p-5 font-bold text-ink">{comparisonTable.col1Title}</th>
                      <th className="p-4 sm:p-5 font-bold text-emerald-deep bg-emerald-soft">
                        {comparisonTable.col2Title}
                      </th>
                      <th className="p-4 sm:p-5 font-medium text-muted">{comparisonTable.col3Title}</th>
                      <th className="p-4 sm:p-5 font-medium text-muted">{comparisonTable.col4Title}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-soft/40">
                    {activeComparisonRows.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-emerald-soft/20 transition-colors">
                        <td className="p-4 sm:p-5 font-semibold text-ink">{r.feature}</td>
                        <td className="p-4 sm:p-5 text-success font-bold bg-emerald-soft/30 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-success shrink-0" /> {r.kapee}
                        </td>
                        <td className={`p-4 sm:p-5 ${r.sponge?.toLowerCase().includes('cannot') ? 'text-error font-medium' : 'text-muted'}`}>
                          {r.sponge}
                        </td>
                        <td className={`p-4 sm:p-5 ${r.spray?.toLowerCase().includes('toxic') || r.spray?.toLowerCase().includes('triggers') || r.spray?.toLowerCase().includes('discolors') ? 'text-error font-medium' : 'text-muted'}`}>
                          {r.spray}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
      )}

      {/* ========================================================
          11. INSTAGRAM UGC GRID (#KapeeClean)
         ======================================================== */}
      {isSectionVisible('ugc') && activeUgcImages.length > 0 && (
        <section className="bg-emerald-soft/30 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-soft">
          <div className="max-w-7xl mx-auto space-y-8">
            <FadeIn direction="up">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                  {ugcSection?.badge}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                  {ugcSection?.heading}
                </h2>
                <p className="text-xs text-muted">
                  {ugcSection?.subheading}
                </p>
              </div>
            </FadeIn>

            <StaggerContainer staggerChildren={0.08} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {activeUgcImages.map((item, idx) => (
                <StaggerItem key={item.id || idx}>
                  <a
                    href={toExternalUrl(item.link)}
                    target={item.link ? '_blank' : undefined}
                    rel={item.link ? 'noreferrer' : undefined}
                    className="group relative block aspect-square rounded-2xl overflow-hidden shadow-xs border border-emerald-soft cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={item.image}
                      alt={item.alt || ''}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ExternalLink className="w-5 h-5 text-gold-light" />
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
