import { useState } from 'react';
import useSWR from 'swr';
import type { NftEvent } from '../lib/types';
import { EventList } from './EventList';

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

type Tab = 'all' | 'sales' | 'mints';
type ViewMode = 'list' | 'grid';

export function NftEvents() {
  const [tab, setTab] = useState<Tab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: salesData, isLoading: salesLoading } = useSWR<{ events: NftEvent[] }>(
    '/api/sales?limit=20',
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      errorRetryCount: 3,
    }
  );

  const { data: mintsData, isLoading: mintsLoading } = useSWR<{ events: NftEvent[] }>(
    '/api/mints?limit=20',
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      errorRetryCount: 3,
    }
  );

  const sales = salesData?.events ?? [];
  const mints = mintsData?.events ?? [];

  const allEvents = [...sales, ...mints].sort((a, b) => b.timestamp - a.timestamp);

  const visibleEvents =
    tab === 'all' ? allEvents : tab === 'sales' ? sales : mints;

  const isLoading = tab === 'all' ? salesLoading || mintsLoading :
    tab === 'sales' ? salesLoading : mintsLoading;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex gap-2">
          {(['all', 'sales', 'mints'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t
                  ? 'bg-nft-accent text-white'
                  : 'bg-nft-card text-nft-muted hover:text-nft-text border border-nft-border'
              }`}
            >
              {t === 'all' ? 'All Events' : t === 'sales' ? 'Sales' : 'Mints'}
            </button>
          ))}
        </div>

        <div className="flex bg-nft-card border border-nft-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm transition-colors ${
              viewMode === 'list' ? 'bg-nft-accent text-white' : 'text-nft-muted hover:text-nft-text'
            }`}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm transition-colors ${
              viewMode === 'grid' ? 'bg-nft-accent text-white' : 'text-nft-muted hover:text-nft-text'
            }`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>

      <EventList events={visibleEvents} isLoading={isLoading} title={`${visibleEvents.length} Recent Events`} viewMode={viewMode} />
    </div>
  );
}
