import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { triggerKapeeCelebration } from '../components/common/Confetti';
import { SettingsCard, TextField } from '../components/common/SettingsCard';

// One place for the SEO of every website page. Each page keeps its SEO where it always lived
// (home content, Our Story, Contact and FAQ documents); this screen only edits those fields.
// The backend turns them into the page's tags (backend/app/services/page_seo.py).

// Field keys of the Our Story, Contact and FAQ documents
const CMS_KEYS = {
  title: 'seoTitle',
  description: 'seoDescription',
  keywords: 'seoKeywords',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  twitterTitle: 'twitterTitle',
  twitterDescription: 'twitterDescription',
  ogImage: 'ogImage'
};

// Field keys of the home content sections (seo, shopSeo)
const HOME_KEYS = {
  title: 'title',
  description: 'description',
  keywords: 'keywords',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  twitterTitle: 'twitterTitle',
  twitterDescription: 'twitterDescription',
  ogImage: 'ogImage'
};

const PAGES = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    keys: HOME_KEYS,
    select: (s) => s.seo,
    save: (s, form) => s.updateHomeContent('seo', form),
    extraFields: [
      { key: 'canonicalUrl', label: 'Website URL (Canonical)', placeholder: 'https://kapee-enterprise.com/' },
      { key: 'h1', label: 'Hidden H1 (for search engines)' }
    ],
    storeFields: true
  },
  {
    key: 'shop',
    label: 'Shop',
    path: '/shop',
    keys: HOME_KEYS,
    select: (s) => s.shopSeo,
    save: (s, form) => s.updateHomeContent('shopSeo', form)
  },
  {
    key: 'about',
    label: 'Our Story',
    path: '/about',
    keys: CMS_KEYS,
    select: (s) => s.ourStory,
    load: (s) => s.loadOurStory(),
    save: (s, form) => s.updateOurStory(form)
  },
  {
    key: 'contact',
    label: 'Contact Us',
    path: '/contact',
    keys: CMS_KEYS,
    select: (s) => s.contactSection,
    load: (s) => s.loadContactContent(),
    save: (s, form) => s.updateContactSection(form)
  },
  {
    key: 'faq',
    label: 'FAQ',
    path: '/faqs',
    keys: CMS_KEYS,
    select: (s) => s.faqPage,
    load: (s) => s.loadFaqPage(),
    save: (s, form) => s.updateFaqPage(form)
  }
];

const STORE_FIELDS = [
  { key: 'storeName', label: 'Store Name' },
  { key: 'storeUrl', label: 'Store URL' },
  { key: 'storeDescription', label: 'Store Description', wide: true },
  { key: 'priceRange', label: 'Price Range', placeholder: '₹149 - ₹899' },
  { key: 'ratingValue', label: 'Average Rating', placeholder: '4.9' },
  { key: 'reviewCount', label: 'Total Review Count', placeholder: '2960' }
];

// Only this page's SEO fields, so saving never touches the rest of the document
const pickFields = (page, data) => {
  const keys = [
    ...Object.values(page.keys),
    ...(page.extraFields || []).map((f) => f.key),
    ...(page.storeFields ? STORE_FIELDS.map((f) => f.key) : [])
  ];
  return Object.fromEntries(keys.map((key) => [key, data?.[key] || '']));
};

const SeoPageForm = ({ page }) => {
  const store = useAdminStore();
  const data = page.select(store);
  const [form, setForm] = useState(() => pickFields(page, data));
  const k = page.keys;

  useEffect(() => {
    setForm(pickFields(page, data));
  }, [page, data]);

  // Share/Twitter text follows the Page Title / Meta Description while empty or still the same text
  const LINKED = { [k.title]: [k.ogTitle, k.twitterTitle], [k.description]: [k.ogDescription, k.twitterDescription] };
  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      (LINKED[key] || []).forEach((linked) => {
        if (!prev[linked] || prev[linked] === prev[key]) next[linked] = value;
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await page.save(useAdminStore.getState(), form);
    } catch {
      return; // the store already showed the error
    }
    triggerKapeeCelebration();
    store.addToast({ type: 'success', title: 'SEO Saved', message: `${page.label} page SEO updated on the website.` });
  };

  const field = (key, label, placeholder, wide) => (
    <TextField
      key={key}
      className={wide ? 'sm:col-span-2' : ''}
      label={label}
      value={form[key]}
      onChange={(v) => setField(key, v)}
      placeholder={placeholder}
    />
  );

  return (
    <SettingsCard
      title={`${page.label} Page SEO`}
      description={`Google title, description and social share preview of ${page.path}. Empty share fields use the Page Title / Meta Description.`}
      onSave={handleSave}
      saveLabel="Save SEO"
    >
      <div className="space-y-5 text-xs">
        <a
          href={page.path}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open {page.path} on the website
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field(k.title, 'Page Title (Browser Tab & Google)', '', true)}
          {field(k.description, 'Meta Description', '', true)}
          {field(k.keywords, 'Meta Keywords (comma separated)', page.key === 'home' ? '' : 'Same as homepage keywords', true)}
          {(page.extraFields || []).map((f) => field(f.key, f.label, f.placeholder, false))}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-stone-800 dark:text-stone-200">Facebook / WhatsApp & Twitter Sharing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field(k.ogTitle, 'Share Title (Facebook / WhatsApp)', 'Same as Page Title')}
            {field(k.ogDescription, 'Share Description (Facebook / WhatsApp)', 'Same as Meta Description')}
            {field(k.twitterTitle, 'Twitter Title', 'Same as Share Title')}
            {field(k.twitterDescription, 'Twitter Description', 'Same as Share Description')}
            {field(k.ogImage, 'Share Image URL', page.key === 'home' ? 'https://kapee-enterprise.com/hero_banner.png' : 'Same as homepage share image', true)}
          </div>
        </div>

        {page.storeFields && (
          <div className="space-y-3">
            <p className="font-bold text-stone-800 dark:text-stone-200">Google Store Info (rating stars in search results)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STORE_FIELDS.map((f) => field(f.key, f.label, f.placeholder, f.wide))}
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  );
};

export const SeoPage = () => {
  const [activeKey, setActiveKey] = useState('home');
  const page = PAGES.find((p) => p.key === activeKey);

  // Fresh data for the pages that are not loaded when the admin panel opens
  useEffect(() => {
    const state = useAdminStore.getState();
    PAGES.forEach((p) => p.load?.(state));
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">SEO</h1>
        <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
          Google title, description, keywords and social share preview of every website page, in one place.
        </p>
      </div>

      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PAGES.map((p) => {
          const isActive = p.key === activeKey;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveKey(p.key)}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold relative whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-emerald-deep dark:text-emerald-400 font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-100'
              }`}
            >
              {p.label}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-deep dark:bg-emerald-400 rounded-full" />}
            </button>
          );
        })}
      </div>

      <SeoPageForm key={page.key} page={page} />
    </div>
  );
};

export default SeoPage;
