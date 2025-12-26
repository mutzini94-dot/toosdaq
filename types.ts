
export interface Creator {
  id: string;
  name: string;
  avatar: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  totalValue: number;
  high: number;
  low: number;
  tags: string[];
  rank?: number;
}

export interface Order {
  price: number;
  count: number;
  percent: number;
  type: 'buy' | 'sell';
}

export interface ChartData {
  time: string;
  price: number;
}

export type ViewTab = 'chart' | 'hoga' | 'info' | 'community';
