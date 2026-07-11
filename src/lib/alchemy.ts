import type { AlchemyNftSale, NftEvent } from './types';

const ALCHEMY_NFT_BASE = 'https://eth-mainnet.g.alchemy.com/nft/v3';
const ALCHEMY_RPC_BASE = 'https://eth-mainnet.g.alchemy.com/v2';

interface AssetTransfer {
  uniqueId: string;
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  tokenId: string | null;
  asset: string | null;
  category: string;
  rawContract: { address: string | null; value: string | null; decimal: string | null };
  metadata?: { blockTimestamp: string };
}

function getKey(): string {
  const key = import.meta.env.ALCHEMY_API_KEY;
  if (!key) throw new Error('ALCHEMY_API_KEY is not set');
  return key;
}

// Cache metadata lookups to avoid redundant calls
const metadataCache = new Map<string, { image?: string; tokenURI?: string }>();

async function fetchNftMetadata(
  contractAddress: string,
  tokenId: string
): Promise<{ image?: string; tokenURI?: string }> {
  const cacheKey = `${contractAddress}-${tokenId}`;
  if (metadataCache.has(cacheKey)) return metadataCache.get(cacheKey)!;

  const key = getKey();
  const url = `${ALCHEMY_NFT_BASE}/${key}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const result = {
      image: data.image?.cachedUrl || data.image?.originalUrl || undefined,
      tokenURI: data.tokenURI?.raw || data.tokenURI?.gateway || undefined,
    };
    metadataCache.set(cacheKey, result);
    return result;
  } catch {
    return {};
  }
}

async function enrichEventsWithMetadata(events: NftEvent[]): Promise<NftEvent[]> {
  const enriched = await Promise.all(
    events.map(async (event) => {
      if (!event.collectionAddress || !event.tokenId) return event;
      const meta = await fetchNftMetadata(event.collectionAddress, event.tokenId);
      return { ...event, image: meta.image, tokenURI: meta.tokenURI };
    })
  );
  return enriched;
}

function truncateAddress(addr: string): string {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') {
    return '0x0000...0000';
  }
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatPrice(wei: string): string {
  const eth = Number(wei) / 1e18;
  if (eth === 0) return 'Free';
  if (eth < 0.001) return '<0.001 ETH';
  return `${eth.toFixed(4)} ETH`;
}

export async function fetchNftSales(
  limit = 20,
  pageKey?: string
): Promise<{ events: NftEvent[]; nextPageKey?: string }> {
  const key = getKey();
  const params = new URLSearchParams({
    limit: String(limit),
    order: 'desc',
  });
  if (pageKey) params.set('pageKey', pageKey);

  const url = `${ALCHEMY_NFT_BASE}/${key}/getNFTSales?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Alchemy API error: ${res.status}`);
  }

  const json = await res.json();
  const sales: AlchemyNftSale[] = json.data ?? [];

  const events: NftEvent[] = sales.map((sale) => ({
    id: `sale-${sale.transactionHash}-${sale.logIndex}`,
    type: 'sale' as const,
    collectionName: sale.contractAddress,
    collectionAddress: sale.contractAddress,
    tokenId: sale.tokenId,
    price: formatPrice(sale.salePrice),
    priceCurrency: 'ETH',
    from: truncateAddress(sale.sellerAddress),
    to: truncateAddress(sale.buyerAddress),
    timestamp: new Date(sale.timestamp).getTime(),
    marketplace: sale.marketplace,
    txHash: sale.transactionHash,
  }));

  return { events: await enrichEventsWithMetadata(events), nextPageKey: json.pageKey };
}

export async function fetchNftMints(
  limit = 20,
  pageKey?: string
): Promise<{ events: NftEvent[]; nextPageKey?: string }> {
  const key = getKey();

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getAssetTransfers',
    params: [{
      fromBlock: '0x0',
      toBlock: 'latest',
      fromAddress: '0x0000000000000000000000000000000000000000',
      excludeZeroValue: true,
      category: ['erc721', 'erc1155'],
      order: 'desc',
      withMetadata: true,
      maxCount: `0x${limit.toString(16)}`,
      ...(pageKey ? { pageKey } : {}),
    }],
  };

  const res = await fetch(`${ALCHEMY_RPC_BASE}/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Alchemy API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Alchemy RPC error: ${json.error.message}`);
  }

  const transfers: AssetTransfer[] = json.result?.transfers ?? [];

  const events: NftEvent[] = transfers.map((t) => ({
    id: `mint-${t.uniqueId}`,
    type: 'mint' as const,
    collectionName: t.rawContract.address ?? 'Unknown',
    collectionAddress: t.rawContract.address ?? '',
    tokenId: t.tokenId ?? '',
    from: truncateAddress(t.from),
    to: truncateAddress(t.to),
    timestamp: t.metadata?.blockTimestamp
      ? new Date(t.metadata.blockTimestamp).getTime()
      : Date.now(),
    txHash: t.hash,
  }));

  return { events: await enrichEventsWithMetadata(events), nextPageKey: json.result?.pageKey };
}
