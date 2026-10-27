import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, FileText, ArrowRight } from 'lucide-react';
import { useAdminStore } from '../admin/store/adminStore';

export const PolicyPage = () => {
  const { policyType } = useParams();
  // Every policy is written in Admin > CMS: Policy Pages (loaded at startup for the footer, refreshed here)
  const policies = useAdminStore((state) => state.policies?.policies);

  useEffect(() => {
    useAdminStore.getState().loadPolicies();
  }, []);

  if (!policies) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]" />;
  }

  const policy = policies.find((p) => p.slug === policyType);
  if (!policy) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-3">
        <h1 className="font-serif text-2xl font-bold text-ink">Policy not found</h1>
        <Link to="/" className="text-xs font-semibold text-emerald hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-emerald-soft pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink">
          {policy.title}
        </h1>
        {policy.lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Updated: {policy.lastUpdated}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Table of Contents (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft sticky top-24 space-y-3">
          <h3 className="font-serif font-bold text-sm text-ink uppercase tracking-wider">
            Table of Contents
          </h3>
          <ul className="space-y-2 text-xs">
            {policy.sections.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className="text-muted hover:text-emerald font-medium block py-1 transition-colors"
                >
                  {sec.title}
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-emerald-soft space-y-2">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Other Policies</span>
            <div className="space-y-1 text-xs text-muted">
              {policies.map((p) => (
                <Link key={p.slug} to={`/policies/${p.slug}`} className="block hover:text-emerald">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-emerald-soft shadow-soft space-y-8 text-xs sm:text-sm text-ink/80 leading-relaxed">
          {policy.sections.map((sec) => (
            <div key={sec.id} id={sec.id} className="space-y-2 scroll-mt-24">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-ink border-b border-emerald-soft/60 pb-1.5">
                {sec.title}
              </h2>
              <p className="leading-loose text-muted whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
