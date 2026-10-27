import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Heart, Sparkles, Check, ArrowRight, Zap, Droplets, Star, Truck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { Logo } from '../components/common/Logo';
import { useAdminStore } from '../admin/store/adminStore';

const ICON_MAP = {
  Leaf,
  ShieldCheck,
  Heart,
  Sparkles,
  Zap,
  Droplets,
  Star,
  Truck
};

export const About = () => {
  // All page content comes from Admin > CMS: Our Story Page
  const ourStory = useAdminStore((state) => state.ourStory);

  useEffect(() => {
    useAdminStore.getState().loadOurStory();
  }, []);

  if (!ourStory) {
    return <div className="min-h-[60vh]" />;
  }

  const {
    heroBadge,
    heroTitle,
    heroSubtext,
    storyHeading,
    storyParagraph1: storyP1,
    storyParagraph2: storyP2,
    storyParagraph3: storyP3,
    storyImage,
    storyImageAlt,
    valuesHeading,
    valuesSubtext,
    ctaHeading,
    ctaSubtext,
    ctaButtonText,
    ctaButtonLink
  } = ourStory;
  const activeValues = (ourStory.values || []).filter((v) => v.active !== false);

  return (
    <div className="space-y-16 pb-20">
      <Helmet>
        <title>{ourStory.seoTitle}</title>
        <meta name="description" content={ourStory.seoDescription} />
        <link rel="canonical" href="https://kapee-enterprise.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kapee-enterprise.com/about" />
        <meta property="og:title" content={ourStory.ogTitle} />
        <meta property="og:description" content={ourStory.ogDescription} />
        <meta property="og:image" content="https://kapee-enterprise.com/hero_banner.png" />
      </Helmet>

      {/* Hero */}
      <section className="bg-hero-gradient py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-soft text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          {heroBadge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-soft text-emerald-deep text-xs font-bold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-gold-dark" /> {heroBadge}
            </div>
          )}
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
            {heroSubtext}
          </p>
        </div>
      </section>

      {/* Story Narrative with Scroll Reveal */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-xs sm:text-sm text-muted leading-relaxed">
              <h2 className="font-serif text-2xl font-bold text-ink">
                {storyHeading}
              </h2>
              {storyP1 && <p>{storyP1}</p>}
              {storyP2 && <p>{storyP2}</p>}
              {storyP3 && <p>{storyP3}</p>}
            </div>

            {storyImage && (
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-ivory hover:shadow-2xl transition-shadow duration-500">
                <img
                  src={storyImage}
                  alt={storyImageAlt || storyHeading}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* Brand Values with Scroll-Triggered Stagger */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-emerald-soft">
        <div className="max-w-7xl mx-auto space-y-12">
          <FadeIn direction="up">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                {valuesHeading}
              </h2>
              {valuesSubtext && <p className="text-xs text-muted">{valuesSubtext}</p>}
            </div>
          </FadeIn>

          <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeValues.map((v, idx) => {
              const Icon = ICON_MAP[v.icon] || Leaf;
              return (
                <StaggerItem key={v.id || idx}>
                  <div className="p-6 rounded-3xl bg-ivory border border-emerald-soft space-y-3 text-center h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-soft text-emerald flex items-center justify-center mx-auto shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-ink">{v.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{v.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Bottom CTA with Scroll Reveal */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <FadeIn direction="up">
          <div className="bg-emerald-deep text-white rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {ctaHeading}
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 max-w-md mx-auto">
              {ctaSubtext}
            </p>
            {ctaButtonText && (
              <div className="pt-2">
                <Link to={ctaButtonLink || '/shop'} className="btn-gold inline-flex text-xs sm:text-sm font-bold px-8 py-3.5">
                  {ctaButtonText}
                </Link>
              </div>
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
};

export default About;
