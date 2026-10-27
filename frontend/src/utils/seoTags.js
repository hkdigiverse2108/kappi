// SEO tags that come from the admin panel (resolved per page by GET /api/seo?path=...).
// index.html already has one of each; these helpers overwrite their values instead of adding duplicates.
// Used by the Vite dev server (vite.config.js) and the browser (RouteSeo).
// Keep in sync with backend/app/services/seo_html.py, which does the same for the built site.

// [tag attribute, attribute value, attribute that holds the text, SEO field]
export const SEO_TAGS = [
  ['name', 'description', 'content', 'description'],
  ['name', 'keywords', 'content', 'keywords'],
  ['rel', 'canonical', 'href', 'canonicalUrl'],
  ['property', 'og:url', 'content', 'canonicalUrl'],
  ['property', 'og:title', 'content', 'ogTitle'],
  ['property', 'og:description', 'content', 'ogDescription'],
  ['property', 'og:image', 'content', 'ogImage'],
  ['name', 'twitter:url', 'content', 'canonicalUrl'],
  ['name', 'twitter:title', 'content', 'twitterTitle'],
  ['name', 'twitter:description', 'content', 'twitterDescription'],
  ['name', 'twitter:image', 'content', 'ogImage'],
];

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Server side: rewrite the tags inside the index.html text
export const injectSeoIntoHtml = (html, seo) => {
  if (!seo) return html;

  const title = (seo.title || '').trim();
  if (title) html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`);

  for (const [attr, attrValue, target, field] of SEO_TAGS) {
    const value = (seo[field] || '').trim();
    if (!value) continue;
    const tag = new RegExp(`<(?:meta|link)\\b[^>]*\\b${attr}="${escapeRegex(attrValue)}"[^>]*>`);
    html = html.replace(tag, (match) =>
      match.replace(new RegExp(`\\b${target}="[^"]*"`), () => `${target}="${escapeHtml(value)}"`)
    );
  }
  return html;
};

// The <title> from index.html, captured before React adds any page titles of its own
const baseTitle = typeof document !== 'undefined' ? document.querySelector('head > title') : null;

// Browser side: update the live <head> after navigating to another page.
// setTitle is false for pages that set their own title (cart, account, ...).
export const applySeoToDocument = (seo, { setTitle = true } = {}) => {
  if (!seo) return;
  if (setTitle && seo.title) {
    if (baseTitle) baseTitle.textContent = seo.title;
    else document.title = seo.title;
  }

  for (const [attr, attrValue, target, field] of SEO_TAGS) {
    const value = (seo[field] || '').trim();
    if (!value) continue;
    let el = document.head.querySelector(`${attr === 'rel' ? 'link' : 'meta'}[${attr}="${attrValue}"]`);
    if (!el) {
      el = document.createElement(attr === 'rel' ? 'link' : 'meta');
      el.setAttribute(attr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute(target, value);
  }
};
