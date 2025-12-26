
import { Creator, Order, ChartData } from './types';

export const MOCK_CREATORS: Creator[] = [
  {
    id: '1',
    name: '침착맨',
    avatar: 'https://picsum.photos/seed/creator1/200',
    currentPrice: 5000,
    change: 500,
    changePercent: 1.0,
    totalValue: 5000000,
    high: 6000,
    low: 3500,
    tags: ['게임', '토크', '음악'],
    rank: 1
  },
  {
    id: '2',
    name: '우왁굳',
    avatar: 'https://picsum.photos/seed/creator2/200',
    currentPrice: 8200,
    change: 3000,
    changePercent: 20.0,
    totalValue: 8000000,
    high: 9000,
    low: 5000,
    tags: ['게임', 'VR'],
    rank: 2
  },
  {
    id: '3',
    name: '슈카월드',
    avatar: 'https://picsum.photos/seed/creator3/200',
    currentPrice: 7100,
    change: 2000,
    changePercent: 15.0,
    totalValue: 7000000,
    high: 8500,
    low: 4500,
    tags: ['경제', '지식'],
    rank: 3
  },
  {
    id: '4',
    name: '풍월량',
    avatar: 'https://picsum.photos/seed/creator4/200',
    currentPrice: 4500,
    change: -200,
    changePercent: -4.2,
    totalValue: 4500000,
    high: 5000,
    low: 4200,
    tags: ['게임', '종합'],
    rank: 4
  },
  {
    id: '5',
    name: '릴카',
    avatar: 'https://picsum.photos/seed/creator5/200',
    currentPrice: 6300,
    change: 150,
    changePercent: 2.4,
    totalValue: 6300000,
    high: 6500,
    low: 6000,
    tags: ['토크', '패션'],
    rank: 5
  },
  {
    id: '6',
    name: '옥냥이',
    avatar: 'https://picsum.photos/seed/creator6/200',
    currentPrice: 3800,
    change: 400,
    changePercent: 11.7,
    totalValue: 3800000,
    high: 4000,
    low: 3200,
    tags: ['게임', '기획'],
    rank: 6
  }
];

export const MOCK_MARKET_INDEX: ChartData[] = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  price: 2400 + Math.random() * 200
}));

export const MOCK_NEWS = [
  { id: 1, title: "[공시] 침착맨, 신규 스튜디오 이전 확정", time: "1분 전" },
  { id: 2, title: "우왁굳 '이세돌' 프로젝트 음원 차트 1위", time: "15분 전" },
  { id: 3, title: "슈카월드 구독자 300만명 돌파 기념 배당 이벤트", time: "32분 전" },
  { id: 4, title: "풍월량, 오늘 오후 6시 신작 게임 켠왕 예고", time: "1시간 전" }
];

export const generateChartData = (points: number, startPrice: number) => {
  let current = startPrice;
  return Array.from({ length: points }, (_, i) => {
    current += (Math.random() - 0.5) * (startPrice * 0.05);
    return {
      time: i.toString(),
      price: Math.floor(current)
    };
  });
};

export const MOCK_CHART_DATA = generateChartData(24, 5000);

export const MOCK_ORDERS: Order[] = [
  { price: 5300, count: 120, percent: 6, type: 'sell' },
  { price: 5200, count: 450, percent: 4, type: 'sell' },
  { price: 5150, count: 320, percent: 3, type: 'sell' },
  { price: 5100, count: 800, percent: 2, type: 'sell' },
  { price: 5050, count: 150, percent: 1, type: 'sell' },
  { price: 5000, count: 0, percent: 0, type: 'buy' }, // Current Price Marker
  { price: 4950, count: 210, percent: -1, type: 'buy' },
  { price: 4900, count: 640, percent: -2, type: 'buy' },
  { price: 4850, count: 430, percent: -3, type: 'buy' },
  { price: 4800, count: 900, percent: -4, type: 'buy' },
  { price: 4700, count: 150, percent: -6, type: 'buy' },
];
