import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts';
import { Creator, Holding } from '../types';
import { TOOSDAQ_INDEX_HISTORY, calcAnnualYield } from '../data/creators';

interface Props {
  creators: Creator[];
  holdings: Holding[];
  onOpenTrade: (c: Creator, t: 'buy' | 'sell') => void;
  livePrices: Record<number, number>;
}

const PALETTE = [
  '#FF6B6B','#FF9500','#AF52DE','#007AFF','#34C759',
  '#FF2D55','#5AC8FA','#FF3B30','#FFCC00','#5856D6',
];

function Avatar({ c, size = 36 }: { c: Creator; size?: number }) {
  const bg = PALETTE[(c.id - 1) % PALETTE.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg + '22', border: `1.5px solid ${bg}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.48, flexShrink: 0,
    }}>
      {c.emoji}
    </div>
  );
}

function Badge({ v, large }: { v: number; large?: boolean }) {
  const cls  = v > 0 ? 'badge-up' : v < 0 ? 'badge-down' : 'badge-flat';
  const sign = v > 0 ? '▲' : v < 0 ? '▼' : '–';
  return (
    <span className={cls} style={large ? { fontSize: 13, padding: '4px 10px' } : {}}>
      {sign} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function Spark({ c }: { c: Creator }) {
  const color = c.change >= 0 ? 'var(--up)' : 'var(--down)';
  return (
    <div style={{ width: 64, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={c.history.slice(-10)}>
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function IdxTip({ active, payload, label }: { active?: boolean; payload?: Array<{value:number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--t1)', boxShadow: 'var(--shadow)' }}>
      <div style={{ color: 'var(--t2)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{payload[0].value.toLocaleString()}</div>
    </div>
  );
}

function IndexSection({ creators }: { creators: Creator[] }) {
  const data   = TOOSDAQ_INDEX_HISTORY;
  const cur    = data[data.length - 1].value;
  const prev   = data[data.length - 2].value;
  const dayPct = ((cur - prev) / prev) * 100;
  const moPct  = ((cur - data[0].value) / data[0].value) * 100;
  const isUp   = dayPct >= 0;
  const color  = isUp ? 'var(--up)' : 'var(--down)';
  const max    = Math.max(...data.map(d => d.value));
  const min    = Math.min(...data.map(d => d.value));
  const upCnt  = creators.filter(c => c.change > 0).length;
  const dnCnt  = creators.filter(c => c.change < 0).length;
  const total  = creators.length;
  const chartData = data.map((d, i) => ({ ...d, lbl: i % 6 === 0 ? d.date : '' }));

  return (
    <div className="card" style={{ padding: 24, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="live" />
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 500 }}>TOOSDAQ 종합지수</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--t1)' }}>
            {cur.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <Badge v={dayPct} large />
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>전일 대비</span>
            <span style={{ fontSize: 12, color: 'var(--line)' }}>|</span>
            <Badge v={moPct} large />
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>30일 대비</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
          {[
            { label: '30일 고점', value: max.toLocaleString() },
            { label: '30일 저점', value: min.toLocaleString() },
            { label: '상장 종목', value: `${total}개` },
            { label: '시가총액',  value: `${(creators.reduce((s,c)=>s+c.marketCap,0)/1e9).toFixed(1)}B` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={isUp ? '#F04452' : '#3182F6'} stopOpacity={0.18} />
                <stop offset="100%" stopColor={isUp ? '#F04452' : '#3182F6'} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="lbl" tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} width={48}
              domain={[min * 0.97, max * 1.02]}
              tickFormatter={v => (v/1000).toFixed(1)+'K'}
            />
            <Tooltip content={<IdxTip />} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              fill="url(#idxGrad)" dot={false}
              activeDot={{ r: 4, fill: isUp ? '#F04452' : '#3182F6', stroke: 'var(--surface)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breadth bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--up)', fontWeight: 600, width: 42, textAlign: 'right' }}>상승 {upCnt}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--raised)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(upCnt/total)*100}%`, background: 'var(--up)',   borderRadius: '99px 0 0 99px', transition: 'width .6s' }} />
          <div style={{ width: `${(dnCnt/total)*100}%`, background: 'var(--down)', borderRadius: '0 99px 99px 0', transition: 'width .6s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--down)', fontWeight: 600, width: 42 }}>하락 {dnCnt}</span>
      </div>
    </div>
  );
}

