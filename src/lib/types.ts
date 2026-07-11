export type EventType = 'mint' | 'sale';

export interface NftEvent {
  id: string;
  type: EventType;
  collectionName: string;
  collectionAddress: string;
  tokenId: string;
  image?: string;
  price?: string;
  priceCurrency?: string;
  from: string;
  to: string;
  timestamp: number;
  marketplace?: string;
  txHash: string;
}

export interface AlchemyNftSale {
  marketplace: string;
  contractAddress: string;
  tokenId: string;
  quantity: string;
  buyerAddress: string;
  sellerAddress: string;
  salePrice: string;
  saleFeeData: {
    socialFee: string;
    protocolFee: string;
    royaltyFee: string;
  };
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: string;
}

export interface AlchemyNftTransfer {
  uniqueId: string;
  blockNumber: number;
  timestamp: string;
  rawContract: {
    address: string | null;
    decimal: string | null;
    value: string | null;
  };
  from: string;
  to: string;
  asset: {
    name: string | null;
    symbol: string | null;
    tokenId: string;
    tokenType: 'ERC721' | 'ERC1155';
    logo: string | null;
    thumbnail: string | null;
  };
  category: string;
  hashes: string[];
}

export interface AlchemyResponse<T> {
  data: T[];
  pageKey?: string;
}
