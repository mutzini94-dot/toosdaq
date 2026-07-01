import { Creator, PricePoint } from '../types';

function generateHistory(currentPrice: number, days: number = 30): PricePoint[] {
  const history: PricePoint[] = [];
  const now = new Date();
  let price = currentPrice * (0.75 + Math.random() * 0.25);

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    if (i === 0) {
      price = currentPrice;
    } else {
      const volatility = 0.04 + Math.random() * 0.04;
      const drift = (currentPrice - price) / (i * currentPrice) * 0.5;
      const change = (Math.random() - 0.5) * 2 * volatility + drift;
      price = Math.max(price * (1 + change), 1);
    }

    history.push({ date: dateStr, price: Math.round(price) });
  }
  return history;
}

// dividendPerShare(주간) = weeklyRevenue × dividendRate / totalShares
// 연 배당수익률 = dividendPerShare × 52 / price
export const creatorsData: Creator[] = [
  {
    id: 1, name: '감자도리', emoji: '🥔', category: '게임',
    followers: 89234, price: 4200, change: 8.3, volume: 12450,
    marketCap: 1890000000, ipoPrice: 1000, avgDonation: 2340000,
    viewers: 3240, high52w: 5100, low52w: 800, totalShares: 450000,
    weeklyRevenue: 9_500_000, dividendRate: 0.20, revenueGrowth: 1.8,
    // yield ≈ (9_500_000×0.20/450_000)×52/4200 ≈ 5.5%
    history: generateHistory(4200),
  },
  {
    id: 2, name: '하늘별빛', emoji: '⭐', category: '노래/음악',
    followers: 234567, price: 15800, change: 2.1, volume: 8900,
    marketCap: 7400000000, ipoPrice: 5000, avgDonation: 8900000,
    viewers: 12400, high52w: 18200, low52w: 4200, totalShares: 468354,
    weeklyRevenue: 35_000_000, dividendRate: 0.25, revenueGrowth: 1.2,
    // yield ≈ (35_000_000×0.25/468_354)×52/15800 ≈ 7.4%
    history: generateHistory(15800),
  },
  {
    id: 3, name: '철갑상어', emoji: '🦈', category: '격투게임',
    followers: 45678, price: 890, change: -3.7, volume: 23100,
    marketCap: 405000000, ipoPrice: 2000, avgDonation: 890000,
    viewers: 1890, high52w: 3200, low52w: 750, totalShares: 455056,
    weeklyRevenue: 1_800_000, dividendRate: 0.18, revenueGrowth: -0.8,
    // yield ≈ (1_800_000×0.18/455_056)×52/890 ≈ 4.6%
    history: generateHistory(890),
  },
  {
    id: 4, name: '봄바람소녀', emoji: '🌸', category: '버츄얼',
    followers: 567890, price: 28900, change: 15.2, volume: 45600,
    marketCap: 16400000000, ipoPrice: 3000, avgDonation: 24500000,
    viewers: 45600, high52w: 29800, low52w: 2800, totalShares: 567474,
    weeklyRevenue: 50_000_000, dividendRate: 0.35, revenueGrowth: 4.2,
    // yield ≈ (50_000_000×0.35/567_474)×52/28900 ≈ 5.5%
    history: generateHistory(28900),
  },
  {
    id: 5, name: '닥터피자', emoji: '🍕', category: '먹방',
    followers: 123456, price: 3400, change: -1.2, volume: 5670,
    marketCap: 420000000, ipoPrice: 2500, avgDonation: 3200000,
    viewers: 5670, high52w: 5800, low52w: 2100, totalShares: 123529,
    weeklyRevenue: 5_500_000, dividendRate: 0.20, revenueGrowth: -0.3,
    // yield ≈ (5_500_000×0.20/123_529)×52/3400 ≈ 13.6%
    history: generateHistory(3400),
  },
  {
    id: 6, name: '새벽세시', emoji: '🌙', category: 'ASMR',
    followers: 345678, price: 9200, change: 4.8, volume: 11200,
    marketCap: 3180000000, ipoPrice: 2000, avgDonation: 6700000,
    viewers: 11200, high52w: 10500, low52w: 1800, totalShares: 345652,
    weeklyRevenue: 22_000_000, dividendRate: 0.28, revenueGrowth: 2.1,
    // yield ≈ (22_000_000×0.28/345_652)×52/9200 ≈ 10.0%
    history: generateHistory(9200),
  },
  {
    id: 7, name: '화염검사', emoji: '⚔️', category: 'RPG',
    followers: 67890, price: 2100, change: 0.5, volume: 3400,
    marketCap: 142000000, ipoPrice: 1500, avgDonation: 1200000,
    viewers: 2100, high52w: 3900, low52w: 1200, totalShares: 67619,
    weeklyRevenue: 3_000_000, dividendRate: 0.20, revenueGrowth: 0.4,
    // yield ≈ (3_000_000×0.20/67_619)×52/2100 ≈ 13.8%
    history: generateHistory(2100),
  },
  {
    id: 8, name: '코딩마왕', emoji: '💻', category: '개발/IT',
    followers: 78901, price: 5600, change: -5.9, volume: 7800,
    marketCap: 442000000, ipoPrice: 3000, avgDonation: 4500000,
    viewers: 4300, high52w: 9200, low52w: 4800, totalShares: 78929,
    weeklyRevenue: 8_500_000, dividendRate: 0.25, revenueGrowth: -1.5,
    // yield ≈ (8_500_000×0.25/78_929)×52/5600 ≈ 12.5%
    history: generateHistory(5600),
  },
  {
    id: 9, name: '황금손바닥', emoji: '🏆', category: '스포츠',
    followers: 190234, price: 11200, change: 7.6, volume: 19800,
    marketCap: 2130000000, ipoPrice: 1000, avgDonation: 9800000,
    viewers: 19800, high52w: 12400, low52w: 980, totalShares: 190178,
    weeklyRevenue: 28_000_000, dividendRate: 0.30, revenueGrowth: 3.0,
    // yield ≈ (28_000_000×0.30/190_178)×52/11200 ≈ 20.5%
    history: generateHistory(11200),
  },
  {
    id: 10, name: '몽글몽글', emoji: '☁️', category: '힐링/수다',
    followers: 445678, price: 22400, change: 3.3, volume: 29300,
    marketCap: 9977000000, ipoPrice: 2000, avgDonation: 18900000,
    viewers: 29300, high52w: 24800, low52w: 1900, totalShares: 445428,
    weeklyRevenue: 42_000_000, dividendRate: 0.30, revenueGrowth: 1.8,
    // yield ≈ (42_000_000×0.30/445_428)×52/22400 ≈ 6.6%
    history: generateHistory(22400),
  },
];

// 주당 주간 배당금 계산 헬퍼
export function calcDividendPerShare(creator: Creator): number {
  return Math.floor((creator.weeklyRevenue * creator.dividendRate) / creator.totalShares);
}

// 연 배당수익률 (%)
export function calcAnnualYield(creator: Creator): number {
  return (calcDividendPerShare(creator) * 52) / creator.price * 100;
}

export const TOOSDAQ_INDEX_HISTORY = (() => {
  const now = new Date();
  const history = [];
  let idx = 10000;
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    if (i === 0) {
      idx = 12847;
    } else {
      idx = idx * (1 + (Math.random() - 0.46) * 0.03);
    }
    history.push({ date: dateStr, value: Math.round(idx) });
  }
  return history;
})();