function GainerCard({ c, onOpenTrade }: { c: Creator; onOpenTrade: Props['onOpenTrade'] }) {
  return (
    <div
      onClick={() => onOpenTrade(c, 'buy')}
      className="card-raised"
      style={{ flex: 1, minWidth: 0, padding: '14px 16px', cursor: 'pointer', transition: 'background .12s, box-shadow .12s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Avatar c={c} size={32} />
        <Spark c={c} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 3 }}>{c.name}</div>
      <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
        {c.price.toLocaleString()} 🌽
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge v={c.change} />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', background: 'rgba(123,102,255,0.1)', borderRadius: 4, padding: '2px 6px' }}>
          배당 {calcAnnualYield(c).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function PopularRow({ c, rank, onOpenTrade }: { c: Creator; rank: number; onOpenTrade: Props['onOpenTrade'] }) {
  const rankColor = rank === 1 ? '#FF9500' : rank === 2 ? 'var(--t2)' : rank === 3 ? '#CD7C2F' : 'var(--t3)';
  return (
    <div
      className="row-divider hover-row"
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      onClick={() => onOpenTrade(c, 'buy')}
    >
      <span style={{ width: 18, fontSize: 13, fontWeight: 800, color: rankColor, textAlign: 'center', flexShrink: 0 }}>{rank}</span>
      <Avatar c={c} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>{c.name}</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{c.category}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>
          {c.price.toLocaleString()}
          <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 2 }}>🌽</span>
        </div>
        <div style={{ marginTop: 3 }}><Badge v={c.change} /></div>
      </div>
    </div>
  );
}

function MoverRow({ c, rank, onOpenTrade }: { c: Creator; rank: number; onOpenTrade: Props['onOpenTrade'] }) {
  const rankColor = rank === 1 ? '#FF9500' : rank <= 3 ? 'var(--t2)' : 'var(--t3)';
  return (
    <div
      className="row-divider hover-row"
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      onClick={() => onOpenTrade(c, 'buy')}
    >
      <span style={{ width: 16, fontSize: 12, fontWeight: 800, color: rankColor, flexShrink: 0 }}>{rank}</span>
      <Avatar c={c} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{c.price.toLocaleString()} 🌽</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Badge v={c.change} />
        <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700, marginTop: 3 }}>배당 {calcAnnualYield(c).toFixed(1)}%</div>
      </div>
    </div>
  );
}

export default function Market({ creators, holdings: _h, onOpenTrade, livePrices: _lp }: Props) {
  const byChange = useMemo(() => [...creators].sort((a,b) => b.change - a.change), [creators]);
  const byVolume = useMemo(() => [...creators].sort((a,b) => b.volume - a.volume), [creators]);
  const byMover  = useMemo(() => [...creators].sort((a,b) => Math.abs(b.change) - Math.abs(a.change)), [creators]);
  const newList  = creators.filter(c => c.ipoPrice <= 2000);

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

      {/* Left */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <IndexSection creators={creators} />

        {/* 급상승 */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>오늘의 급상승</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>상승률 기준 TOP 3</div>
            </div>
            <button style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>전체보기</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {byChange.slice(0, 3).map(c => <GainerCard key={c.id} c={c} onOpenTrade={onOpenTrade} />)}
          </div>
        </div>

        {/* 인기 크리에이터 */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>실시간 인기 크리에이터</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>거래량 기준 TOP 5</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 }}>
            {byVolume.slice(0, 4).map((c, i) => (
              <PopularRow key={c.id} c={c} rank={i + 1} onOpenTrade={onOpenTrade} />
            ))}
          </div>
          {byVolume[4] && <PopularRow c={byVolume[4]} rank={5} onOpenTrade={onOpenTrade} />}
        </div>

        {/* 신규 상장 */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: newList.length > 0 ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥇</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>신규 상장 크리에이터</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>이번 주 {newList.length}명의 루키가 상장됐어요</div>
              </div>
            </div>
            <button style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>전체보기</button>
          </div>
          {newList.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {newList.map(c => (
                <div
                  key={c.id}
                  onClick={() => onOpenTrade(c, 'buy')}
                  className="card-raised"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', flexShrink: 0, cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <Avatar c={c} size={30} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>공모가 {c.ipoPrice.toLocaleString()} 🌽</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ width: 240, flexShrink: 0, position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* TOP 5 MOVERS */}
        <div className="card" style={{ padding: '20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏆</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--t1)' }}>TOP 5 MOVERS</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>절대 등락률 기준</div>
            </div>
          </div>
          {byMover.slice(0, 5).map((c, i) => (
            <MoverRow key={c.id} c={c} rank={i + 1} onOpenTrade={onOpenTrade} />
          ))}
        </div>

        {/* 시장 요약 */}
        <div className="card" style={{ padding: '20px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t2)', marginBottom: 14, letterSpacing: '0.04em' }}>시장 요약</div>
          {[
            { label: '상장 종목', val: `${creators.length}개`,                                                    color: 'var(--t1)'   },
            { label: '상승 종목', val: `${creators.filter(c=>c.change>0).length}개`,                             color: 'var(--up)'   },
            { label: '하락 종목', val: `${creators.filter(c=>c.change<0).length}개`,                             color: 'var(--down)' },
            { label: '총 거래량', val: `${creators.reduce((s,c)=>s+c.volume,0).toLocaleString()}주`,             color: 'var(--t1)'   },
            { label: '시가총액',  val: `${(creators.reduce((s,c)=>s+c.marketCap,0)/1e9).toFixed(1)}B 🌽`,       color: 'var(--t1)'   },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
            </div>
          ))}
          <button
            onClick={() => onOpenTrade(byMover[0], 'buy')}
            style={{ marginTop: 4, width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--blue)', color: '#fff', fontWeight: 700, fontSize: 14, transition: 'opacity .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            🌽 투자하기
          </button>
        </div>
      </div>
    </div>
  );
}
