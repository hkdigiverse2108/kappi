import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeoToDocument } from '../../utils/seoTags';

// Loads the admin SEO of the current page (GET /api/seo?path=...) after every navigation.
// The first page load already has these tags in its HTML (injected by the server).
export const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/seo?path=${encodeURIComponent(pathname)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // Pages without their own SEO (cart, account, ...) keep the title they set themselves
        if (data) applySeoToDocument(data.seo, { setTitle: data.matched });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname]);

  return null;
};

export default RouteSeo;
