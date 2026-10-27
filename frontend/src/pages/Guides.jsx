import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, BookOpen, Tag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { guides } from '../data/guides';

export const Guides = () => {
  const [selectedTag, setSelectedTag] = useState('All');

  const allTags = ['All', 'Bathroom', 'Shoe Care', 'Kitchen', 'Science of Clean'];

  const filteredGuides = selectedTag === 'All'
    ? guides
    : guides.filter((g) => g.category.toLowerCase().includes(selectedTag.toLowerCase()));

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <Helmet>
        <title>Cleaning Guides & Expert Stain Hacks | KAPEE Enterprise</title>
        <meta
          name="description"
          content="Learn how to remove tile grout stains, clean white sneaker soles, descaling tips, and the science behind melamine foam."
        />
        <link rel="canonical" href="https://kapee-enterprise.com/guides" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kapee-enterprise.com/guides" />
        <meta property="og:title" content="Cleaning Guides & Expert Stain Hacks | KAPEE Enterprise" />
        <meta property="og:description" content="Step-by-step cleaning hacks for tile grout, white sneakers, kitchen grease, and more." />
        <meta property="og:image" content="https://kapee-enterprise.com/hero_banner.png" />
      </Helmet>

      {/* Header */}
      <FadeIn direction="up">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald">
            Knowledge Base & Tutorials
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink">
            The Clean Living Journal
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Practical chemical-free cleaning solutions, surface protection guides, and maintenance tips written by our home-care team.
          </p>
        </div>
      </FadeIn>

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-2 flex-wrap">
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
              selectedTag === t
                ? 'bg-emerald-deep text-white shadow-md'
                : 'bg-white text-muted hover:text-ink border border-emerald-soft'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Guides Grid with Scroll-Triggered Stagger */}
      <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGuides.map((guide) => (
          <StaggerItem key={guide.id}>
            <Link
            key={guide.id}
            to={`/guides/${guide.slug}`}
            className="card-premium overflow-hidden group flex flex-col justify-between"
          >
            <div className="aspect-[16/10] overflow-hidden bg-ivory relative">
              <img
                src={guide.image}
                alt={guide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-deep text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {guide.category}
              </span>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{guide.readTime}</span>
                  <span>•</span>
                  <span>{guide.date}</span>
                </div>

                <h2 className="font-serif text-lg font-bold text-ink group-hover:text-emerald transition-colors line-clamp-2">
                  {guide.title}
                </h2>

                <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-soft flex items-center justify-between text-xs font-bold text-emerald-deep group-hover:text-emerald">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  </div>
  );
};

export default Guides;
