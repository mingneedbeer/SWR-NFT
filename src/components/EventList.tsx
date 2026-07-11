import type { NftEvent } from '../lib/types';
import { EventCard } from './EventCard';

export function EventList({
  events,
  isLoading,
  title,
}: {
  events: NftEvent[];
  isLoading: boolean;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-nft-text">{title}</h2>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-nft-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {events.length === 0 && !isLoading ? (
        <p className="text-nft-muted text-sm">No events found.</p>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
