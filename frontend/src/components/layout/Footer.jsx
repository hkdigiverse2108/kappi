import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { subscribe } from '../../api/newsletterApi';
import { useAdminStore } from '../../admin/store/adminStore';
import { useContactChannels, whatsappLink } from '../../hooks/useContactChannels';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  // WhatsApp, phone and email come from Admin > CMS: Contact Us Page
  const { whatsapp, phone, email: supportEmail } = useContactChannels();
  // Policy links come from Admin > CMS: Policy Pages (only policies with a footer link text)
  const footerPolicies = (useAdminStore((state) => state.policies?.policies) || []).filter((p) => p.footerLabel);
  // Texts, social links and the Shop / Company links come from Admin > CMS: Footer
  const footer = useAdminStore((state) => state.footer) || {};
  const shopLinks = footer.shopLinks || [];
  const companyLinks = footer.companyLinks || [];

  // Saved to the backend, so the email shows in Admin > Marketing > Newsletter Subscribers
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe(email.trim());
    } catch (err) {
      window.alert(`Could not subscribe: ${err.message}`);
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-emerald-deep text-ivory border-t border-emerald/50 pt-10 pb-5 sm:pb-6">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* 1. Brand Column */}
          <div className="space-y-3">
            {/* Larger Logo */}
            <Logo
              isDarkBackground={true}
              className="h-14 sm:h-16 w-auto"
              badgeClassName="p-2 sm:p-2.5 bg-white rounded-2xl shadow-sm inline-flex items-center justify-center"
            />

            {/* Small Description */}
            <p className="text-[11px] text-ivory/70 leading-relaxed pr-2">
              {footer.brandDescription}
            </p>

            {/* Contact Details (Mail & Phone) */}
            <div className="space-y-1.5 pt-1 text-xs text-ivory/80">
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail.primaryText.trim()}`}
                  className="flex items-center gap-2 hover:text-gold-light transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-gold-light shrink-0" />
                  <span>{supportEmail.primaryText}</span>
                </a>
              )}

              {phone && (
                <a
                  href={`tel:+${phone.primaryText.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 hover:text-gold-light transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-gold-light shrink-0" />
                  <span>{phone.primaryText}</span>
                </a>
              )}
            </div>

            {/* Social Media Links with Inline SVGs */}
            <div className="pt-2 flex items-center gap-2">
              {/* Instagram */}
              {footer.instagramUrl && (
              <a
                href={footer.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold text-white hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-white/15 hover:border-gold hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              )}

              {/* Facebook */}
              {footer.facebookUrl && (
              <a
                href={footer.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold text-white hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-white/15 hover:border-gold hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              )}

              {/* WhatsApp */}
              {whatsapp && (
              <a
                href={whatsappLink(whatsapp.primaryText)}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold text-white hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-white/15 hover:border-gold hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
              )}

              {/* Twitter / X */}
              {footer.twitterUrl && (
              <a
                href={footer.twitterUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold text-white hover:text-emerald-950 flex items-center justify-center transition-all duration-200 border border-white/15 hover:border-gold hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              )}
            </div>
          </div>

          {/* 2. Shop Column */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold text-gold-light uppercase tracking-wider">
              {footer.shopHeading}
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/80">
              {shopLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.path} className="hover:text-gold-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Company Column */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold text-gold-light uppercase tracking-wider">
              {footer.companyHeading}
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/80">
              {companyLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.path} className="hover:text-gold-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Policies Column + Newsletter directly underneath it */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-serif text-xs font-bold text-gold-light uppercase tracking-wider">
                {footer.policiesHeading}
              </h4>
              <ul className="space-y-2.5 text-xs text-ivory/80">
                {footerPolicies.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/policies/${p.slug}`} className="hover:text-gold-light transition-colors">
                      {p.footerLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Subscription (Directly below Policies) */}
            <div className="pt-4 border-t border-emerald-soft/20 space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {footer.newsletterHeading}
              </p>
              <p className="text-[11px] text-ivory/70 leading-normal">
                {footer.newsletterText}
              </p>

              {subscribed ? (
                <div className="bg-white/10 border border-emerald-soft/30 p-2.5 rounded-xl flex items-center gap-2 text-xs text-gold-light">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{footer.newsletterSuccessText}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-gold-light transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-gold hover:bg-gold-light text-emerald-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Centered Copyright Bottom Bar */}
        <div className="border-t border-emerald/40 pt-4 text-center text-xs text-ivory/70">
          <p>© {new Date().getFullYear()} {footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
