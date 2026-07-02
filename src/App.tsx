import { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { Creator, TabId, AppState, Transaction, Holding, Dividend, Order } from './types';
import { creatorsData, calcDividendPerShare } from './data/creators';

import Market from './components/Market';
import Portfolio from './components/Portfolio';
import Ranking from './components/Ranking';
import TradeModal from './components/TradeModal';
import TransactionHistory from './components/TransactionHistory';
import Orders from './components/Orders';

interface FillToast {
  id: string;
  order: Order;
}

type Action =
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'FILL_ORDER';  orderId: string; fillPrice: number }
  | { type: 'CANCEL_ORDER'; orderId: string }
  | { type: 'RECEIVE_DIVIDEND'; creatorId: number; amount: number; creator: Creator };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'PLACE_ORDER': {
      const o = action.order;
      if (o.type === 'buy') {
        const cost = o.quantity * o.limitPrice;
        if (state.balance < cost) return state;
        return { ...state, balance: state.balance - cost, orders: [o, ...state.orders] };
      } else {
        const holding = state.holdings.find(h => h.creatorId === o.creatorId);
        if (!holding || holding.quantity < o.quantity) return state;
        const newHoldings = holding.quantity === o.quantity
          ? state.holdings.filter(h => h.creatorId !== o.creatorId)
          : state.holdings.map(h => h.creatorId === o.creatorId ? { ...h, quantity: h.quantity - o.quantity } : h);
        return { ...state, holdings: newHoldings, orders: [o, ...state.orders] };
      }
    }

    case 'FILL_ORDER': {
      const order = state.orders.find(o => o.id === action.orderId);
      if (!order || order.status !== 'pending') return state;
      const filled: Order = { ...order, status: 'filled', filledAt: new Date(), filledPrice: action.fillPrice };
      const updatedOrders = state.orders.map(o => o.id === action.orderId ? filled : o);

      if (order.type === 'buy') {
        const existing = state.holdings.find(h => h.creatorId === order.creatorId);
        const newHoldings: Holding[] = existing
          ? state.holdings.map(h => h.creatorId === order.creatorId
              ? { ...h, quantity: h.quantity + order.quantity, avgBuyPrice: Math.round((h.avgBuyPrice * h.quantity + action.fillPrice * order.quantity) / (h.quantity + order.quantity)) }
              : h)
          : [...state.holdings, { creatorId: order.creatorId, quantity: order.quantity, avgBuyPrice: action.fillPrice }];
        // limit보다 낮게 체결되면 차액 환불
        const refund = (order.limitPrice - action.fillPrice) * order.quantity;
        const tx: Transaction = { id: `tx-${Date.now()}`, creatorId: order.creatorId, creatorName: order.creatorName, creatorEmoji: order.creatorEmoji, type: 'buy', quantity: order.quantity, price: action.fillPrice, total: action.fillPrice * order.quantity, timestamp: new Date() };
        return { ...state, balance: state.balance + Math.max(0, refund), holdings: newHoldings, orders: updatedOrders, transactions: [tx, ...state.transactions] };
      } else {
        const proceeds = action.fillPrice * order.quantity;
        const tx: Transaction = { id: `tx-${Date.now()}`, creatorId: order.creatorId, creatorName: order.creatorName, creatorEmoji: order.creatorEmoji, type: 'sell', quantity: order.quantity, price: action.fillPrice, total: proceeds, timestamp: new Date() };
        return { ...state, balance: state.balance + proceeds, orders: updatedOrders, transactions: [tx, ...state.transactions] };
      }
    }

    case 'CANCEL_ORDER': {
      const order = state.orders.find(o => o.id === action.orderId);
      if (!order || order.status !== 'pending') return state;
      const updatedOrders = state.orders.map(o => o.id === action.orderId ? { ...o, status: 'cancelled' as const } : o);
      if (order.type === 'buy') {
        return { ...state, balance: state.balance + order.quantity * order.limitPrice, orders: updatedOrders };
      } else {
        const existing = state.holdings.find(h => h.creatorId === order.creatorId);
        const newHoldings = existing
          ? state.holdings.map(h => h.creatorId === order.creatorId ? { ...h, quantity: h.quantity + order.quantity } : h)
          : [...state.holdings, { creatorId: order.creatorId, quantity: order.quantity, avgBuyPrice: order.limitPrice }];
        return { ...state, holdings: newHoldings, orders: updatedOrders };
      }
    }

    case 'RECEIVE_DIVIDEND': {
      const div: Dividend = { id: `div-${Date.now()}`, creatorId: action.creatorId, creatorName: action.creator.name, creatorEmoji: action.creator.emoji, amount: action.amount, timestamp: new Date() };
      return { ...state, balance: state.balance + action.amount, dividends: [div, ...state.dividends] };
    }

    default: return state;
  }
}

