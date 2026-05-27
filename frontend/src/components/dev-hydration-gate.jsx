"use client";

import { useEffect, useState } from 'react';

export default function DevHydrationGate({ children }) {
  const [mounted, setMounted] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setMounted(true);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return children;
}