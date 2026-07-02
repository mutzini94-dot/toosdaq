export interface PricePoint {
  date: string;
  price: number;
}

export interface Creator {
  id: number;
  name: string;
  emoji: string;
  category: string;
  followers: number;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  ipoPrice: number;
  avgDonation: number;
  viewers: number;
  history: PricePoint[];
  high52w: number;
  low52w: number;
  totalShares: number;
  // 수익 기반 배당 시스템
  weeklyRevenue: number;   // 주간 후원 수익 (강냉이 환산) — 새 강냉이 유입원
  dividendRate: number;    // 수익 중 주주 배분 비율 (0~1)
  revenueGrowth: number;   // 주간 수익 성장률 (가격에 반영)
}

// 총 강냉이 공급량 추적
export interface CornSupply {
  total: number;      // 전체 발행량
  circulating: number; // 유통량 (보유잔액 합계)
  dividendMinted: number; // 배당으로 발행된 누적량
}

export interface Holding {
  creatorId: number;
  quantity: number;
  avgBuyPrice: number;
}

export interface Transaction {
  id: string;
  creatorId: number;
  creatorName: string;
  creatorEmoji: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Dividend {
  id: string;
  creatorId: number;
  creatorName: string;
  creatorEmoji: string;
  amount: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  creatorId: number;
  creatorName: string;
  creatorEmoji: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  limitPrice: number;    // market: 제출 시 현재가, limit: 지정 가격
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
  filledAt?: Date;
  filledPrice?: number;
}

export type TabId = 'market' | 'portfolio' | 'orders' | 'ranking' | 'history';

export interface AppState {
  balance: number;
  holdings: Holding[];
  orders: Order[];
  transactions: Transaction[];
  dividends: Dividend[];
}
