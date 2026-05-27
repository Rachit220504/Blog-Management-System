'use client';

import { useEffect } from 'react';
import { getApiUrl } from '../lib/api';

const seenKeyFor = (slug) => `atlas-pageview:${slug}`;

const PageViewTracker = ({ slug, path }) => {
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;

    const seenKey = seenKeyFor(slug);
    const lastSeen = sessionStorage.getItem(seenKey);
    const now = Date.now();

    if (lastSeen && now - Number(lastSeen) < 30000) {
      return;
    }

    sessionStorage.setItem(seenKey, String(now));

    const payload = JSON.stringify({
      slug,
      path: path || window.location.pathname,
      referrer: document.referrer || '',
    });

    const url = `${getApiUrl().replace(/\/$/, '')}/analytics/pageview`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      return;
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => null);
  }, [slug, path]);

  return null;
};

export default PageViewTracker;