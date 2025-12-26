
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  Heart, 
  BarChart3, 
  User, 
  MessageSquare, 
  Search, 
  ChevronRight,
  Wallet,
  ArrowUp,
  ArrowDown,
  Bell,
  Settings,
  CreditCard,
  PieChart as PieChartIcon,
  LayoutGrid,
  Clock,
  ExternalLink,
  Newspaper,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Activity,
  Maximize2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Filter,
  MoreVertical,
  History,
  TrendingDown,
  CircleDollarSign,
  Rocket,
  Timer,
  Users,
  Trophy,
  X,
  Medal,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldCheck,
  Zap,
  ShoppingBag,
  PlusCircle,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  MoveHorizontal,
  Moon,
  Sun,
  BellRing,
  Trash2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Brush,
  ReferenceLine
} from 'recharts';
import { MOCK_CREATORS, generateChartData, MOCK_ORDERS, MOCK_MARKET_INDEX, MOCK_NEWS } from './mockData';
import { Creator, ViewTab } from './types';

type MainView = 'home' | 'community' | 'mypage' | 'pre-listing' | 'ranking';
type HomeMode = 'dashboard' | 'detail';
type TradeMode = 'buy' | 'sell';
type SortOption = 'profit' | 'value' | 'quantity' | 'name';
type TimeFrame = '1H' | '1D' | '1W' | '1M' | '1Y';

interface PortfolioItem {
  creatorId: string;
  name: string;
  avgPrice: number;
  quantity: number;
  avatar: string;
}

interface PreListingCreator {
  id: string;
  name: string;
  avatar: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  participants: number;
  daysLeft: number;
  tags: string[];
}

interface IpoParticipation {
  preListingId: string;
  name: string;
  amount: number;
  date: string;
}

interface PriceAlert {
  id: string;
  creatorId: string;
  creatorName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
}

const MOCK_PRE_LISTING_INITIAL: PreListingCreator[] = [
  {
    id: 'p1',
    name: '침착맨 (재상장)',
    avatar: 'https://picsum.photos/seed/p1/200',
    description: '대한민국 최고의 킹받는 방송, 더 큰 플랫폼으로 나아가기 위한 사전 공모를 시작합니다.',
    goalAmount: 1000000,
    currentAmount: 850000,
    participants: 1240,
    daysLeft: 3,
    tags: ['토크', '레전드']
  },
  {
    id: 'p2',
    name: '빠니보틀',
    avatar: 'https://picsum.photos/seed/p2/200',
    description: '세계 일주를 넘어 우주 일주까지? 빠니보틀의 새로운 여행 프로젝트에 투자하세요.',
    goalAmount: 2000000,
    currentAmount: 1200000,
    participants: 3500,
    daysLeft: 5,
    tags: ['여행', '어드벤처']
  },
  {
    id: 'p3',
    name: '곽튜브',
    avatar: 'https://picsum.photos/seed/p3/200',
    description: '성공한 찐따의 아이콘, 곽튜브의 상장과 함께 성장의 기쁨을 누려보세요.',
    goalAmount: 1500000,
    currentAmount: 300000,
    participants: 800,
    daysLeft: 12,
    tags: ['여행', '푸드']
  }
];

// --- Sub-components ---

