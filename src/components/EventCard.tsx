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

export function EventCard({ event, viewMode = 'list' }: { event: NftEvent; viewMode?: 'list' | 'grid' }) {
  if (viewMode === 'grid') {
    return (
      <div className="bg-nft-card border border-nft-border rounded-xl overflow-hidden hover:border-nft-accent/50 transition-colors flex flex-col">
        {event.image && (
          <img
            src={event.image}
            alt={`Token #${event.tokenId}`}
            className="w-full aspect-square object-cover bg-nft-border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeStyles[event.type]}`}>
              {typeLabels[event.type]}
            </span>
            <span className="text-nft-muted text-xs">{timeAgo(event.timestamp)}</span>
          </div>
          <h3 className="text-nft-text font-medium text-sm truncate">{event.collectionName}</h3>
          <p className="text-nft-muted text-xs">Token #{event.tokenId}</p>
          {event.price && (
            <div className="flex items-center gap-1">
              <span className="text-nft-text font-semibold text-sm">{event.price}</span>
              {event.marketplace && (
                <span className="text-nft-muted text-xs capitalize">via {event.marketplace}</span>
              )}
            </div>
          )}
          <div className="mt-auto pt-2 flex items-center gap-3 text-xs border-t border-nft-border">
            <a href={`https://etherscan.io/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer" className="text-nft-accent hover:underline">
              Etherscan →
            </a>
            {event.tokenURI && (
              <a href={event.tokenURI} target="_blank" rel="noopener noreferrer" className="text-nft-accent hover:underline">
                Token URI →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nft-card border border-nft-border rounded-xl p-4 hover:border-nft-accent/50 transition-colors">
      <div className="flex gap-4">
        {event.image && (
          <img
            src={event.image}
            alt={`Token #${event.tokenId}`}
            className="w-16 h-16 rounded-lg object-cover bg-nft-border flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
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

          <p className="text-nft-muted text-xs mb-2">
            Token #{event.tokenId}
          </p>

          {event.price && (
            <div className="flex items-center gap-1 mb-2">
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

          <div className="flex items-center gap-3 mt-3 text-xs">
            <a
              href={`https://etherscan.io/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nft-accent hover:underline"
            >
              Etherscan →
            </a>
            {event.tokenURI && (
              <a
                href={event.tokenURI}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nft-accent hover:underline"
              >
                Token URI →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
