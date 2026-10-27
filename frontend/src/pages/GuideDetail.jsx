import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft, Share2, Sparkles, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { guides } from '../data/guides';
import { useProductStore } from '../store/useProductStore';

export const GuideDetail = () => {
  // Products come from Admin > Products (backend)
  const products = useProductStore((s) => s.products);
  const { slug } = useParams();
  const guide = guides.find((g) => g.slug === slug) || guides[0];
  const relatedProduct = products[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: guide.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Helmet>
        <title>{`${guide.title} | KAPEE Cleaning Guides`}</title>
        <meta name="description" content={guide.excerpt} />
        <link rel="canonical" href={`https://kapee-enterprise.com/guides/${guide.slug}`} />

        {/* OpenGraph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://kapee-enterprise.com/guides/${guide.slug}`} />
        <meta property="og:title" content={`${guide.title} | KAPEE Cleaning Guides`} />
        <meta property="og:description" content={guide.excerpt} />
        <meta property="og:image" content={guide.image?.startsWith('http') ? guide.image : `https://kapee-enterprise.com${guide.image}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${guide.title} | KAPEE Cleaning Guides`} />
        <meta name="twitter:description" content={guide.excerpt} />
        <meta name="twitter:image" content={guide.image?.startsWith('http') ? guide.image : `https://kapee-enterprise.com${guide.image}`} />

        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": guide.title,
            "description": guide.excerpt,
            "image": guide.image?.startsWith('http') ? guide.image : `https://kapee-enterprise.com${guide.image}`,
            "author": {
              "@type": "Organization",
              "name": "KAPEE Cleaning Lab"
            },
            "publisher": {
              "@type": "Organization",
              "name": "KAPEE Enterprise",
              "logo": {
                "@type": "ImageObject",
                "url": "https://kapee-enterprise.com/favicon.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://kapee-enterprise.com/guides/${guide.slug}`
            }
          })}
        </script>
      </Helmet>

      {/* Back link */}
      <Link
        to="/guides"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-emerald"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cleaning Guides
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald">
          {guide.category} • {guide.readTime}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink leading-tight">
          {guide.title}
        </h1>
        <div className="flex items-center justify-between text-xs text-muted pt-2 border-b border-emerald-soft pb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">By {guide.author}</span>
            <span>•</span>
            <span>Published {guide.date}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-emerald font-semibold hover:underline"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Guide
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-emerald-soft bg-ivory">
        <img
          src={guide.image}
          alt={guide.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Body */}
      <div className="prose prose-emerald max-w-none text-ink text-sm sm:text-base leading-relaxed space-y-4">
        <div className="p-4 rounded-2xl bg-emerald-soft/50 border border-emerald-soft text-xs sm:text-sm font-medium text-emerald-deep">
          <strong>Key Takeaway:</strong> {guide.excerpt}
        </div>

        <div className="whitespace-pre-line text-ink/90 leading-loose">
          {guide.content}
        </div>
      </div>

      {/* Recommended Product Box in Article (once products have loaded) */}
      {relatedProduct && (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-soft shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={relatedProduct.images[0]}
            alt=""
            className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-2xl border border-emerald-soft"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald">Recommended Tool for This Hack</span>
            <h4 className="font-serif font-bold text-base text-ink">{relatedProduct.title}</h4>
            <p className="text-xs text-muted mt-0.5">₹{relatedProduct.basePrice} (Pack of 5 with Free Delivery)</p>
          </div>
        </div>

        <Link
          to={`/product/${relatedProduct.slug}`}
          className="btn-primary text-xs px-6 py-3 shrink-0"
        >
          View Product Details
        </Link>
      </div>
      )}
    </div>
  );
};

export default GuideDetail;