const MarketIndexWidget = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-1.5">
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">TOSPI</h3>
        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">시장 지수</span>
      </div>
    </div>
    <div className="flex items-baseline gap-2 mb-2">
      <span className="text-2xl font-black text-red-500 dark:text-red-400">2,543.12</span>
      <span className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-0.5">
        <ArrowUp size={10} /> 12.45 (+0.49%)
      </span>
    </div>
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_MARKET_INDEX}>
          <Line type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const NewsFeedWidget = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
    <div className="flex justify-between items-center mb-5">
      <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
        <Newspaper size={16} className="text-blue-500 dark:text-blue-400" /> 실시간 소식
      </h3>
    </div>
    <div className="space-y-5">
      {MOCK_NEWS.map(news => (
        <div key={news.id} className="cursor-pointer group">
          <p className="text-xs text-gray-700 dark:text-slate-300 leading-snug font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {news.title}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 block">{news.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const SidebarRanking = ({ 
  creators, 
  onSelect 
}: { 
  creators: Creator[], 
  onSelect: (c: Creator) => void 
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
    <div className="flex justify-between items-center mb-5 border-b border-gray-50 dark:border-slate-800 pb-3">
      <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">인기 순위</h3>
      <button className="text-[11px] text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-bold">전체</button>
    </div>
    <div className="space-y-2">
      {creators.slice(0, 5).map((c, idx) => (
        <div 
          key={c.id} 
          onClick={() => onSelect(c)}
          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className={`w-4 text-center font-bold text-sm ${idx < 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600'}`}>
              {idx + 1}
            </span>
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300 truncate max-w-[80px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {c.name}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-gray-900 dark:text-slate-100">{c.currentPrice.toLocaleString()}</div>
            <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${c.change >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
              {Math.abs(c.changePercent).toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HogaView = ({ creator }: { creator: Creator }) => {
  const maxVolume = Math.max(...MOCK_ORDERS.map(o => o.count));
  return (
    <div className="max-w-2xl mx-auto border border-gray-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300">
      <div className="bg-gray-50/50 dark:bg-slate-800/50 px-8 py-4 border-b dark:border-slate-800 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">SELL</span>
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">PRICE</span>
        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">BUY</span>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-800">
        {MOCK_ORDERS.map((order, idx) => {
          const isCurrent = order.price === 5000;
          return (
            <div key={idx} className={`grid grid-cols-3 h-14 items-center relative transition-colors ${isCurrent ? 'bg-yellow-50/50 dark:bg-yellow-900/10 ring-2 ring-inset ring-yellow-100 dark:ring-yellow-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <div className="h-full relative flex items-center px-6">
                {order.type === 'sell' && (
                  <>
                    <div className="absolute right-0 h-[80%] bg-blue-100/40 dark:bg-blue-900/20 rounded-l-lg" style={{ width: `${(order.count / maxVolume) * 100}%` }} />
                    <span className="relative z-10 text-sm font-bold text-blue-700 dark:text-blue-400">{order.count.toLocaleString()}</span>
                  </>
                )}
              </div>
              <div className={`h-full flex flex-col justify-center items-center font-black ${order.type === 'sell' ? 'text-blue-600 dark:text-blue-400' : order.type === 'buy' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-200'}`}>
                <span className="text-base">{order.price.toLocaleString()}</span>
                <span className={`text-[10px] font-bold ${order.percent >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                  {order.percent > 0 ? '+' : ''}{order.percent}%
                </span>
              </div>
              <div className="h-full relative flex items-center justify-end px-6">
                {order.type === 'buy' && (
                  <>
                    <div className="absolute left-0 h-[80%] bg-red-100/40 dark:bg-red-900/20 rounded-r-lg" style={{ width: `${(order.count / maxVolume) * 100}%` }} />
                    <span className="relative z-10 text-sm font-bold text-red-700 dark:text-red-400">{order.count.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Creator Info (Analysis) View ---
const CreatorAnalysisView = ({ creator }: { creator: Creator }) => {
  const scoreData = [
    { name: '콘텐츠', score: 92 },
    { name: '팬덤화력', score: 88 },
    { name: '성장성', score: 75 },
    { name: '꾸준함', score: 95 },
    { name: '화제성', score: 82 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-[2rem] p-8 transition-colors">
          <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8">AI 역량 지표</h4>
          <div className="space-y-6">
            {scoreData.map(item => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm font-black text-gray-700 dark:text-slate-300">
                  <span>{item.name}</span>
                  <span className="text-blue-600 dark:text-blue-400">{item.score}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-1000 ease-out" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 dark:bg-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100 dark:shadow-none">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <Sparkles size={24} className="text-blue-100" />
              </div>
              <h4 className="text-lg font-black tracking-tight">AI 투자 가이드</h4>
            </div>
            <p className="text-blue-50 dark:text-blue-100 text-base font-medium leading-relaxed mb-8">
              "{creator.name}님은 최근 30일간 평균 시청 시간이 15% 증가하며 견고한 팬덤을 유지하고 있습니다. 
              기술적 지표상으로는 5,000 강냉이 부근에서 강력한 지지가 예상되며, 다음 라이브 일정 전까지 점진적 상승이 기대됩니다."
            </p>
            <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/10 text-xs font-black">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> 투자 위험도: 낮음</span>
              <span className="flex items-center gap-1.5"><Zap size={16} /> 성장 전망: 우수</span>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm transition-colors duration-300">
        <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">시세 통계</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">52주 최고가</div>
            <div className="text-xl font-black text-gray-900 dark:text-slate-100">{creator.high.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">52주 최저가</div>
            <div className="text-xl font-black text-gray-900 dark:text-slate-100">{creator.low.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">시가총액</div>
            <div className="text-xl font-black text-gray-900 dark:text-slate-100">{(creator.currentPrice * 1000).toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">배당수익률</div>
            <div className="text-xl font-black text-green-500 dark:text-green-400">2.4%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Creator Discussion View ---
const CreatorDiscussionView = ({ creator }: { creator: Creator }) => {
  const [sentiment, setSentiment] = useState<'up' | 'down' | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-[2rem] p-10 text-center transition-colors">
        <h4 className="text-xl font-black text-gray-900 dark:text-slate-100 mb-2">실시간 투자자 심리</h4>
        <p className="text-sm font-medium text-gray-400 dark:text-slate-500 mb-10">여러분은 {creator.name}의 가격이 어떻게 변할 것이라 생각하시나요?</p>
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
          <button 
            onClick={() => setSentiment('up')}
            className={`flex-1 group flex flex-col items-center gap-4 p-8 rounded-[2rem] transition-all border-4 ${sentiment === 'up' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-white dark:bg-slate-900 border-transparent hover:border-red-100 dark:hover:border-red-900/30'}`}
          >
            <div className={`p-4 rounded-2xl transition-all ${sentiment === 'up' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-50 dark:bg-red-900/20 text-red-500 group-hover:scale-110'}`}>
              <ThumbsUp size={32} />
            </div>
            <span className={`text-lg font-black ${sentiment === 'up' ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>올라간다 (72%)</span>
          </button>
          <button 
            onClick={() => setSentiment('down')}
            className={`flex-1 group flex flex-col items-center gap-4 p-8 rounded-[2rem] transition-all border-4 ${sentiment === 'down' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' : 'bg-white dark:bg-slate-900 border-transparent hover:border-blue-100 dark:hover:border-blue-900/30'}`}
          >
            <div className={`p-4 rounded-2xl transition-all ${sentiment === 'down' ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110'}`}>
              <ThumbsDown size={32} />
            </div>
            <span className={`text-lg font-black ${sentiment === 'down' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>내려간다 (28%)</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm focus-within:ring-4 focus-within:ring-blue-50 dark:focus-within:ring-blue-900/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <User size={24} />
          </div>
          <input 
            type="text" 
            placeholder="이 종목에 대한 의견을 남겨주세요..." 
            className="flex-1 bg-transparent border-none outline-none font-medium text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
          />
          <button className="bg-blue-600 dark:bg-blue-500 text-white font-black px-6 py-2 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none transition-transform active:scale-95">게시</button>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors duration-300">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-8 hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 font-black text-xs">U{i}</div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-slate-200">투자천재_{i}23</div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">3분 전</div>
                </div>
                {i === 1 && <span className="ml-auto text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg border border-red-100 dark:border-red-900/30">BEST</span>}
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-slate-400 leading-relaxed mb-6">
                오늘 거래량 터진거 보니까 조만간 큰 시세 한 번 줄 것 같네요. 평단 4800원인데 끝까지 들고 가보렵니다. {creator.name} 화이팅!
              </p>
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <Heart size={16} /> {i * 15}
                </button>
                <button className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <MessageSquare size={16} /> {i + 2}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('toosdaq-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [currentView, setCurrentView] = useState<MainView>('home');
  const [homeMode, setHomeMode] = useState<HomeMode>('dashboard');
  const [creators, setCreators] = useState<Creator[]>(MOCK_CREATORS);
  const [selectedCreator, setSelectedCreator] = useState<Creator>(MOCK_CREATORS[0]);
  const [activeTab, setActiveTab] = useState<ViewTab>('chart');
  
  const [walletBalance, setWalletBalance] = useState(1000000); // Increased initial for sample
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { creatorId: '1', name: '침착맨', avgPrice: 4850, quantity: 15, avatar: 'https://picsum.photos/seed/creator1/200' },
    { creatorId: '2', name: '우왁굳', avgPrice: 7900, quantity: 20, avatar: 'https://picsum.photos/seed/creator2/200' },
    { creatorId: '3', name: '슈카월드', avgPrice: 7200, quantity: 10, avatar: 'https://picsum.photos/seed/creator3/200' },
    { creatorId: '4', name: '풍월량', avgPrice: 4600, quantity: 50, avatar: 'https://picsum.photos/seed/creator4/200' },
  ]);
  const [ipoParticipations, setIpoParticipations] = useState<IpoParticipation[]>([]);
  const [preListingData, setPreListingData] = useState<PreListingCreator[]>(MOCK_PRE_LISTING_INITIAL);
  const [selectedIpo, setSelectedIpo] = useState<PreListingCreator | null>(null);
  const [ipoAmountInput, setIpoAmountInput] = useState<number>(10000);

  // Filter and Search State for Portfolio
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioSort, setPortfolioSort] = useState<SortOption>('profit');

  // Chart States
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1D');

  // Price Alert State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertPriceInput, setAlertPriceInput] = useState<number>(0);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalType, setTradeModalType] = useState<TradeMode>('buy');
  const [priceInput, setPriceInput] = useState(0);
  const [quantityInput, setQuantityInput] = useState(1);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Apply dark mode class to root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('toosdaq-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('toosdaq-theme', 'light');
    }
  }, [isDarkMode]);

  // Price fluctuation simulation and alert checking
  useEffect(() => {
    const interval = setInterval(() => {
      setCreators(prev => {
        const next = prev.map(c => {
          const changeAmount = Math.floor((Math.random() - 0.5) * 150);
          const newPrice = Math.max(100, c.currentPrice + changeAmount);
          
          // Check alerts for this creator
          priceAlerts.forEach(alert => {
            if (alert.active && alert.creatorId === c.id) {
              const triggered = alert.condition === 'above' ? newPrice >= alert.targetPrice : newPrice <= alert.targetPrice;
              if (triggered) {
                alert.active = false; 
                alertNotify(alert.creatorName, alert.targetPrice, alert.condition, newPrice);
              }
            }
          });

          return {
            ...c,
            currentPrice: newPrice,
            change: newPrice - 5000,
            changePercent: Number(((newPrice - 5000) / 5000 * 100).toFixed(2))
          };
        });
        return [...next].sort((a, b) => b.currentPrice - a.currentPrice);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [priceAlerts]);

  const alertNotify = (name: string, target: number, condition: string, current: number) => {
    const message = `[TOOSDAQ 가격 알림] ${name}의 가격이 ${target.toLocaleString()} 강냉이(${condition === 'above' ? '이상' : '이하'})에 도달했습니다! (현재가: ${current.toLocaleString()})`;
    alert(message);
  };

  const handleSelectCreator = useCallback((c: Creator) => {
    setSelectedCreator(c);
    setPriceInput(c.currentPrice);
    setQuantityInput(1);
    setHomeMode('detail');
    setCurrentView('home');
    setActiveTab('chart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRecharge = () => {
    const amount = 100000;
    setWalletBalance(prev => prev + amount);
    alert(`${amount.toLocaleString()} 강냉이가 충전되었습니다!`);
  };

  const openTradeModal = (type: TradeMode) => {
    setTradeModalType(type);
    setPriceInput(selectedCreator.currentPrice);
    setQuantityInput(1);
    setIsTradeModalOpen(true);
  };

  const openAlertModal = () => {
    setAlertPriceInput(selectedCreator.currentPrice);
    setIsAlertModalOpen(true);
  };

  const handleAddAlert = () => {
    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      creatorId: selectedCreator.id,
      creatorName: selectedCreator.name,
      targetPrice: alertPriceInput,
      condition: alertCondition,
      active: true
    };
    setPriceAlerts(prev => [...prev, newAlert]);
    setIsAlertModalOpen(false);
    alert(`${selectedCreator.name}의 가격 알림이 설정되었습니다.`);
  };

  const removeAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleTrade = () => {
    const totalCost = priceInput * quantityInput;
    if (tradeModalType === 'buy') {
      if (walletBalance < totalCost) {
        alert('강냉이가 부족합니다!');
        return;
      }
      setWalletBalance(prev => prev - totalCost);
      setPortfolio(prev => {
        const existing = prev.find(item => item.creatorId === selectedCreator.id);
        if (existing) {
          const newQty = existing.quantity + quantityInput;
          const newAvg = (existing.avgPrice * existing.quantity + totalCost) / newQty;
          return prev.map(item => item.creatorId === selectedCreator.id ? { ...item, quantity: newQty, avgPrice: newAvg } : item);
        }
        return [...prev, { creatorId: selectedCreator.id, name: selectedCreator.name, avgPrice: priceInput, quantity: quantityInput, avatar: selectedCreator.avatar }];
      });
      alert(`${selectedCreator.name} 매수 완료!`);
    } else {
      const existing = portfolio.find(item => item.creatorId === selectedCreator.id);
      if (!existing || existing.quantity < quantityInput) {
        alert('보유 수량이 부족합니다.');
        return;
      }
      setWalletBalance(prev => prev + totalCost);
      setPortfolio(prev => {
        const remaining = existing.quantity - quantityInput;
        if (remaining === 0) return prev.filter(item => item.creatorId !== selectedCreator.id);
        return prev.map(item => item.creatorId === selectedCreator.id ? { ...item, quantity: remaining } : item);
      });
      alert(`${selectedCreator.name} 매도 완료!`);
    }
    setIsTradeModalOpen(false);
  };

  const handleParticipateIpo = () => {
    if (!selectedIpo) return;
    if (walletBalance < ipoAmountInput) {
      alert('보유 강냉이가 부족합니다!');
      return;
    }

    setWalletBalance(prev => prev - ipoAmountInput);
    setPreListingData(prev => prev.map(item => 
      item.id === selectedIpo.id 
      ? { ...item, currentAmount: item.currentAmount + ipoAmountInput, participants: item.participants + 1 } 
      : item
    ));

    setIpoParticipations(prev => {
      const existing = prev.find(p => p.preListingId === selectedIpo.id);
      if (existing) {
        return prev.map(p => p.preListingId === selectedIpo.id ? { ...p, amount: p.amount + ipoAmountInput } : p);
      }
      return [...prev, { 
        preListingId: selectedIpo.id, 
        name: selectedIpo.name, 
        amount: ipoAmountInput, 
        date: new Date().toLocaleDateString() 
      }];
    });

    alert(`${selectedIpo.name} 공모에 ${ipoAmountInput.toLocaleString()} 강냉이를 투자했습니다!`);
    setSelectedIpo(null);
  };

  const sortedAndFilteredPortfolio = useMemo(() => {
    let result = portfolio.filter(item => item.name.toLowerCase().includes(portfolioSearch.toLowerCase()));
    
    result.sort((a, b) => {
      const aCreator = creators.find(c => c.id === a.creatorId);
      const bCreator = creators.find(c => c.id === b.creatorId);
      const aCurrent = aCreator?.currentPrice || a.avgPrice;
      const bCurrent = bCreator?.currentPrice || b.avgPrice;

      switch(portfolioSort) {
        case 'profit':
          const aProfit = (aCurrent - a.avgPrice) / a.avgPrice;
          const bProfit = (bCurrent - b.avgPrice) / b.avgPrice;
          return bProfit - aProfit;
        case 'value':
          return (bCurrent * b.quantity) - (aCurrent * a.quantity);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [portfolio, portfolioSearch, portfolioSort, creators]);

  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative bg-blue-600 dark:bg-blue-700 rounded-[3rem] p-12 overflow-hidden group shadow-2xl shadow-blue-500/20 dark:shadow-none transition-all">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tighter">
            좋아하는 크리에이터에게<br />직접 투자하세요
          </h2>
          <p className="text-blue-100 dark:text-blue-50 text-lg mb-10 opacity-90 font-medium">
            팬심을 가치로, 성장을 수익으로 나눕니다.<br />투스닥에서 새로운 투자 경험을 누려보세요.
          </p>
          <button 
            onClick={() => setCurrentView('pre-listing')}
            className="bg-white dark:bg-slate-200 text-blue-600 dark:text-blue-700 font-black px-10 py-4 rounded-2xl shadow-xl shadow-blue-900/30 hover:scale-105 transition-all active:scale-95"
          >
            사전공모 확인하기
          </button>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-[60%] h-[150%] bg-blue-400/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute right-12 bottom-12 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full border border-white/10 backdrop-blur-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">인기 크리에이터</h3>
            <button 
              onClick={() => setCurrentView('ranking')}
              className="text-sm font-bold text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              전체보기
            </button>
          </div>
          <div className="space-y-8">
            {creators.slice(0, 3).map((c) => (
              <div key={c.id} onClick={() => handleSelectCreator(c)} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/50 p-2 -m-2 rounded-2xl transition-all">
                <div className="flex items-center gap-5">
                  <img src={c.avatar} className="w-16 h-16 rounded-full shadow-lg group-hover:ring-4 group-hover:ring-blue-50 dark:group-hover:ring-blue-900/20 transition-all" alt="" />
                  <div>
                    <div className="font-black text-gray-900 dark:text-slate-100 text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.name}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{c.tags.join(' · ')}</div>
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <div className="text-xl font-black text-gray-900 dark:text-slate-100">{c.currentPrice.toLocaleString()} 강냉이</div>
                  <div className={`text-sm font-black flex items-center justify-end gap-1 ${c.changePercent >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                    {c.changePercent >= 0 ? '▲' : '▼'} {Math.abs(c.changePercent)}%
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-black mt-1 uppercase tracking-tighter">
                    시총 {(c.currentPrice * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group transition-colors duration-300">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
            <Sparkles size={48} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100">AI 크리에이터 분석</h3>
            <p className="text-gray-500 dark:text-slate-400 text-base font-medium leading-relaxed">
              Gemini가 실시간 지표를 분석하여<br />내일의 유망 종목을 제안합니다.
            </p>
          </div>
          <button className="w-full bg-blue-600 dark:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-[0.98]">
            분석 리포트 보기
          </button>
        </div>
      </div>
    </div>
  );

  const RankingView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 dark:text-slate-100 mb-4 tracking-tighter flex items-center gap-4">
            <Flame className="text-orange-500" size={40} /> 실시간 순위
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">지금 이 순간 가장 핫한 크리에이터들을 만나보세요.</p>
        </div>
        <div className="absolute right-[-10%] top-[-50%] w-96 h-96 bg-orange-50/50 dark:bg-orange-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
        {creators.slice(0, 3).map((c, i) => (
          <div 
            key={c.id} 
            onClick={() => handleSelectCreator(c)}
            className={`bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300 ${i === 0 ? 'ring-4 ring-yellow-400 dark:ring-yellow-600' : ''}`}
          >
            <div className="absolute top-6 left-6">
               <span className={`flex items-center justify-center w-10 h-10 rounded-2xl font-black text-lg ${
                 i === 0 ? 'bg-yellow-400 dark:bg-yellow-500 text-white' : 
                 i === 1 ? 'bg-gray-300 dark:bg-slate-700 text-white dark:text-slate-300' : 
                 'bg-orange-300 dark:bg-orange-900/50 text-white dark:text-orange-200'
               }`}>
                 {i + 1}
               </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <img src={c.avatar} className="w-24 h-24 rounded-full shadow-2xl mb-6 border-4 border-white dark:border-slate-800 group-hover:ring-4 group-hover:ring-blue-50 dark:group-hover:ring-blue-900/20 transition-all" alt="" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">{c.name}</h3>
              <div className="flex gap-1 mb-6">
                {c.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase">#{tag}</span>
                ))}
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-slate-100 mb-1">{c.currentPrice.toLocaleString()}</div>
              <div className={`text-sm font-black flex items-center gap-1 mb-2 ${c.changePercent >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                {c.changePercent >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(c.changePercent)}%
              </div>
              <div className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-2 border-t pt-2 w-full border-gray-50 dark:border-slate-800">
                시가총액 {(c.currentPrice * 1000).toLocaleString()}
              </div>
            </div>
            {i === 0 && <Medal className="absolute -right-4 -bottom-4 text-yellow-100 dark:text-yellow-900/10" size={120} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6 text-left">순위</th>
                <th className="px-10 py-6 text-left">크리에이터</th>
                <th className="px-10 py-6 text-right">현재가</th>
                <th className="px-10 py-6 text-right">등락률</th>
                <th className="px-10 py-6 text-right">시가총액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {creators.map((c, i) => (
                <tr key={c.id} onClick={() => handleSelectCreator(c)} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                  <td className="px-10 py-6 text-lg font-black text-gray-400 dark:text-slate-600">{i + 1}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <img src={c.avatar} className="w-12 h-12 rounded-full shadow-sm group-hover:scale-110 transition-transform" alt="" />
                      <div>
                        <div className="text-base font-black text-gray-900 dark:text-slate-100">{c.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold tracking-wider">{c.tags.join(' · ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right text-base font-black text-gray-900 dark:text-slate-100">{c.currentPrice.toLocaleString()}</td>
                  <td className={`px-10 py-6 text-right text-base font-black ${c.changePercent >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                    {c.changePercent >= 0 ? '+' : ''}{c.changePercent}%
                  </td>
                  <td className="px-10 py-6 text-right text-base font-bold text-gray-400 dark:text-slate-500">{(c.currentPrice * 1000).toLocaleString()} <span className="text-[10px]">강냉이</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MyPageView = () => {
    const totalEvaluation = portfolio.reduce((acc, curr) => {
      const currentPrice = creators.find(c => c.id === curr.creatorId)?.currentPrice || curr.avgPrice;
      return acc + (currentPrice * curr.quantity);
    }, 0);
    const costBasis = portfolio.reduce((a,c)=>a+(c.avgPrice*c.quantity),0);
    const profitAmt = totalEvaluation - costBasis;
    const profitRate = costBasis > 0 ? (((totalEvaluation - costBasis) / costBasis) * 100).toFixed(2) : "0.00";
    const isGain = Number(profitRate) >= 0;
    
    const pieData = portfolio.length > 0 ? portfolio.map(p => ({
      name: p.name,
      value: (creators.find(c => c.id === p.creatorId)?.currentPrice || p.avgPrice) * p.quantity
    })) : [{ name: '현금', value: walletBalance }];

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wallet size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">내 자산 대시보드</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">총 자산 평가액</div>
                  <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tighter break-all">
                    {(walletBalance + totalEvaluation).toLocaleString()} <span className="text-lg font-bold text-gray-400">강냉이</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black ${isGain ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'}`}>
                      {isGain ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      {Math.abs(Number(profitRate))}% ({profitAmt.toLocaleString()}원)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 p-6 bg-gray-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-gray-100 dark:border-slate-800 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 dark:text-slate-400">투자 중인 금액</span>
                    <span className="text-lg font-black text-gray-900 dark:text-slate-200">{totalEvaluation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500 dark:text-slate-400">사용 가능 강냉이</span>
                      <button 
                        onClick={handleRecharge}
                        className="p-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:scale-105 transition-all shadow-md shadow-blue-200 dark:shadow-none"
                        title="100,000 충전"
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{walletBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-50 dark:border-slate-800 pt-8 transition-colors">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">투자 종목: {portfolio.length}개</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">참여 IPO: {ipoParticipations.length}개</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center transition-colors duration-300">
            <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">자산 포트폴리오</h3>
            <div className="h-48 w-48 sm:h-52 sm:w-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '24px', 
                      border: 'none', 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      color: isDarkMode ? '#f1f5f9' : '#0f172a', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase">Invested</span>
                <span className="text-lg font-black text-gray-900 dark:text-slate-200">{portfolio.length > 0 ? Math.round((totalEvaluation / (walletBalance + totalEvaluation)) * 100) : 0}%</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 w-full">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Alerts Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="px-10 py-8 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">나의 가격 알림</h3>
            </div>
          </div>
          <div className="p-8">
            {priceAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priceAlerts.map(alert => (
                  <div key={alert.id} className="p-6 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-3xl flex justify-between items-center group transition-all hover:bg-white dark:hover:bg-slate-800">
                    <div>
                      <div className="text-sm font-black text-gray-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{alert.creatorName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${alert.condition === 'above' ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'}`}>
                          {alert.condition === 'above' ? '이상' : '이하'}
                        </span>
                        <span className="text-sm font-bold text-gray-500 dark:text-slate-400">{alert.targetPrice.toLocaleString()} 강냉이</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-[10px] font-bold ${alert.active ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-slate-600'}`}>
                          {alert.active ? '감시 중' : '발동됨 / 비활성'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="p-2 text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-30 dark:opacity-20">
                <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="font-bold text-gray-500">설정된 알림이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed List with Filter & Sort */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="px-8 sm:px-10 py-8 border-b border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">보유 크리에이터 상세</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  placeholder="종목 검색"
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select 
                  value={portfolioSort}
                  onChange={(e) => setPortfolioSort(e.target.value as SortOption)}
                  className="appearance-none w-full sm:w-40 pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-slate-900 transition-all"
                >
                  <option value="profit">수익률순</option>
                  <option value="value">평가금액순</option>
                  <option value="quantity">보유량순</option>
                  <option value="name">이름순</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 text-left">크리에이터 종목</th>
                  <th className="px-10 py-6 text-right">보유량 / 평단가</th>
                  <th className="px-10 py-6 text-right">현재가 / 평가금액</th>
                  <th className="px-10 py-6 text-right">수익률 / 손익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {sortedAndFilteredPortfolio.length > 0 ? sortedAndFilteredPortfolio.map((item) => {
                  const currentCreator = creators.find(c => c.id === item.creatorId);
                  const currentPrice = currentCreator?.currentPrice || item.avgPrice;
                  const itemProfitAmt = (currentPrice - item.avgPrice) * item.quantity;
                  const itemProfitRate = ((currentPrice - item.avgPrice) / item.avgPrice * 100).toFixed(2);
                  const isItemGain = Number(itemProfitRate) >= 0;

                  return (
                    <tr key={item.creatorId} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group" onClick={() => currentCreator && handleSelectCreator(currentCreator)}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={item.avatar} className="w-12 h-12 rounded-2xl shadow-sm group-hover:scale-105 transition-transform" alt="" />
                          <div>
                            <div className="text-base font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold tracking-wider">CREATOR_ID: {item.creatorId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="text-base font-black text-gray-700 dark:text-slate-300">{item.quantity.toLocaleString()} 주</div>
                        <div className="text-xs font-bold text-gray-400 dark:text-slate-500">{item.avgPrice.toLocaleString()} 강냉이</div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="text-base font-black text-gray-900 dark:text-slate-100">{currentPrice.toLocaleString()} 강냉이</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-slate-400">{(currentPrice * item.quantity).toLocaleString()} 원</div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className={`text-base font-black flex items-center justify-end gap-1 ${isItemGain ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                          {isItemGain ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {Math.abs(Number(itemProfitRate))}%
                        </div>
                        <div className={`text-xs font-bold ${isItemGain ? 'text-red-400' : 'text-blue-400'}`}>
                          {itemProfitAmt > 0 ? '+' : ''}{itemProfitAmt.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-30 dark:opacity-20 transition-opacity">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <Search size={40} className="text-gray-400 dark:text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-gray-900 dark:text-slate-200 tracking-tight">검색 결과가 없습니다.</p>
                          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">다른 종목명으로 검색하거나 필터를 변경해보세요.</p>
                        </div>
                        {portfolioSearch && (
                          <button 
                            onClick={() => setPortfolioSearch('')}
                            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                          >
                            검색 초기화
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* IPO Section */}
        {ipoParticipations.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-blue-50/10 dark:bg-blue-900/5 transition-colors">
              <div className="flex items-center gap-3">
                <Rocket className="text-blue-600 dark:text-blue-400" size={20} />
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">공모 참여 현황</h3>
              </div>
            </div>
            <div className="p-8 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ipoParticipations.map(p => (
                  <div key={p.preListingId} className="bg-gray-50/50 dark:bg-slate-800/30 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl dark:hover:shadow-none hover:shadow-blue-50 dark:hover:shadow-blue-900/10 transition-all duration-300 group">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">IPO 참여완료</div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{p.date}</span>
                      </div>
                      <div className="text-lg font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</div>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-100 dark:border-slate-700 pt-4">
                      <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">투자액</div>
                      <div className="text-xl font-black text-gray-900 dark:text-slate-100">{p.amount.toLocaleString()} <span className="text-xs font-medium">강냉이</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CommunityView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
        <h2 className="text-4xl font-black text-gray-900 dark:text-slate-100 mb-4 tracking-tighter flex items-center gap-4">
          <MessageSquare className="text-blue-500 dark:text-blue-400" size={40} /> 투스닥 광장
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">자유롭게 의견을 나누고 투자 정보를 공유하세요.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="flex border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30">
          <button className="px-10 py-6 text-sm font-black text-blue-600 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-400">전체 게시글</button>
          <button className="px-10 py-6 text-sm font-black text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-200 transition-colors">실시간 인기</button>
          <button className="px-10 py-6 text-sm font-black text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-200 transition-colors">공지사항</button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {[
            { id: 1, author: '강냉이수집가', title: '오늘 침착맨 상장하면 바로 풀매수 갑니다', time: '10분 전', likes: 24, comments: 5 },
            { id: 2, author: '투스닥고수', title: '우왁굳 시세 분석: 이세돌 효과 어디까지?', time: '25분 전', likes: 56, comments: 12 },
            { id: 3, author: '슈카팬', title: '슈카월드 배당금 쏠쏠하네요 ㅎㅎ', time: '1시간 전', likes: 31, comments: 3 },
          ].map(post => (
            <div key={post.id} className="p-8 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h3>
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500">{post.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <span className="text-sm font-bold text-gray-600 dark:text-slate-400">{post.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 dark:text-slate-500">
                    <Heart size={14} className="group-hover:text-red-500 transition-colors" /> {post.likes}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 dark:text-slate-500">
                    <MessageSquare size={14} className="group-hover:text-blue-500 transition-colors" /> {post.comments}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PreListingView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-blue-600 dark:bg-blue-700 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-blue-200 dark:shadow-none relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 tracking-tighter flex items-center gap-4">
            <Rocket className="text-blue-200 dark:text-blue-300" size={40} /> 사전 공모 (IPO)
          </h2>
          <p className="text-blue-100 dark:text-blue-50 text-lg font-medium">유망한 크리에이터가 상장되기 전, 초기 투자자로 참여하세요.</p>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {preListingData.map(item => {
          const progress = (item.currentAmount / item.goalAmount) * 100;
          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-10 shadow-sm flex flex-col justify-between hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <img src={item.avatar} className="w-20 h-20 rounded-3xl shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-105 transition-transform" alt="" />
                  <div className="text-right">
                    <span className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black mb-2 uppercase tracking-widest">D-{item.daysLeft}</span>
                    <div className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">모집 마감 임박</div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
                <p className="text-gray-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-8 line-clamp-2">{item.description}</p>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-end">
                    <div className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">모집 현황</div>
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{Math.round(progress)}%</div>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-slate-500">
                    <span>{item.currentAmount.toLocaleString()} 강냉이</span>
                    <span>목표 {item.goalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIpo(item)}
                className="w-full py-5 bg-gray-900 dark:bg-slate-700 text-white font-black rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 transition-all active:scale-[0.98] shadow-xl shadow-gray-200 dark:shadow-none"
              >
                참여하기
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const currentChartData = useMemo(() => {
    let points = 50;
    if (selectedTimeframe === '1H') points = 60;
    if (selectedTimeframe === '1D') points = 24;
    if (selectedTimeframe === '1W') points = 7;
    if (selectedTimeframe === '1M') points = 30;
    if (selectedTimeframe === '1Y') points = 100;
    
    const base = selectedCreator.currentPrice;
    return generateChartData(points, base);
  }, [selectedCreator.id, selectedCreator.currentPrice, selectedTimeframe]);

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-[#f8fafc] dark:bg-slate-950 pb-20 relative font-['Noto_Sans_KR']`}>
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <h1 
              onClick={() => { setCurrentView('home'); setHomeMode('dashboard'); }}
              className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter cursor-pointer flex items-center gap-1"
            >
              TOOSDAQ
              <span className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-lg ml-1 font-black">BETA</span>
            </h1>
            <nav className="hidden md:flex items-center gap-10 text-lg font-black">
              <button onClick={() => { setCurrentView('home'); setHomeMode('dashboard'); }} className={`transition-all hover:scale-105 ${currentView === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300'}`}>투자하기</button>
              <button onClick={() => setCurrentView('ranking')} className={`transition-all hover:scale-105 ${currentView === 'ranking' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300'}`}>실시간 순위</button>
              <button onClick={() => setCurrentView('pre-listing')} className={`transition-all hover:scale-105 ${currentView === 'pre-listing' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300'}`}>사전공모</button>
              <button onClick={() => setCurrentView('community')} className={`transition-all hover:scale-105 ${currentView === 'community' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300'}`}>커뮤니티</button>
              <button onClick={() => setCurrentView('mypage')} className={`transition-all hover:scale-105 ${currentView === 'mypage' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300'}`}>마이페이지</button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-500 transition-all duration-300 transform active:rotate-45"
              aria-label="테마 전환"
            >
              {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-700" />}
            </button>
            <div className="flex items-center gap-2 sm:gap-3 bg-yellow-50 dark:bg-yellow-900/10 px-3 sm:px-6 py-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all shadow-sm" onClick={() => setCurrentView('mypage')}>
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-500" />
              <span className="text-sm sm:text-base font-black text-yellow-700 dark:text-yellow-500 truncate max-w-[80px] sm:max-w-none">{walletBalance.toLocaleString()}</span>
              <span className="text-[10px] text-yellow-600 dark:text-yellow-600/70 font-black hidden sm:inline tracking-widest uppercase">강냉이</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:flex p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-500 transition-colors">
              {isSidebarOpen ? <PanelRightClose size={24} /> : <PanelRightOpen size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-500`}>
          {currentView === 'home' && (
            homeMode === 'dashboard' ? <DashboardView /> : (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
                <button 
                  onClick={() => setHomeMode('dashboard')}
                  className="flex items-center gap-2 text-sm font-black text-gray-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all mb-4 uppercase tracking-widest"
                >
                  <ArrowLeft size={18} /> DASHBOARD
                </button>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden group transition-colors duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6 sm:gap-8">
                      <img src={selectedCreator.avatar} className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl group-hover:scale-105 transition-transform flex-shrink-0" alt="" />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tighter truncate">{selectedCreator.name}</h2>
                          <button 
                            onClick={openAlertModal}
                            className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                            title="가격 알림 설정"
                          >
                            <BellRing size={20} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCreator.tags.map(tag => (
                            <span key={tag} className="text-[10px] sm:text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full uppercase">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-6 md:border-l md:pl-12 border-gray-100 dark:border-slate-800 transition-colors">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 mb-2 uppercase tracking-widest">현재가</div>
                        <div className={`text-4xl sm:text-5xl font-black tracking-tighter ${selectedCreator.change >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                          {selectedCreator.currentPrice.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-500 mt-2">
                          시가총액 {(selectedCreator.currentPrice * 1000).toLocaleString()} <span className="text-[10px]">강냉이</span>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                          onClick={() => openTradeModal('buy')}
                          className="flex-1 px-6 sm:px-10 py-4 bg-red-500 dark:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 dark:shadow-none hover:bg-red-600 dark:hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={20} /> 매수
                        </button>
                        <button 
                          onClick={() => openTradeModal('sell')}
                          className="flex-1 px-6 sm:px-10 py-4 bg-blue-500 dark:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-600 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          매도
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -z-0" />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
                  <div className="flex border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30 overflow-x-auto no-scrollbar">
                    {(['chart', 'hoga', 'info', 'community'] as ViewTab[]).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[80px] py-6 text-base sm:text-lg font-black border-b-4 transition-all ${activeTab === tab ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-inner' : 'border-transparent text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-200'}`}>
                        {tab === 'chart' && '차트'} {tab === 'hoga' && '호가'} {tab === 'info' && '분석'} {tab === 'community' && '토론'}
                      </button>
                    ))}
                  </div>
                  <div className="p-6 sm:p-10 min-h-[500px]">
                    {activeTab === 'chart' && (
                      <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        {/* Interactive Chart Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-3xl border border-gray-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            {(['1H', '1D', '1W', '1M', '1Y'] as TimeFrame[]).map((tf) => (
                              <button 
                                key={tf}
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedTimeframe === tf ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-100 dark:shadow-none' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'}`}
                              >
                                {tf}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                            <MoveHorizontal size={14} /> 드래그하여 범위 조절
                          </div>
                        </div>

                        <div className="h-[350px] sm:h-[450px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                              <XAxis 
                                dataKey="time" 
                                tick={{fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#64748b' : '#cbd5e1'}}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                              />
                              <YAxis 
                                domain={['auto', 'auto']} 
                                tick={{fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#64748b' : '#cbd5e1'}} 
                                axisLine={false} 
                                tickLine={false} 
                                mirror={false}
                                tickFormatter={(val) => val.toLocaleString()}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  borderRadius: '24px', 
                                  border: 'none', 
                                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                  padding: '16px'
                                }}
                                labelStyle={{ fontWeight: 800, marginBottom: '8px', color: isDarkMode ? '#94a3b8' : '#94a3b8' }}
                                itemStyle={{ fontWeight: 900, color: '#3b82f6' }}
                                formatter={(value: any) => [`${value.toLocaleString()} 강냉이`, '시세']}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorMain)" 
                                strokeWidth={4} 
                                animationDuration={1000}
                                isAnimationActive={true}
                              />
                              <ReferenceLine 
                                y={selectedCreator.currentPrice} 
                                stroke="#ef4444" 
                                strokeDasharray="3 3" 
                                label={{ position: 'right', value: '현재', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} 
                              />
                              <Brush 
                                dataKey="time" 
                                height={40} 
                                stroke="#3b82f6" 
                                fill={isDarkMode ? '#0f172a' : '#f8fafc'}
                                travellerWidth={10}
                                startIndex={0}
                                endIndex={currentChartData.length - 1}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {activeTab === 'hoga' && <HogaView creator={selectedCreator} />}
                    {activeTab === 'info' && <CreatorAnalysisView creator={selectedCreator} />}
                    {activeTab === 'community' && <CreatorDiscussionView creator={selectedCreator} />}
                  </div>
                </div>
              </div>
            )
          )}

          {currentView === 'community' && <CommunityView />}
          {currentView === 'mypage' && <MyPageView />}
          {currentView === 'pre-listing' && <PreListingView />}
          {currentView === 'ranking' && <RankingView />}
        </div>

        <div className={`lg:col-span-3 space-y-8 ${isSidebarOpen ? 'block' : 'hidden lg:hidden'} animate-in slide-in-from-right-8 duration-700`}>
          <MarketIndexWidget />
          <SidebarRanking creators={creators} onSelect={handleSelectCreator} />
          <NewsFeedWidget />
        </div>
      </main>

      {/* Enhanced Trade Modal with Indicator */}
      {isTradeModalOpen && (() => {
        const totalCost = priceInput * quantityInput;
        const ownedQty = portfolio.find(p => p.creatorId === selectedCreator.id)?.quantity || 0;
        
        // Calculate ratio for indicator
        const ratio = tradeModalType === 'buy' 
          ? (walletBalance > 0 ? (totalCost / walletBalance) * 100 : 0)
          : (ownedQty > 0 ? (quantityInput / ownedQty) * 100 : 0);
        
        const isExceeded = tradeModalType === 'buy' ? totalCost > walletBalance : quantityInput > ownedQty;
        const clampedRatio = Math.min(ratio, 100);

        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-lg p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden transition-colors duration-300 border dark:border-slate-800">
              <button 
                onClick={() => setIsTradeModalOpen(false)}
                className="absolute top-8 right-8 sm:top-10 sm:right-10 text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300 transition-colors"
              >
                <X size={28} />
              </button>

              <div className="flex items-center gap-4 sm:gap-6 mb-10 sm:mb-12">
                <img src={selectedCreator.avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-50 dark:border-slate-800 flex-shrink-0" alt="" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-slate-100 truncate max-w-[200px]">{selectedCreator.name}</h3>
                  <div className={`text-base sm:text-lg font-black ${tradeModalType === 'buy' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                    {tradeModalType === 'buy' ? '매수 주문' : '매도 주문'}
                  </div>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Visual Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                      {tradeModalType === 'buy' ? '잔고 대비 비중' : '보유량 대비 비중'}
                    </span>
                    <span className={`text-xs font-black ${isExceeded ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-slate-400'}`}>
                      {ratio.toFixed(1)}% {isExceeded && '(한도 초과)'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${
                        isExceeded ? 'bg-red-500' : 
                        tradeModalType === 'buy' ? 'bg-red-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${clampedRatio}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">주문 단가</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400">현재가: {selectedCreator.currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={priceInput}
                      onChange={(e) => setPriceInput(Number(e.target.value))}
                      className="w-full bg-transparent text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 outline-none"
                    />
                    <span className="text-gray-400 dark:text-slate-600 font-bold">강냉이</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">주문 수량</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400">
                      {tradeModalType === 'sell' ? `보유: ${ownedQty}주` : `최대 가능: ${Math.floor(walletBalance / (priceInput || 1))}주`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(Number(e.target.value))}
                      className="w-full bg-transparent text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 outline-none"
                    />
                    <span className="text-gray-400 dark:text-slate-600 font-bold">주</span>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <span className="text-sm sm:text-base text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">총 주문 금액</span>
                  <span className={`text-xl sm:text-2xl font-black ${tradeModalType === 'buy' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                    {totalCost.toLocaleString()} <span className="text-xs sm:text-sm">강냉이</span>
                  </span>
                </div>

                <button 
                  onClick={handleTrade}
                  disabled={isExceeded}
                  className={`w-full py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] text-white font-black text-lg sm:text-xl shadow-2xl dark:shadow-none transition-all active:scale-[0.98] ${
                    isExceeded 
                      ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
                      : (tradeModalType === 'buy' ? 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 shadow-red-100' : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 shadow-blue-100')
                  }`}
                >
                  {tradeModalType === 'buy' ? '매수 확인' : '매도 확인'}
                </button>
              </div>
              
              <div className="mt-8 text-center text-[10px] sm:text-xs font-bold text-gray-300 dark:text-slate-600 uppercase tracking-widest">
                보유 자산: {walletBalance.toLocaleString()} 강냉이
              </div>
            </div>
          </div>
        );
      })()}

      {isAlertModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden transition-colors duration-300 border dark:border-slate-800">
            <button onClick={() => setIsAlertModalOpen(false)} className="absolute top-8 right-8 text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300 transition-colors">
              <X size={28} />
            </button>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner transition-colors">
                <BellRing size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">가격 알림 설정</h3>
                <div className="text-sm font-bold text-gray-400 dark:text-slate-500">{selectedCreator.name}</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 transition-colors">
                <label className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-4">목표 가격</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={alertPriceInput}
                    onChange={(e) => setAlertPriceInput(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-slate-100 outline-none"
                  />
                  <span className="text-gray-400 dark:text-slate-600 font-bold">강냉이</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAlertCondition('above')}
                  className={`py-4 rounded-2xl font-black transition-all border-2 ${alertCondition === 'above' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-500 dark:text-red-400' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:border-red-100 dark:hover:border-red-900/10'}`}
                >
                  이상
                </button>
                <button 
                  onClick={() => setAlertCondition('below')}
                  className={`py-4 rounded-2xl font-black transition-all border-2 ${alertCondition === 'below' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:border-red-100 dark:hover:border-red-900/10'}`}
                >
                  이하
                </button>
              </div>
              <button 
                onClick={handleAddAlert}
                className="w-full py-6 bg-blue-600 dark:bg-blue-500 text-white font-black rounded-[2rem] text-xl shadow-2xl dark:shadow-none shadow-blue-200 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all active:scale-[0.98]"
              >
                알림 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedIpo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden transition-colors duration-300 border dark:border-slate-800">
            <button onClick={() => setSelectedIpo(null)} className="absolute top-8 right-8 text-gray-300 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-300 transition-colors">
              <X size={28} />
            </button>
            <div className="flex items-center gap-6 mb-10">
              <img src={selectedIpo.avatar} className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-slate-800 flex-shrink-0 shadow-lg" alt="" />
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{selectedIpo.name}</h3>
                <div className="text-lg font-black text-blue-600 dark:text-blue-400">사전 공모 참여</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">참여 금액</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400">보유: {walletBalance.toLocaleString()} 강냉이</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={ipoAmountInput}
                    onChange={(e) => setIpoAmountInput(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-slate-100 outline-none"
                  />
                  <span className="text-gray-400 dark:text-slate-600 font-bold">강냉이</span>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-base text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">예상 배정 수량</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {Math.floor(ipoAmountInput / 1000).toLocaleString()} <span className="text-sm">주</span>
                </span>
              </div>
              <button 
                onClick={handleParticipateIpo}
                className="w-full py-6 bg-blue-600 dark:bg-blue-500 text-white font-black rounded-[2rem] text-xl shadow-2xl dark:shadow-none shadow-blue-200 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all active:scale-[0.98]"
              >
                참여 확정
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-32 border-t py-20 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-10 text-center">
          <div className="text-2xl sm:text-3xl font-black text-gray-200 dark:text-slate-800 mb-8 tracking-tighter uppercase">TOOSDAQ INVESTMENT PLATFORM</div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-gray-400 dark:text-slate-600 mb-8">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">이용약관</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">제휴문의</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">고객센터</a>
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-300 dark:text-slate-700 leading-loose max-w-xl mx-auto font-medium">
            TOOSDAQ은 팬들과 크리에이터를 연결하는 모의 투자 플랫폼입니다. 모든 거래는 가상의 화폐인 '강냉이'를 통해 이루어지며, 실제 금전적 가치는 없습니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
