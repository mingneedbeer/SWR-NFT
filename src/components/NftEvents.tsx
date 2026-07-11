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

export function NftEvents() {
  const [tab, setTab] = useState<Tab>('all');

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
      <div className="flex gap-2 mb-6">
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

      <EventList events={visibleEvents} isLoading={isLoading} title={`${visibleEvents.length} Recent Events`} />
    </div>
  );
}