const initialState: AppState = {
  balance: 10_000_000,
  holdings: [
    { creatorId: 4, quantity: 50, avgBuyPrice: 18200 },
    { creatorId: 2, quantity: 30, avgBuyPrice: 13400 },
    { creatorId: 9, quantity: 80, avgBuyPrice: 8900  },
    { creatorId: 6, quantity: 45, avgBuyPrice: 7600  },
  ],
  orders: [],
  transactions: [
    { id: 'tx-1', creatorId: 4, creatorName: '봄바람소녀', creatorEmoji: '🌸', type: 'buy', quantity: 50, price: 18200, total: 910000,  timestamp: new Date(Date.now() - 864e5*5) },
    { id: 'tx-2', creatorId: 2, creatorName: '하늘별빛',   creatorEmoji: '⭐', type: 'buy', quantity: 30, price: 13400, total: 402000,  timestamp: new Date(Date.now() - 864e5*3) },
    { id: 'tx-3', creatorId: 9, creatorName: '황금손바닥', creatorEmoji: '🏆', type: 'buy', quantity: 80, price: 8900,  total: 712000,  timestamp: new Date(Date.now() - 864e5*2) },
    { id: 'tx-4', creatorId: 6, creatorName: '새벽세시',   creatorEmoji: '🌙', type: 'buy', quantity: 45, price: 7600,  total: 342000,  timestamp: new Date(Date.now() - 864e5*1) },
  ],
  dividends: [
    { id: 'div-1', creatorId: 4, creatorName: '봄바람소녀', creatorEmoji: '🌸', amount: 28900, timestamp: new Date(Date.now() - 864e5*2) },
    { id: 'div-2', creatorId: 2, creatorName: '하늘별빛',   creatorEmoji: '⭐', amount: 12400, timestamp: new Date(Date.now() - 864e5*1) },
  ],
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'market',    label: '시장'      },
  { id: 'portfolio', label: '포트폴리오' },
  { id: 'orders',    label: '주문현황'  },
  { id: 'ranking',   label: '랭킹'      },
  { id: 'history',   label: '거래내역'  },
];

