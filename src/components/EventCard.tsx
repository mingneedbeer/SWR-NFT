import type { NftEvent } from '../lib/types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeStyles: Record<string, string> = {
  mint: 'bg-nft-mint/10 text-nft-mint border-nft-mint/30',
  sale: 'bg-nft-sale/10 text-nft-sale border-nft-sale/30',
};

const typeLabels: Record<string, string> = {
  mint: 'Mint',
  sale: 'Sale',
};

export function EventCard({ event }: { event: NftEvent }) {
  return (
    <div className="bg-nft-card border border-nft-border rounded-xl p-4 hover:border-nft-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full border ${
            typeStyles[event.type]
          }`}
        >
          {typeLabels[event.type]}
        </span>
        <span className="text-nft-muted text-xs">{timeAgo(event.timestamp)}</span>
      </div>

      <h3 className="text-nft-text font-medium text-sm truncate mb-1">
        {event.collectionName}
      </h3>

      <p className="text-nft-muted text-xs mb-3">
        Token #{event.tokenId}
      </p>

      {event.price && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-nft-text font-semibold text-sm">{event.price}</span>
          {event.marketplace && (
            <span className="text-nft-muted text-xs capitalize">
              via {event.marketplace}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-nft-muted">from</span>
          <span className="text-nft-accent font-mono">{event.from}</span>
        </div>
        <span className="text-nft-muted">→</span>
        <div className="flex items-center gap-1">
          <span className="text-nft-muted">to</span>
          <span className="text-nft-accent font-mono">{event.to}</span>
        </div>
      </div>

      <a
        href={`https://etherscan.io/tx/${event.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-xs text-nft-accent hover:underline"
      >
        View on Etherscan →
      </a>
    </div>
  );
}
