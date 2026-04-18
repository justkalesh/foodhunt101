import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  /** Override the OG image (defaults to /og-image.png) */
  ogImage?: string;
  /** Override the OG type (defaults to 'website') */
  ogType?: string;
  /** Override the canonical path (defaults to current pathname) */
  canonicalPath?: string;
  /** Disable indexing for this page */
  noIndex?: boolean;
}

const SITE_NAME = 'Food-Hunt';
const BASE_URL = 'https://food-hunt.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Updates document <title>, meta description, Open Graph tags,
 * Twitter Card tags, and canonical URL for the current page.
 * 
 * Restores defaults on unmount so stale meta from a previous
 * page never leaks into the next.
 */
export function usePageMeta({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonicalPath,
  noIndex = false,
}: PageMetaOptions) {
  useEffect(() => {
    // ── Title ──
    const prevTitle = document.title;
    document.title = title;

    // ── Helper: upsert a <meta> tag ──
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── Description ──
    setMeta('name', 'description', description);

    // ── Open Graph ──
    const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', resolvedImage);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:url', `${BASE_URL}${canonicalPath ?? window.location.pathname}`);

    // ── Twitter Card ──
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', resolvedImage);

    // ── Canonical URL ──
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = `${BASE_URL}${canonicalPath ?? window.location.pathname}`;

    // ── Robots ──
    if (noIndex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      // Remove noindex if it was set by a previous page
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // ── Cleanup ──
    return () => {
      document.title = prevTitle;
    };
  }, [title, description, ogImage, ogType, canonicalPath, noIndex]);
}