export default function App() {
  const [tab, setTab]                  = useState<TabId>('market');
  const [selectedCreator, setSelected] = useState<Creator | null>(null);
  const [tradeType, setTradeType]      = useState<'buy' | 'sell'>('buy');
  const [state, dispatch]              = useReducer(appReducer, initialState);
  const [isDark, setIsDark]            = useState(false);

  // 실시간 가격 (±0.5% 매 3초 랜덤 변동 — 지정가 체결 트리거용)
  const [livePrices, setLivePrices] = useState<Record<number, number>>(
    () => Object.fromEntries(creatorsData.map(c => [c.id, c.price]))
  );
  const livePricesRef = useRef(livePrices);
  livePricesRef.current = livePrices;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    // 가격 시뮬레이션 (3초마다 ±0.5% 변동)
    const priceTicker = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        creatorsData.forEach(c => {
          const delta = (Math.random() - 0.5) * 0.01;
          next[c.id] = Math.max(1, Math.round(prev[c.id] * (1 + delta)));
        });
        return next;
      });
    }, 3000);

    // 주문 매칭 엔진 (1.5초마다 체결 시도)
    const matchTicker = setInterval(() => {
      const cur = stateRef.current;
      const prices = livePricesRef.current;
      const pending = cur.orders.filter(o => o.status === 'pending');
      if (pending.length === 0) return;

      pending.forEach(o => {
        const price = prices[o.creatorId] ?? o.limitPrice;
        if (o.orderType === 'market') {
          // 시장가: 현재가 ± 0.1% 스프레드로 즉시 체결
          const spread = Math.max(1, Math.round(price * 0.001));
          const fillPrice = o.type === 'buy' ? price + spread : Math.max(1, price - spread);
          dispatch({ type: 'FILL_ORDER', orderId: o.id, fillPrice });
        } else {
          // 지정가: 매수 → 현재가 ≤ 지정가, 매도 → 현재가 ≥ 지정가
          if (o.type === 'buy'  && price <= o.limitPrice) dispatch({ type: 'FILL_ORDER', orderId: o.id, fillPrice: price });
          if (o.type === 'sell' && price >= o.limitPrice) dispatch({ type: 'FILL_ORDER', orderId: o.id, fillPrice: price });
        }
      });
    }, 1500);

    return () => { clearInterval(priceTicker); clearInterval(matchTicker); };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem('toosdaq-theme');
    if (saved === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem('toosdaq-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const portfolioValue = state.holdings.reduce((s, h) => {
    const c = creatorsData.find(x => x.id === h.creatorId);
    return s + (c ? c.price * h.quantity : 0);
  }, 0);
  const totalAssets = state.balance + portfolioValue;
  const pnl = portfolioValue - state.holdings.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0);
  const pnlPct = state.holdings.length
    ? (pnl / state.holdings.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0)) * 100
    : 0;

  const [tradeResult, setTradeResult] = useState<{
    type: 'buy' | 'sell'; creator: Creator; quantity: number; price: number; orderType: 'market' | 'limit';
  } | null>(null);

  // 체결 토스트 알림
  const [fillToasts, setFillToasts] = useState<FillToast[]>([]);
  const prevOrderStatusRef = useRef<Record<string, Order['status']>>({});

  useEffect(() => {
    const newFills: Order[] = [];
    state.orders.forEach(o => {
      const prev = prevOrderStatusRef.current[o.id];
      if (prev === 'pending' && o.status === 'filled') {
        newFills.push(o);
      }
      prevOrderStatusRef.current[o.id] = o.status;
    });
    if (newFills.length === 0) return;
    const toasts: FillToast[] = newFills.map(o => ({ id: `toast-${o.id}`, order: o }));
    setFillToasts(prev => [...toasts, ...prev]);
    toasts.forEach(t => {
      setTimeout(() => {
        setFillToasts(prev => prev.filter(x => x.id !== t.id));
      }, 4000);
    });
  }, [state.orders]);

  const claimDividend = useCallback(() => {
    state.holdings.forEach(h => {
      const creator = creatorsData.find(c => c.id === h.creatorId);
      if (!creator) return;
      const perShare = calcDividendPerShare(creator);
      const amount = perShare * h.quantity;
      if (amount <= 0) return;
      dispatch({ type: 'RECEIVE_DIVIDEND', creatorId: creator.id, amount, creator });
    });
  }, [state.holdings]);

  const openTrade  = useCallback((c: Creator, t: 'buy'|'sell') => { setSelected(c); setTradeType(t); }, []);
  const closeTrade = useCallback(() => setSelected(null), []);

  const handlePlaceOrder = useCallback((
    creatorId: number, quantity: number, price: number,
    type: 'buy'|'sell', orderType: 'market'|'limit'
  ) => {
    const creator = creatorsData.find(c => c.id === creatorId)!;
    const order: Order = {
      id: `ord-${Date.now()}`,
      creatorId, creatorName: creator.name, creatorEmoji: creator.emoji,
      type, orderType, quantity, limitPrice: price,
      status: 'pending', timestamp: new Date(),
    };
    dispatch({ type: 'PLACE_ORDER', order });
    setTradeResult({ type, creator, quantity, price, orderType });
    setSelected(null);
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    dispatch({ type: 'CANCEL_ORDER', orderId });
  }, []);

  const closeResult  = useCallback(() => setTradeResult(null), []);
  const goPortfolio  = useCallback(() => { setTradeResult(null); setTab('portfolio'); }, []);

  const pendingCount = state.orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', transition: 'background .25s' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(16,15,28,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
        transition: 'background .25s, border-color .25s',
        boxShadow: '0 2px 16px rgba(123,102,255,0.06)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'var(--purple-grad)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '0 4px 12px rgba(123,102,255,0.35)',
              }}>
                🌽
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>투스닥</div>
                <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 600, letterSpacing: '0.3px' }}>TOOSDAQ</div>
              </div>
            </div>

            {/* Balance chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 보유 강냉이 */}
              <div style={{ background: 'var(--raised)', borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>🌽</span>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500, lineHeight: 1 }}>보유 강냉이</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                    {state.balance.toLocaleString()}
                  </div>
                </div>
              </div>
              {/* 총 자산 */}
              <div style={{ background: 'var(--purple-light)', borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>📊</span>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 600, lineHeight: 1, opacity: 0.8 }}>총 자산</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                    {totalAssets.toLocaleString()}
                  </div>
                </div>
              </div>
              {/* 평가손익 */}
              {pnl !== 0 && (
                <div style={{ background: pnl > 0 ? 'rgba(255,77,106,0.08)' : 'rgba(123,102,255,0.08)', borderRadius: 12, padding: '6px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500, lineHeight: 1 }}>평가손익</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4, color: pnl > 0 ? 'var(--up)' : 'var(--down)' }}>
                    {pnl > 0 ? '+' : ''}{pnl.toLocaleString()}
                    <span style={{ fontSize: 10, marginLeft: 3, opacity: 0.8 }}>({pnlPct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}
              <button className="theme-toggle" onClick={toggleTheme} title={isDark ? '라이트 모드' : '다크 모드'}>
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Tabs — pill style */}
          <div style={{ display: 'flex', gap: 2, paddingBottom: 2 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '9px 18px', fontSize: 14,
                  fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? 'var(--blue)' : 'var(--t3)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'color .15s', borderRadius: 10,
                }}
                onMouseEnter={e => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = 'var(--t2)'; }}
                onMouseLeave={e => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = 'var(--t3)'; }}
              >
                {t.label}
                {(t.id === 'portfolio' || t.id === 'orders') && pendingCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 5, right: 4,
                    minWidth: 16, height: 16, borderRadius: 999,
                    background: 'var(--up)', color: '#fff',
                    fontSize: 9, fontWeight: 800, padding: '0 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{pendingCount}</span>
                )}
                {tab === t.id && (
                  <span style={{ position: 'absolute', bottom: -2, left: 18, right: 18, height: 3, background: 'var(--blue)', borderRadius: 3 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px' }}>
        {tab === 'market'    && <Market    creators={creatorsData} holdings={state.holdings} onOpenTrade={openTrade} livePrices={livePrices} />}
        {tab === 'portfolio' && <Portfolio creators={creatorsData} holdings={state.holdings} balance={state.balance} dividends={state.dividends} orders={state.orders} onOpenTrade={openTrade} onClaimDividend={claimDividend} onCancelOrder={cancelOrder} />}
        {tab === 'orders'    && <Orders    orders={state.orders} onCancelOrder={cancelOrder} />}
        {tab === 'ranking'   && <Ranking   creators={creatorsData} onOpenTrade={openTrade} />}
        {tab === 'history'   && <TransactionHistory transactions={state.transactions} dividends={state.dividends} />}
      </main>

      {selectedCreator && (
        <TradeModal
          creator={selectedCreator} tradeType={tradeType}
          balance={state.balance}
          holding={state.holdings.find(h => h.creatorId === selectedCreator.id)}
          onTrade={handlePlaceOrder} onClose={closeTrade} onSwitchType={setTradeType}
        />
      )}

      {tradeResult && (
        <OrderResultModal result={tradeResult} onClose={closeResult} onGoPortfolio={goPortfolio} />
      )}

      {/* ── 체결 토스트 알림 ── */}
      <div style={{
        position: 'fixed', top: 80, right: 20, zIndex: 100,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {fillToasts.map(t => {
          const isBuy = t.order.type === 'buy';
          const typeColor = isBuy ? 'var(--up)' : 'var(--down)';
          return (
            <div key={t.id} className="fade-in" style={{
              background: 'var(--surface)',
              borderRadius: 18,
              padding: '14px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: `1.5px solid ${isBuy ? 'rgba(255,77,106,0.3)' : 'rgba(49,130,246,0.3)'}`,
              minWidth: 240, maxWidth: 300,
              display: 'flex', alignItems: 'center', gap: 12,
              pointerEvents: 'auto',
            }}>
              {/* 아이콘 */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: isBuy ? 'rgba(255,77,106,0.1)' : 'rgba(49,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {isBuy ? '📈' : '📉'}
              </div>
              {/* 텍스트 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: typeColor, fontWeight: 800, marginBottom: 2 }}>
                  {isBuy ? '매수 체결' : '매도 체결'} 완료!
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.order.creatorEmoji} {t.order.creatorName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {t.order.quantity}주 · {(t.order.filledPrice ?? t.order.limitPrice).toLocaleString()} 🌽
                </div>
              </div>
              {/* 닫기 */}
              <button
                onClick={() => setFillToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 16, padding: 4, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 주문 접수 결과 모달 ── */
function OrderResultModal({
  result, onClose, onGoPortfolio,
}: {
  result: { type: 'buy'|'sell'; creator: Creator; quantity: number; price: number; orderType: 'market'|'limit' };
  onClose: () => void;
  onGoPortfolio: () => void;
}) {
  const isBuy = result.type === 'buy';
  const isMkt = result.orderType === 'market';
  const accentColor = isBuy ? 'var(--up)' : 'var(--down)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,19,54,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="fade-in" style={{
        position: 'relative', background: 'var(--surface)',
        borderRadius: '28px 28px 0 0',
        width: '100%', maxWidth: 520, padding: '32px 28px 40px',
        boxShadow: '0 -8px 40px rgba(123,102,255,0.2)',
      }}>
        {/* 드래그 핸들 */}
        <div style={{ width: 40, height: 4, background: 'var(--raised)', borderRadius: 99, margin: '0 auto 28px' }} />

        {/* 상단 아이콘 + 제목 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'var(--purple-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 34,
            boxShadow: '0 8px 24px rgba(123,102,255,0.35)',
          }}>
            {isMkt ? (isBuy ? '📈' : '📉') : '📋'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.5px' }}>
            주문 접수 완료
          </div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>
            {result.creator.emoji} {result.creator.name}
          </div>
          <div style={{
            display: 'inline-block', marginTop: 10,
            background: 'var(--purple-light)', color: 'var(--blue)',
            borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700,
          }}>
            {isMkt ? '⚡ 곧 자동 체결됩니다' : '⏳ 가격 조건 충족 시 체결'}
          </div>
        </div>

        {/* 주문 상세 */}
        <div style={{ background: 'var(--raised)', borderRadius: 18, padding: '20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: '주문 유형', val: isMkt ? '시장가' : '지정가' },
            { label: '주문 수량', val: `${result.quantity}주` },
            { label: isMkt ? '예상 단가' : '지정 단가', val: `${result.price.toLocaleString()} 🌽` },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--t2)' }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{r.val}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>예약 금액</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: accentColor, fontVariantNumeric: 'tabular-nums' }}>
              {isBuy ? '−' : '+'}{(result.quantity * result.price).toLocaleString()} 🌽
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '15px 0', borderRadius: 999,
            border: '1.5px solid var(--line)', background: 'var(--surface)',
            color: 'var(--t2)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>
            계속 거래
          </button>
          <button onClick={onGoPortfolio} style={{
            flex: 1, padding: '15px 0', borderRadius: 999,
            border: 'none', background: 'var(--purple-grad)',
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(123,102,255,0.4)',
          }}>
            주문 내역 확인
          </button>
        </div>
      </div>
    </div>
  );
}
