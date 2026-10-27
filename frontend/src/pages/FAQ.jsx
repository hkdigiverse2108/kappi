import React, { useEffect, useState } from 'react';
import { Search, HelpCircle, ChevronDown, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { useAdminStore } from '../admin/store/adminStore';

export const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Questions, categories and page text come from Admin > FAQ; the help box buttons use the
  // WhatsApp and email cards from Admin > CMS: Contact Us Page
  const faqPage = useAdminStore((state) => state.faqPage);
  const contactCards = useAdminStore((state) => state.contactSection?.cards) || [];

  useEffect(() => {
    const { loadFaqPage, loadContactContent } = useAdminStore.getState();
    loadFaqPage();
    loadContactContent();
  }, []);

  if (!faqPage) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]" />;
  }

  const faqs = (faqPage.faqs || []).filter((f) => f.published !== false);
  // Only categories that have at least one visible question get a tab
  const categories = ['All', ...(faqPage.categories || []).filter((c) => faqs.some((f) => f.category === c))];
  const whatsappCard = contactCards.find((c) => c.type === 'whatsapp' && c.active !== false && c.actionUrl);
  const emailCard = contactCards.find((c) => c.type === 'email' && c.active !== false && c.actionUrl);

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    const matchesQuery =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <Helmet>
        <title>{faqPage.seoTitle}</title>
        <meta name="description" content={faqPage.seoDescription} />
        <link rel="canonical" href="https://kapee-enterprise.com/faq" />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kapee-enterprise.com/faq" />
        <meta property="og:title" content={faqPage.ogTitle} />
        <meta property="og:description" content={faqPage.ogDescription} />
        <meta property="og:image" content="https://kapee-enterprise.com/hero_banner.png" />

        {/* FAQPage Schema for Google Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Header */}
      <FadeIn direction="up">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald">
            {faqPage.badge}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink">
            {faqPage.heading}
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            {faqPage.subheading}
          </p>
        </div>
      </FadeIn>

      {/* Search Input */}
      <FadeIn direction="up" delay={0.05}>
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={faqPage.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-emerald-soft bg-white focus:border-emerald outline-none shadow-xs"
          />
        </div>
      </FadeIn>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
              activeCategory === c
                ? 'bg-emerald-deep text-white shadow-xs'
                : 'bg-white text-muted hover:text-ink border border-emerald-soft'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQs List with Scroll-Triggered Reveal */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: (idx % 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-2xl border border-emerald-soft shadow-xs overflow-hidden transition-all hover:border-emerald/40"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left font-serif font-bold text-sm sm:text-base text-ink flex items-center justify-between gap-4 hover:text-emerald"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="px-5 pb-5 text-xs sm:text-sm text-muted leading-relaxed border-t border-emerald-soft/60 pt-3 overflow-hidden"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-emerald-soft">
            <p className="text-sm font-bold text-ink">No questions found matching "{searchQuery}"</p>
            <p className="text-xs text-muted mt-1">Try another search term or message our support team.</p>
          </div>
        )}
      </div>

      {/* Contact Help Box with Scroll Reveal */}
      <FadeIn direction="up">
        <div className="bg-emerald-soft/60 rounded-3xl p-6 sm:p-8 border border-emerald-soft text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink">{faqPage.helpTitle}</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {faqPage.helpText}
          </p>
          {(whatsappCard || emailCard) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {whatsappCard && (
                <a
                  href={whatsappCard.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-2 hover:opacity-95 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" /> Chat on WhatsApp
                </a>
              )}
              {emailCard && (
                <a
                  href={emailCard.actionUrl}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email Support
                </a>
              )}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
};

export default FAQ;
