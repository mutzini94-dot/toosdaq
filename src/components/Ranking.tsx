import { useState } from 'react';
import { Creator } from '../types';

interface Props {
  creators: Creator[];
  onOpenTrade: (creator: Creator, type: 'buy' | 'sell') => void;
}

type FilterType = 'up' | 'flat' | 'down' | null;

const RANK_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: '#FF9500', bg: 'rgba(255,149,0,0.15)'  },
  2: { color: '#8E8E93', bg: 'rgba(142,142,147,0.12)' },
  3: { color: '#CD7C2F', bg: 'rgba(205,124,47,0.12)'  },
  4: { color: 'var(--t3)', bg: 'var(--raised)' },
  5: { color: 'var(--t3)', bg: 'var(--raised)' },
};

function Badge({ v }: { v: number }) {
  const cls = v > 0 ? 'badge-up' : v < 0 ? 'badge-down' : 'badge-flat';
  const sign = v > 0 ? '▲' : v < 0 ? '▼' : '–';
  return <span className={cls}>{sign} {Math.abs(v).toFixed(2)}%</span>;
}

interface RankCardProps {
  title: string;
  icon: string;
  items: Creator[];
  renderValue: (c: Creator) => React.ReactNode;
  onBuy: (c: Creator) => void;
}

function RankCard({ title, icon, items, renderValue, onBuy }: RankCardProps) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          {icon}
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--t1)' }}>{title}</div>
      </div>
      <div>
        {items.map((c, i) => {
          const rs = RANK_COLORS[i + 1] ?? RANK_COLORS[5];
          return (
            <div
              key={c.id}
              onClick={() => onBuy(c)}
              style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: rs.bg, color: rs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{c.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{c.category}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{renderValue(c)}</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{c.price.toLocaleString()} 🌽</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilteredList({ creators, filter, onOpenTrade, onClose }: {
  creators: Creator[];
  filter: FilterType;
  onOpenTrade: (c: Creator, type: 'buy' | 'sell') => void;
  onClose: () => void;
}) {
  const filtered = creators.filter(c =>
    filter === 'up'   ? c.change > 0  :
    filter === 'flat' ? c.change === 0 :
    c.change < 0
  ).sort((a, b) =>
    filter === 'up' ? b.change - a.change : filter === 'down' ? a.change - b.change : a.name.localeCompare(b.name)
  );

  const title =
    filter === 'up'   ? { label: '상승 종목', color: 'var(--up)' } :
    filter === 'flat' ? { label: '보합 종목', color: 'var(--t2)' } :
                        { label: '하락 종목', color: 'var(--down)' };

  return (
    <div className="card fade-in" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: title.color }}>{title.label}</div>
          <span style={{ fontSize: 13, color: 'var(--t3)' }}>{filtered.length}개 종목</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: 'var(--t2)', cursor: 'pointer', fontWeight: 600 }}
        >닫기</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--t3)', fontSize: 14 }}>해당 종목이 없습니다</div>
      ) : (
        <div>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              style={{ padding: '13px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, transition: 'background .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--raised)', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{c.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{c.category}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{c.price.toLocaleString()} 🌽</div>
                <div style={{ marginTop: 2 }}><Badge v={c.change} /></div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onOpenTrade(c, 'buy')}
                  style={{ background: 'var(--up)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer' }}
                >매수</button>
                <button
                  onClick={() => onOpenTrade(c, 'sell')}
                  style={{ background: 'var(--down)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer' }}
                >매도</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Ranking({ creators, onOpenTrade }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  const gainers   = [...creators].sort((a, b) => b.change - a.change).slice(0, 5);
  const losers    = [...creators].sort((a, b) => a.change - b.change).slice(0, 5);
  const byVolume  = [...creators].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const byCap     = [...creators].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5);

  const upCnt   = creators.filter(c => c.change > 0).length;
  const flatCnt = creators.filter(c => c.change === 0).length;
  const dnCnt   = creators.filter(c => c.change < 0).length;

  const breadth = [
    { key: 'up'   as FilterType, label: '상승 종목', value: upCnt,   color: 'var(--up)'   },
    { key: 'flat' as FilterType, label: '보합 종목', value: flatCnt, color: 'var(--t2)'   },
    { key: 'down' as FilterType, label: '하락 종목', value: dnCnt,   color: 'var(--down)' },
  ];

  const handleFilter = (key: FilterType) => {
    setActiveFilter(prev => prev === key ? null : key);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Market breadth summary — clickable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {breadth.map(s => {
          const isActive = activeFilter === s.key;
          return (
            <div
              key={s.label}
              className="card"
              onClick={() => handleFilter(s.key)}
              style={{
                padding: '18px 20px', textAlign: 'center', cursor: 'pointer',
                border: isActive ? `2px solid ${s.color}` : '2px solid transparent',
                transition: 'border .15s, background .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6 }}>{s.label}</div>
              {isActive && <div style={{ fontSize: 10, color: s.color, marginTop: 4, fontWeight: 600 }}>▼ 목록 보기</div>}
            </div>
          );
        })}
      </div>

      {/* Filtered list (shown when a breadth card is clicked) */}
      {activeFilter && (
        <FilteredList
          creators={creators}
          filter={activeFilter}
          onOpenTrade={onOpenTrade}
          onClose={() => setActiveFilter(null)}
        />
      )}

      {/* 4 rank cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <RankCard
          title="상승률 TOP 5" icon="🚀"
          items={gainers}
          renderValue={c => <Badge v={c.change} />}
          onBuy={c => onOpenTrade(c, 'buy')}
        />
        <RankCard
          title="하락률 TOP 5" icon="📉"
          items={losers}
          renderValue={c => <Badge v={c.change} />}
          onBuy={c => onOpenTrade(c, 'buy')}
        />
        <RankCard
          title="거래량 TOP 5" icon="🔥"
          items={byVolume}
          renderValue={c => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--blue)', fontSize: 14, fontWeight: 700 }}>
              {c.volume.toLocaleString()}주
            </span>
          )}
          onBuy={c => onOpenTrade(c, 'buy')}
        />
        <RankCard
          title="시가총액 TOP 5" icon="👑"
          items={byCap}
          renderValue={c => (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#FF9500', fontSize: 14, fontWeight: 700 }}>
              {c.marketCap >= 1e9 ? `${(c.marketCap/1e9).toFixed(1)}B` : `${(c.marketCap/1e6).toFixed(0)}M`} 🌽
            </span>
          )}
          onBuy={c => onOpenTrade(c, 'buy')}
        />
      </div>
    </div>
  );
}
