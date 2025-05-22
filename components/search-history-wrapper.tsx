"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SearchHistory = dynamic(() => import('@/components/search-history').then(mod => mod.SearchHistory), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg animate-pulse" />
  ),
});

export default function SearchHistoryWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <SearchHistory />
    </div>
  );
} 